"""
RAG (Retrieval-Augmented Generation) blueprint for the AI PPT Flask API.
Handles: upload → extract → chunk → embed → query → generate with context.
"""
from .routes import rag_bp

__all__ = ["rag_bp"]
