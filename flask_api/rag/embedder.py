"""
embedder.py — Embed text chunks using sentence-transformers and perform
cosine similarity search for RAG retrieval.

Uses the lightweight all-MiniLM-L6-v2 model (~90MB) which loads once
and is reused across all requests.
"""
import numpy as np
from typing import List, Tuple

# ─── Lazy model loading ───────────────────────────────────────────────────────
_model = None
_model_load_error = None


def _get_model():
    """Lazily load the sentence-transformer model once."""
    global _model, _model_load_error
    if _model is not None:
        return _model
    if _model_load_error:
        return None
    try:
        from sentence_transformers import SentenceTransformer
        print("[RAG] Loading sentence-transformers model (all-MiniLM-L6-v2)...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("[RAG] Sentence-transformers model loaded successfully.")
        return _model
    except Exception as e:
        _model_load_error = str(e)
        print(f"[RAG] WARNING: Failed to load sentence-transformers: {e}")
        return None


# ─── Embedding ────────────────────────────────────────────────────────────────

def embed_chunks(chunks: List[str]) -> np.ndarray:
    """
    Embed a list of text strings into vectors.
    
    Returns:
        numpy array of shape (len(chunks), embedding_dim)
        Returns empty array if model unavailable.
    """
    if not chunks:
        return np.array([])

    model = _get_model()
    if model is None:
        # Fallback: return empty so we gracefully skip RAG
        return np.array([])

    try:
        embeddings = model.encode(chunks, convert_to_numpy=True, show_progress_bar=False)
        return embeddings
    except Exception as e:
        print(f"[RAG] Embedding failed: {e}")
        return np.array([])


def embed_query(query: str) -> np.ndarray:
    """Embed a single query string."""
    model = _get_model()
    if model is None:
        return np.array([])
    try:
        return model.encode([query], convert_to_numpy=True, show_progress_bar=False)[0]
    except Exception as e:
        print(f"[RAG] Query embedding failed: {e}")
        return np.array([])


# ─── Cosine Search ────────────────────────────────────────────────────────────

def cosine_search(
    query_vec: np.ndarray,
    chunk_vecs: np.ndarray,
    chunks: List[dict],
    top_k: int = 5
) -> List[dict]:
    """
    Retrieve top-K most similar chunks using cosine similarity.
    
    Args:
        query_vec: Embedding of the query (1D array).
        chunk_vecs: Embeddings of all stored chunks (2D array).
        chunks: List of chunk dicts with 'text' and 'source' keys.
        top_k: Number of top results to return.
    
    Returns:
        List of chunk dicts sorted by relevance (most relevant first).
    """
    if query_vec.size == 0 or chunk_vecs.size == 0:
        return []

    # Normalize vectors
    q_norm = query_vec / (np.linalg.norm(query_vec) + 1e-10)
    c_norms = chunk_vecs / (np.linalg.norm(chunk_vecs, axis=1, keepdims=True) + 1e-10)

    # Cosine similarity
    similarities = c_norms @ q_norm

    # Get top-K indices
    top_indices = np.argsort(similarities)[::-1][:top_k]

    results = []
    for idx in top_indices:
        if similarities[idx] > 0.15:  # Minimum relevance threshold
            chunk = chunks[idx].copy()
            chunk["score"] = float(similarities[idx])
            results.append(chunk)

    return results


def format_rag_context(retrieved_chunks: List[dict]) -> str:
    """
    Format retrieved chunks into a clean context string for the LLM prompt.
    """
    if not retrieved_chunks:
        return ""

    parts = ["=== REFERENCE CONTENT (use this to inform the presentation) ==="]
    for i, chunk in enumerate(retrieved_chunks, 1):
        source_label = chunk.get("source", "reference").upper()
        parts.append(f"\n[{source_label} - Chunk {i}]")
        parts.append(chunk["text"])

    parts.append("\n=== END OF REFERENCE CONTENT ===")
    return "\n".join(parts)
