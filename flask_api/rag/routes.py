"""
routes.py — Flask Blueprint for the RAG pipeline endpoints.

Endpoints:
  POST /rag/upload         — Upload PPTX + image, extract, chunk, embed, store
  POST /rag/query          — Query RAG store for relevant context
  POST /rag/generate-ppt   — Full PPT generation with RAG context (Groq)
  POST /rag/edit-slide     — Edit a single slide with RAG context (Groq)
  GET  /rag/status         — Check if a session has RAG data
  GET  /rag/store-stats    — Admin stats (session count etc.)
"""
import os
import json
from flask import Blueprint, request, jsonify

import base64
from imagekitio import ImageKit
from .extractor import extract_pptx_text, extract_image_text
from .chunker import chunk_multiple_sources
from .embedder import embed_chunks, embed_query, cosine_search, format_rag_context
from .store import store_session, get_session, has_session, delete_session, get_store_stats
from .llm import (
    generate_outline_with_groq,
    generate_slide_with_groq,
    edit_slide_with_groq
)

rag_bp = Blueprint("rag", __name__, url_prefix="/rag")

# ─── Initialize ImageKit ──────────────────────────────────────────────────────
imagekit = None
try:
    if os.getenv("IMAGEKIT_PUBLIC_KEY"):
        imagekit = ImageKit(
            public_key=os.getenv("IMAGEKIT_PUBLIC_KEY"),
            private_key=os.getenv("IMAGEKIT_PRIVATE_KEY"),
            url_endpoint=os.getenv("IMAGEKIT_URL_ENDPOINT")
        )
except Exception as e:
    print(f"Failed to initialize ImageKit: {e}")


# ─── /rag/upload ─────────────────────────────────────────────────────────────

@rag_bp.route("/upload", methods=["POST"])
def rag_upload():
    """
    Upload reference PPTX and/or image files.
    Extracts text, chunks it, embeds it, and stores it for the session.
    Also uploads original files to ImageKit for persistence.
    
    Form data:
        reference (file, optional): .pptx reference file
        image (file, optional):     context image
        session_id (str):           user session identifier
    
    Returns:
        { success, session_id, chunk_count, sources, urls }
    """
    session_id = request.form.get("session_id") or request.headers.get("x-session-id", "default")

    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    sources = {}
    urls = {}

    # ── Extract & Upload PPTX ─────────────────────────────────────────────────
    reference_file = request.files.get("reference")
    if reference_file and reference_file.filename:
        filename = reference_file.filename.lower()
        if filename.endswith(".pptx") or filename.endswith(".ppt"):
            try:
                pptx_bytes = reference_file.read()
                
                # Upload to ImageKit
                if imagekit:
                    upload_res = imagekit.upload(
                        file=base64.b64encode(pptx_bytes).decode('utf-8'),
                        file_name=reference_file.filename,
                        folder="/rag_references/"
                    )
                    urls["pptx"] = upload_res.url
                
                pptx_text = extract_pptx_text(pptx_bytes)
                if pptx_text.strip():
                    sources["pptx"] = pptx_text
                    print(f"[RAG Upload] Extracted {len(pptx_text)} chars from PPTX")
            except Exception as e:
                print(f"[RAG Upload] PPTX error: {e}")
        else:
            return jsonify({"error": "Reference file must be .pptx or .ppt"}), 400

    # ── Extract & Upload Image ────────────────────────────────────────────────
    image_file = request.files.get("image")
    if image_file and image_file.filename:
        try:
            img_bytes = image_file.read()
            fname = image_file.filename.lower()
            
            # Upload to ImageKit
            if imagekit:
                upload_res = imagekit.upload(
                    file=base64.b64encode(img_bytes).decode('utf-8'),
                    file_name=image_file.filename,
                    folder="/rag_references/"
                )
                urls["image"] = upload_res.url
                
            # Determine MIME type
            if fname.endswith(".png"):
                mime = "image/png"
            elif fname.endswith(".webp"):
                mime = "image/webp"
            elif fname.endswith(".gif"):
                mime = "image/gif"
            else:
                mime = "image/jpeg"

            img_text = extract_image_text(img_bytes, mime)
            if img_text.strip():
                sources["image"] = img_text
                print(f"[RAG Upload] Extracted {len(img_text)} chars from image")
        except Exception as e:
            print(f"[RAG Upload] Image error: {e}")

    if not sources:
        return jsonify({
            "success": True,
            "session_id": session_id,
            "chunk_count": 0,
            "sources": [],
            "urls": urls,
            "message": "No content extracted. Proceeding without RAG context."
        })

    # ── Chunk → Embed → Store ────────────────────────────────────────────────
    all_chunks = chunk_multiple_sources(sources)
    chunk_texts = [c["text"] for c in all_chunks]
    vectors = embed_chunks(chunk_texts)

    store_session(session_id, all_chunks, vectors)

    return jsonify({
        "success": True,
        "session_id": session_id,
        "chunk_count": len(all_chunks),
        "sources": list(sources.keys()),
        "urls": urls,
        "message": f"RAG indexed {len(all_chunks)} chunks from {list(sources.keys())}"
    })


# ─── /rag/query ──────────────────────────────────────────────────────────────

@rag_bp.route("/query", methods=["POST"])
def rag_query():
    """
    Query the RAG store for context relevant to a prompt.
    
    JSON body:
        prompt (str):      the query text
        session_id (str):  user session identifier
        top_k (int):       number of chunks to retrieve (default 5)
    
    Returns:
        { context: "...", chunk_count: N, has_rag: bool }
    """
    data = request.get_json(silent=True) or {}
    prompt = data.get("prompt", "").strip()
    session_id = data.get("session_id") or request.headers.get("x-session-id", "")
    top_k = int(data.get("top_k", 5))

    if not session_id:
        return jsonify({"error": "session_id is required"}), 400

    session_data = get_session(session_id)
    if not session_data:
        return jsonify({
            "context": "",
            "chunk_count": 0,
            "has_rag": False,
            "message": "No RAG data found for this session."
        })

    chunks, vectors = session_data

    if not prompt:
        # Return all chunks as context if no specific prompt
        context = format_rag_context(chunks[:top_k])
        return jsonify({"context": context, "chunk_count": len(chunks), "has_rag": True})

    # Embed query and search
    query_vec = embed_query(prompt)
    retrieved = cosine_search(query_vec, vectors, chunks, top_k=top_k)
    context = format_rag_context(retrieved)

    return jsonify({
        "context": context,
        "chunk_count": len(retrieved),
        "has_rag": True
    })


# ─── /rag/generate-outline ────────────────────────────────────────────────────

@rag_bp.route("/generate-outline", methods=["POST", "OPTIONS"])
def rag_generate_outline():
    if request.method == "OPTIONS":
        return jsonify({"ok": True})
    """
    Generate an outline for the PPT using Groq with RAG context injected.
    
    JSON body:
        prompt (str):          presentation topic/description
        slide_count (int):     number of slides (default 8)
        session_id (str):      user session (for RAG lookup)
        style_guide (dict):    optional style reference
        structure (str):       optional structure type
        top_k (int):           chunks to retrieve (default 6)
    
    Returns:
        { outline: [...] }
    """
    data = request.get_json(silent=True) or {}
    prompt = data.get("prompt", "").strip()
    slide_count = int(data.get("slide_count", 8))
    session_id = data.get("session_id") or request.headers.get("x-session-id", "")
    style_guide = data.get("style_guide")
    structure = data.get("structure")
    top_k = int(data.get("top_k", 6))

    if not prompt:
        return jsonify({"error": "prompt is required"}), 400

    # ── Retrieve RAG Context ──────────────────────────────────────────────────
    rag_context = ""
    if session_id:
        session_data = get_session(session_id)
        if session_data:
            chunks, vectors = session_data
            query_vec = embed_query(prompt)
            retrieved = cosine_search(query_vec, vectors, chunks, top_k=top_k)
            rag_context = format_rag_context(retrieved)
            print(f"[RAG Outline] Retrieved {len(retrieved)} chunks for session '{session_id}'")

    # ── Generate Outline ──────────────────────────────────────────────────────
    try:
        outline = generate_outline_with_groq(
            prompt=prompt,
            slide_count=slide_count,
            style_guide=style_guide,
            structure=structure,
            rag_context=rag_context
        )
        return jsonify({"success": True, "outline": outline, "has_rag": bool(rag_context)})
    except Exception as e:
        return jsonify({"error": f"Outline generation failed: {str(e)}"}), 500


# ─── /rag/generate-slide ──────────────────────────────────────────────────────

@rag_bp.route("/generate-slide", methods=["POST", "OPTIONS"])
def rag_generate_slide():
    if request.method == "OPTIONS":
        return jsonify({"ok": True})
    """
    Generate a single slide using Groq with RAG context.
    
    JSON body:
        topic (str):           presentation topic
        outline (list):        the full outline array
        slide_index (int):     index of the slide to generate
        session_id (str):      user session (for RAG lookup)
        style_guide (dict):    optional style reference
    
    Returns:
        { slide: {...} }
    """
    data = request.get_json(silent=True) or {}
    topic = data.get("topic", "").strip()
    outline = data.get("outline", [])
    slide_index = int(data.get("slide_index", 0))
    session_id = data.get("session_id") or request.headers.get("x-session-id", "")
    style_guide = data.get("style_guide")

    if not topic or not outline:
        return jsonify({"error": "topic and outline are required"}), 400

    # ── Re-query RAG Context for this specific slide ──────────────────────────
    rag_context = ""
    if session_id and slide_index < len(outline):
        slide_title = outline[slide_index].get("title", "")
        slide_query = f"{topic} {slide_title}"
        session_data = get_session(session_id)
        if session_data:
            chunks, vectors = session_data
            q_vec = embed_query(slide_query)
            retrieved = cosine_search(q_vec, vectors, chunks, top_k=4)
            rag_context = format_rag_context(retrieved)

    try:
        slide = generate_slide_with_groq(
            topic=topic,
            outline=outline,
            slide_index=slide_index,
            style_guide=style_guide,
            rag_context=rag_context
        )
        return jsonify({"success": True, "slide": slide, "has_rag": bool(rag_context)})
    except Exception as e:
        print(f"[RAG Slide {slide_index}] Error: {e}")
        # Fallback minimal slide
        fallback = {
            "type": outline[slide_index].get("type", "content") if slide_index < len(outline) else "content",
            "title": outline[slide_index].get("title", f"Slide {slide_index+1}") if slide_index < len(outline) else "Error",
            "bullets": [outline[slide_index].get("description", "Error generating slide content.")] if slide_index < len(outline) else ["Error"]
        }
        return jsonify({"success": False, "slide": fallback, "has_rag": bool(rag_context)})


# ─── /rag/edit-slide ─────────────────────────────────────────────────────────

@rag_bp.route("/edit-slide", methods=["POST"])
def rag_edit_slide():
    """
    Edit a single slide using Groq with RAG context.
    Called when the user uses the AI edit command bar on a slide.
    
    JSON body:
        prompt (str):      edit instruction
        slide (dict):      the current slide data
        session_id (str):  user session (for RAG lookup)
    
    Returns:
        { slide: {...} }
    """
    data = request.get_json(silent=True) or {}
    prompt = data.get("prompt", "").strip()
    slide = data.get("slide", {})
    session_id = data.get("session_id") or request.headers.get("x-session-id", "")

    if not prompt:
        return jsonify({"error": "prompt is required"}), 400
    if not slide:
        return jsonify({"error": "slide data is required"}), 400

    # ── Retrieve RAG Context ──────────────────────────────────────────────────
    rag_context = ""
    if session_id:
        session_data = get_session(session_id)
        if session_data:
            chunks, vectors = session_data
            slide_topic = slide.get("title", "") + " " + prompt
            q_vec = embed_query(slide_topic)
            retrieved = cosine_search(q_vec, vectors, chunks, top_k=3)
            rag_context = format_rag_context(retrieved)

    try:
        updated_slide = edit_slide_with_groq(
            edit_prompt=prompt,
            slide=slide,
            rag_context=rag_context
        )
        return jsonify({
            "success": True,
            "slide": updated_slide,
            "has_rag": bool(rag_context)
        })
    except Exception as e:
        return jsonify({"error": f"Slide edit failed: {str(e)}"}), 500


# ─── /rag/status ─────────────────────────────────────────────────────────────

@rag_bp.route("/status", methods=["GET"])
def rag_status():
    """Check if a session has RAG data available."""
    session_id = request.args.get("session_id") or request.headers.get("x-session-id", "")
    return jsonify({
        "has_rag": has_session(session_id) if session_id else False,
        "session_id": session_id
    })


# ─── /rag/store-stats ────────────────────────────────────────────────────────

@rag_bp.route("/store-stats", methods=["GET"])
def rag_store_stats():
    """Return RAG store statistics."""
    return jsonify(get_store_stats())


# ─── /rag/clear ──────────────────────────────────────────────────────────────

@rag_bp.route("/clear", methods=["DELETE", "POST"])
def rag_clear():
    """Clear RAG data for a session."""
    data = request.get_json(silent=True) or {}
    session_id = data.get("session_id") or request.args.get("session_id") or request.headers.get("x-session-id", "")
    if session_id:
        delete_session(session_id)
        return jsonify({"success": True, "message": f"Session '{session_id}' cleared."})
    return jsonify({"error": "session_id required"}), 400
