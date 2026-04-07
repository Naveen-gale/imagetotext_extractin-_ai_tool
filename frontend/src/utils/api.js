// All API calls — uses Vite proxy locally (/api → http://localhost:5000/api), or Render URL in prod
let BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

// Auto-fix if the user forgot to add /api/v1 to the end of their Render URL in Vercel
if (BASE.startsWith("http") && !BASE.endsWith("/api/v1")) {
  BASE = BASE.replace(/\/+$/, "") + "/api/v1";
}

// Utility to safely parse JSON or return better error metadata
async function handleResponse(res, context = "API call") {
  const contentType = res.headers.get("content-type");
  if (!res.ok) {
    let errorMsg = "Failed";
    try {
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        errorMsg = data.error || data.message || "Unknown error";
      } else {
        errorMsg = `Server returned ${res.status} ${res.statusText}. Check if VITE_API_BASE_URL is correct.`;
      }
    } catch (e) {
      errorMsg = `Unexpected response format from server (${res.status})`;
    }
    throw new Error(`${context}: ${errorMsg}`);
  }
  
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error(`${context}: Expected JSON response but received ${contentType || "nothing"}. Check if your backend URL is correct.`);
  }
  
  return await res.json();
}

export async function extractTextFromImages(files) {
  const fd = new FormData();
  files.forEach((f) => fd.append("photos", f));
  const res = await fetch(`${BASE}/convert`, { method: "POST", body: fd });
  return await handleResponse(res, "Extraction");
}

export async function aiSummarize(text) {
  const res = await fetch(`${BASE}/ai/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await handleResponse(res, "Summarize");
  return data.summary;
}

export async function aiTranslate(text, targetLanguage) {
  const res = await fetch(`${BASE}/ai/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, targetLanguage }),
  });
  const data = await handleResponse(res, "Translate");
  return data.translated;
}

export async function aiFixGrammar(text) {
  const res = await fetch(`${BASE}/ai/fix-grammar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await handleResponse(res, "Grammar fix");
  return data.fixed;
}

export async function aiExtractInfo(text) {
  const res = await fetch(`${BASE}/ai/extract-info`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await handleResponse(res, "Extract info");
  return data.info;
}

/**
 * Send prompt + optional image to backend → returns slides JSON array
 */
export async function generatePptData({ prompt, image, slideCount = 8 }) {
  const fd = new FormData();
  fd.append("prompt", prompt);
  fd.append("slideCount", String(slideCount));
  if (image) fd.append("image", image);
  const res = await fetch(`${BASE}/ai/generate-ppt`, { method: "POST", body: fd });
  const data = await handleResponse(res, "PPT Generation");
  return data.slides;
}

/**
 * Upload a .pptx Blob to backend → returns an ImageKit public URL
 */
export async function uploadPptFile(blob, fileName = "presentation.pptx") {
  const fd = new FormData();
  fd.append("file", blob, fileName);
  const res = await fetch(`${BASE}/upload-ppt`, { method: "POST", body: fd });
  const data = await handleResponse(res, "PPT Upload");
  return data.url;
}

/**
 * Call AI Text Improvement
 */
export async function improveTextApi(text, action) {
  const res = await fetch(`${BASE}/ai/improve-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, action }),
  });
  const data = await handleResponse(res, "Text Improve");
  return data.text;
}
