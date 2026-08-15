"""
llm.py — Groq LLM integration with RAG context injection.

Generates PPT outlines and individual slides using Groq (llama-3.3-70b-versatile).
Injects RAG context retrieved from uploaded PPTX/images into the system prompt.

Output format mirrors exactly what the Node.js backend returns so the frontend
requires zero changes.
"""
import os
import json
import re
from typing import Optional, List
from groq import Groq

# ─── Groq Client ─────────────────────────────────────────────────────────────
_groq_client: Optional[Groq] = None


def _get_client() -> Groq:
    global _groq_client
    if _groq_client is None:
        api_key = os.environ.get("GROQ_API_KEY", "")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY environment variable is not set.")
        _groq_client = Groq(api_key=api_key)
    return _groq_client


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _parse_json_from_response(text: str) -> any:
    """Extract and parse JSON from an LLM response that may have extra text."""
    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Strip markdown code fences
    cleaned = re.sub(r"```(?:json)?\s*", "", text)
    cleaned = cleaned.replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Find JSON array or object
    for pattern in (r"\[.*\]", r"\{.*\}"):
        match = re.search(pattern, cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                continue

    raise ValueError(f"Could not parse JSON from response: {text[:300]}")


# ─── Outline Generation ───────────────────────────────────────────────────────

def generate_outline_with_groq(
    prompt: str,
    slide_count: int = 8,
    style_guide: Optional[dict] = None,
    structure: Optional[str] = None,
    rag_context: str = ""
) -> List[dict]:
    """
    Generate a presentation outline using Groq with optional RAG context.
    
    Returns a list of slide outline objects:
    [{ "title": "...", "type": "...", "description": "..." }, ...]
    """
    client = _get_client()

    style_hint = ""
    if style_guide:
        style_hint = f"\nStyle guide from reference: {json.dumps(style_guide)}"

    structure_hint = ""
    if structure:
        structure_hint = f"\nPresentation structure: {structure}"

    rag_section = ""
    if rag_context:
        rag_section = f"""

{rag_context}

IMPORTANT: The reference content above contains real material from uploaded files.
Use it to:
- Mirror the depth, terminology, and key topics from the reference
- Structure sections similarly to the uploaded presentation (if applicable)
- Incorporate key data points, concepts, or themes from the reference
- Maintain the GPT-style professional quality seen in the reference
"""

    system_prompt = f"""You are an expert presentation architect. Create a concise, professional outline for a PowerPoint presentation.
{style_hint}{structure_hint}{rag_section}

Return ONLY a valid JSON array. Each element must have these exact fields:
- "title": string (slide title)
- "type": one of [title, section, agenda, content, two-column, stats, timeline, quote, process, swot, comparison, thank-you]
- "description": string (brief description of what this slide covers)

Rules:
- First slide must be type "title"
- Include an "agenda" slide as slide 2 if slide count >= 6
- Last slide must be type "thank-you"
- Middle slides use content, stats, two-column, timeline etc. as appropriate
- Exactly {slide_count} slides total
- Titles should be concise (3-7 words)"""

    user_prompt = f"Create a {slide_count}-slide presentation about: {prompt}"

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=2000,
        temperature=0.7,
        response_format={"type": "json_object"} if slide_count <= 15 else None
    )

    raw = response.choices[0].message.content.strip()
    
    try:
        parsed = _parse_json_from_response(raw)
        # Handle { "outline": [...] } or [ ... ] directly
        if isinstance(parsed, dict):
            outline = parsed.get("outline") or parsed.get("slides") or list(parsed.values())[0]
        else:
            outline = parsed
        
        if not isinstance(outline, list) or len(outline) == 0:
            raise ValueError("Empty or invalid outline returned")
        
        return outline
    except Exception as e:
        raise RuntimeError(f"Outline generation failed: {e}. Raw: {raw[:200]}")


# ─── Single Slide Generation ──────────────────────────────────────────────────

SLIDE_SCHEMAS = {
    "title": '{"type":"title","title":"...","subtitle":"..."}',
    "section": '{"type":"section","title":"...","subtitle":"...","sectionNumber":"01"}',
    "agenda": '{"type":"agenda","title":"...","agendaItems":["Item 1","Item 2","Item 3"]}',
    "content": '{"type":"content","title":"...","bullets":["Point 1","Point 2","Point 3"],"extraText":[]}',
    "two-column": '{"type":"two-column","title":"...","leftColumn":{"heading":"...","bullets":["..."]},"rightColumn":{"heading":"...","bullets":["..."]}}',
    "stats": '{"type":"stats","title":"...","stats":[{"value":"85%","label":"Metric"},{"value":"2x","label":"Growth"}]}',
    "timeline": '{"type":"timeline","title":"...","timelineItems":[{"year":"2020","event":"..."},{"year":"2021","event":"..."}]}',
    "quote": '{"type":"quote","quote":"...","author":"..."}',
    "process": '{"type":"process","title":"...","processSteps":["Step 1","Step 2","Step 3"]}',
    "swot": '{"type":"swot","title":"SWOT Analysis","swotItems":{"strengths":["..."],"weaknesses":["..."],"opportunities":["..."],"threats":["..."]}}',
    "comparison": '{"type":"comparison","title":"...","tableHeaders":["Feature","Option A","Option B"],"tableData":[["Feature 1","A1","B1"]]}',
    "thank-you": '{"type":"thank-you","title":"Thank You","subtitle":"..."}',
}


def generate_slide_with_groq(
    topic: str,
    outline: List[dict],
    slide_index: int,
    style_guide: Optional[dict] = None,
    rag_context: str = ""
) -> dict:
    """
    Generate a single slide's full content using Groq with optional RAG context.
    
    Returns a slide dict compatible with the frontend's expected format.
    """
    client = _get_client()

    slide_info = outline[slide_index] if slide_index < len(outline) else {}
    slide_type = slide_info.get("type", "content")
    slide_title = slide_info.get("title", f"Slide {slide_index + 1}")
    slide_desc = slide_info.get("description", "")

    schema = SLIDE_SCHEMAS.get(slide_type, SLIDE_SCHEMAS["content"])

    rag_section = ""
    if rag_context:
        rag_section = f"""
Reference material (use specific facts, terms, and data from this):
{rag_context}
"""

    outline_context = "\n".join(
        f"Slide {i+1}: {s.get('title','?')} ({s.get('type','content')})"
        for i, s in enumerate(outline)
    )

    system_prompt = f"""You are an expert presentation content writer. Generate rich, professional slide content.
Return ONLY valid JSON matching this schema exactly:
{schema}

Rules:
- Use professional, concise language
- Bullets should be 8-15 words each (not too short, not too long)  
- Stats must have real-looking values (percentages, numbers, multipliers)
- Timeline items need specific years/dates
- Content must be directly relevant to the presentation topic
- GPT-style professional quality — no generic filler content{rag_section}"""

    user_prompt = f"""Presentation topic: {topic}

Full presentation outline:
{outline_context}

Now generate slide {slide_index + 1}: "{slide_title}"
Description: {slide_desc}
Type: {slide_type}

Return only the JSON object for this slide."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=1000,
        temperature=0.75
    )

    raw = response.choices[0].message.content.strip()
    
    try:
        slide = _parse_json_from_response(raw)
        if not isinstance(slide, dict):
            raise ValueError("Expected JSON object for slide")
        
        # Ensure required fields
        slide.setdefault("type", slide_type)
        slide.setdefault("title", slide_title)
        
        return slide
    except Exception as e:
        # Graceful fallback — return a minimal valid slide
        print(f"[RAG LLM] Slide parse error: {e}")
        return {
            "type": slide_type,
            "title": slide_title,
            "bullets": [slide_desc or "Key content for this section."]
        }


# ─── Single Slide EDIT (for slide edit with RAG context) ─────────────────────

def edit_slide_with_groq(
    edit_prompt: str,
    slide: dict,
    rag_context: str = ""
) -> dict:
    """
    Edit an existing slide using a natural language instruction, with RAG context.
    Returns an updated slide dict.
    """
    client = _get_client()

    rag_section = ""
    if rag_context:
        rag_section = f"""
Reference material to draw from:
{rag_context}
"""

    system_prompt = f"""You are an expert presentation editor. Modify the given slide according to the instruction.
{rag_section}
Return ONLY the updated slide as a valid JSON object. Preserve all existing fields not mentioned in the instruction.
Keep the same "type" unless explicitly asked to change it."""

    user_prompt = f"""Current slide:
{json.dumps(slide, indent=2)}

Edit instruction: {edit_prompt}

Return the updated slide JSON."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=800,
        temperature=0.7
    )

    raw = response.choices[0].message.content.strip()
    
    try:
        updated = _parse_json_from_response(raw)
        if not isinstance(updated, dict):
            raise ValueError("Expected JSON object")
        updated.setdefault("type", slide.get("type", "content"))
        updated.setdefault("title", slide.get("title", "Slide"))
        return updated
    except Exception as e:
        print(f"[RAG LLM] Edit parse error: {e}")
        return slide  # Return original on failure
