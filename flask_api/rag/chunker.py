"""
chunker.py — Split extracted text into overlapping chunks for RAG retrieval.
Uses a sliding window approach with configurable size and overlap.
"""
from typing import List


def chunk_text(
    text: str,
    chunk_size: int = 400,
    overlap: int = 80
) -> List[str]:
    """
    Split text into overlapping chunks of approximately chunk_size characters.
    
    Args:
        text: The raw extracted text to chunk.
        chunk_size: Target size of each chunk in characters.
        overlap: Number of characters to overlap between adjacent chunks.
    
    Returns:
        List of text chunk strings.
    """
    if not text or not text.strip():
        return []

    # Split by lines first to respect natural boundaries
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    chunks = []
    current_chunk = []
    current_len = 0

    for line in lines:
        line_len = len(line) + 1  # +1 for newline

        if current_len + line_len > chunk_size and current_chunk:
            # Save current chunk
            chunks.append("\n".join(current_chunk))

            # Calculate how many lines to keep for overlap
            overlap_chars = 0
            overlap_lines = []
            for prev_line in reversed(current_chunk):
                overlap_chars += len(prev_line) + 1
                overlap_lines.insert(0, prev_line)
                if overlap_chars >= overlap:
                    break

            current_chunk = overlap_lines
            current_len = sum(len(l) + 1 for l in current_chunk)

        current_chunk.append(line)
        current_len += line_len

    # Don't forget the last chunk
    if current_chunk:
        chunks.append("\n".join(current_chunk))

    # Filter out very short chunks (less than 20 chars) — noise
    chunks = [c for c in chunks if len(c.strip()) >= 20]

    return chunks


def chunk_multiple_sources(sources: dict) -> List[dict]:
    """
    Chunk multiple text sources and tag each chunk with its source.
    
    Args:
        sources: dict like { "pptx": "...", "image": "..." }
    
    Returns:
        List of dicts: [{ "text": "...", "source": "pptx" }, ...]
    """
    all_chunks = []
    for source_name, text in sources.items():
        if text and text.strip():
            chunks = chunk_text(text)
            for chunk in chunks:
                all_chunks.append({
                    "text": chunk,
                    "source": source_name
                })
    return all_chunks
