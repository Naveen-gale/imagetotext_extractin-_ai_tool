"""
store.py — In-memory session store for RAG chunks and embeddings.

Stores per-session RAG data with automatic TTL-based eviction.
No disk writes needed — fully in-memory for Render compatibility.
"""
import time
import threading
import numpy as np
from typing import Optional, Dict, List, Tuple

# ─── Store Structure ──────────────────────────────────────────────────────────
# { session_id: { "chunks": [...], "vectors": np.ndarray, "created_at": float } }

_store: Dict[str, dict] = {}
_lock = threading.RLock()
SESSION_TTL_SECONDS = 2 * 60 * 60  # 2 hours


# ─── Store Operations ─────────────────────────────────────────────────────────

def store_session(session_id: str, chunks: List[dict], vectors: np.ndarray) -> None:
    """
    Save chunks and their embeddings for a session.
    Overwrites any existing data for the same session.
    """
    with _lock:
        _store[session_id] = {
            "chunks": chunks,
            "vectors": vectors,
            "created_at": time.time()
        }
        print(f"[RAG Store] Stored {len(chunks)} chunks for session '{session_id}'")


def get_session(session_id: str) -> Optional[Tuple[List[dict], np.ndarray]]:
    """
    Retrieve chunks and vectors for a session.
    Returns None if session not found or expired.
    """
    with _lock:
        entry = _store.get(session_id)
        if not entry:
            return None
        
        # Check TTL
        age = time.time() - entry["created_at"]
        if age > SESSION_TTL_SECONDS:
            del _store[session_id]
            print(f"[RAG Store] Session '{session_id}' expired, removed.")
            return None
        
        return entry["chunks"], entry["vectors"]


def delete_session(session_id: str) -> None:
    """Explicitly delete a session's RAG data."""
    with _lock:
        if session_id in _store:
            del _store[session_id]
            print(f"[RAG Store] Deleted session '{session_id}'")


def has_session(session_id: str) -> bool:
    """Check if a session has RAG data available."""
    result = get_session(session_id)
    return result is not None


def get_store_stats() -> dict:
    """Return stats about the current store state."""
    with _lock:
        now = time.time()
        active = sum(
            1 for v in _store.values()
            if (now - v["created_at"]) <= SESSION_TTL_SECONDS
        )
        return {
            "total_sessions": len(_store),
            "active_sessions": active,
        }


# ─── Background TTL Cleanup ───────────────────────────────────────────────────

def _cleanup_expired():
    """Remove expired sessions from the store."""
    with _lock:
        now = time.time()
        expired_keys = [
            sid for sid, data in _store.items()
            if (now - data["created_at"]) > SESSION_TTL_SECONDS
        ]
        for key in expired_keys:
            del _store[key]
        if expired_keys:
            print(f"[RAG Store] Cleanup: removed {len(expired_keys)} expired sessions.")


def start_cleanup_thread(interval_seconds: int = 1800) -> None:
    """Start a background thread to periodically clean up expired sessions."""
    def _run():
        while True:
            time.sleep(interval_seconds)
            _cleanup_expired()

    t = threading.Thread(target=_run, daemon=True)
    t.start()
    print(f"[RAG Store] Cleanup thread started (interval={interval_seconds}s)")
