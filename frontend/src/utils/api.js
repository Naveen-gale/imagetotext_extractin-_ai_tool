// All API calls — uses Vite proxy locally (/api → http://localhost:5000/api), or Render URL in prod
let BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";
// Auto-fix if the user forgot to add /api/v1 to the end of their Render URL in Vercel
if (BASE.startsWith("http") && !BASE.endsWith("/api/v1")) {
  BASE = BASE.replace(/\/+$/, "") + "/api/v1";
}

export async function extractTextFromImages(files) {
  const fd = new FormData();
  files.forEach((f) => fd.append("photos", f));
  const res = await fetch(`${BASE}/convert`, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Extraction failed");
  return data; // { success, count, results[] }
}

export async function aiSummarize(text) {
  const res = await fetch(`${BASE}/ai/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Summarize failed");
  return data.summary;
}

export async function aiTranslate(text, targetLanguage) {
  const res = await fetch(`${BASE}/ai/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, targetLanguage }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Translate failed");
  return data.translated;
}

export async function aiFixGrammar(text) {
  const res = await fetch(`${BASE}/ai/fix-grammar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Grammar fix failed");
  return data.fixed;
}

export async function aiExtractInfo(text) {
  const res = await fetch(`${BASE}/ai/extract-info`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Extract info failed");
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
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "PPT generation failed");
  return data.slides; // array of slide objects
}

/**
 * Upload a .pptx Blob to backend → returns an ImageKit public URL
 */
export async function uploadPptFile(blob, fileName = "presentation.pptx") {
  const fd = new FormData();
  fd.append("file", blob, fileName);
  const res = await fetch(`${BASE}/upload-ppt`, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url;
}
