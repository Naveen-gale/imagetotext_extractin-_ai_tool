import Groq from "groq-sdk";
import fs from "fs/promises";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pythonScriptPath = path.join(__dirname, "../../fallback_ai.py");

// Lazy initialization so dotenv loads before API key is read
let _groq = null;
export const getGroq = () => {
    if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    return _groq;
};

/**
 * Helper to run the Python fallback script when Groq fails
 */
function runPythonFallback(action, data) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({ action, ...data });
        
        // Spawn Python process
        const pythonProcess = spawn("python", [pythonScriptPath]);
        
        let output = "";
        let errorOutput = "";

        pythonProcess.stdout.on("data", (chunk) => { output += chunk.toString(); });
        pythonProcess.stderr.on("data", (chunk) => { errorOutput += chunk.toString(); });

        pythonProcess.on("close", (code) => {
            try {
                if (!output) throw new Error(errorOutput || "Python script returned no output");
                const parsed = JSON.parse(output);
                if (parsed.success) resolve(parsed.result);
                else reject(new Error(parsed.error || "Python fallback error"));
            } catch (err) {
                reject(new Error(`Fallback failed: ${err.message}`));
            }
        });

        // Write to stdin
        pythonProcess.stdin.write(payload);
        pythonProcess.stdin.end();
    });
}

/**
 * Extract text from an image using Groq Vision (llama-4-scout) or Python fallback
 */
export const extractTextFromImage = async (imagePath) => {
    try {
        const imageBuffer = await fs.readFile(imagePath);
        const base64Image = imageBuffer.toString("base64");

        const ext = imagePath.split(".").pop().toLowerCase();
        const mimeMap = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };
        const mimeType = mimeMap[ext] || "image/jpeg";

        const response = await getGroq().chat.completions.create({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Extract ALL text from this image exactly as it appears. Return ONLY the extracted text, nothing else." },
                        { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } },
                    ],
                },
            ],
            max_tokens: 4096,
            temperature: 0.1,
        });

        return response.choices[0]?.message?.content || "[NO TEXT FOUND]";
    } catch (error) {
        console.warn(`Groq OCR Failed (${error.message}). Running Python fallback...`);
        try {
            return await runPythonFallback("extractText", { imagePath });
        } catch (pyError) {
            console.error("Python Fallback Error:", pyError.message);
            throw new Error(`Text extraction failed (and fallback failed): ${error.message}`);
        }
    }
};

/**
 * Summarize extracted text using Groq or Python fallback
 */
export const summarizeText = async (text) => {
    try {
        const response = await getGroq().chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: "You are a professional summarizer. Create clear, concise summaries." },
                { role: "user", content: `Summarize:\n\n${text}` },
            ],
            max_tokens: 1024,
            temperature: 0.3,
        });

        return response.choices[0]?.message?.content || "Summary not available.";
    } catch (error) {
        console.warn(`Groq Summarize Failed (${error.message}). Running Python fallback...`);
        return await runPythonFallback("summarize", { text });
    }
};

/**
 * Translate text using Groq or Python fallback
 */
export const translateText = async (text, targetLanguage) => {
    try {
        const response = await getGroq().chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: `Translate text accurately to ${targetLanguage}. Return ONLY the translated text.` },
                { role: "user", content: `Translate to ${targetLanguage}:\n\n${text}` },
            ],
            max_tokens: 4096,
            temperature: 0.2,
        });

        return response.choices[0]?.message?.content || text;
    } catch (error) {
        console.warn(`Groq Translate Failed (${error.message}). Running Python fallback...`);
        return await runPythonFallback("translate", { text, targetLanguage });
    }
};

/**
 * Fix grammar using Groq or Python fallback
 */
export const fixGrammar = async (text) => {
    try {
        const response = await getGroq().chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: "Fix grammar, spelling, and improve clarity. Return ONLY the corrected text." },
                { role: "user", content: `Fix the grammar:\n\n${text}` },
            ],
            max_tokens: 4096,
            temperature: 0.2,
        });

        return response.choices[0]?.message?.content || text;
    } catch (error) {
        console.warn(`Groq Grammar Failed (${error.message}). Running Python fallback...`);
        return await runPythonFallback("fixGrammar", { text });
    }
};

/**
 * Extract key info using Groq or Python fallback
 */
export const extractKeyInfo = async (text) => {
    try {
        const response = await getGroq().chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: "Extract and categorize key information (names, dates, numbers) from text." },
                { role: "user", content: `Extract data from:\n\n${text}` },
            ],
            max_tokens: 1024,
            temperature: 0.2,
        });

        return response.choices[0]?.message?.content || "No key information found.";
    } catch (error) {
        console.warn(`Groq Key Info Failed (${error.message}). Running Python fallback...`);
        return await runPythonFallback("extractInfo", { text });
    }
};

/**
 * Generate PPT slide content using Groq AI.
 * Returns a JSON array of slide objects.
 * @param {string} prompt - User's presentation topic/request
 * @param {string|null} base64Image - Optional base64 image for visual context
 * @param {string} mimeType - MIME type of the image
 * @param {number} slideCount - Requested number of slides
 */
export const generatePPTContent = async (prompt, base64Image = null, mimeType = "image/jpeg", slideCount = 8) => {
    const systemPrompt = `You are an expert presentation designer. Generate content for a professional powerpoint.
Respond ONLY with a valid JSON array. Do NOT include markdown, code blocks, or extra text.
Each element is a slide object:
{
  "type": "title" | "content" | "image" | "two-column" | "quote" | "timeline" | "stats",
  "title": "Slide Title",
  "subtitle": "Subtitle (Title slides only)",
  "bullets": ["Point 1", "Point 2", "Point 3"],
  "quote": "A relevant quote",
  "author": "Quote author",
  "leftColumn": { "heading": "Left", "bullets": ["..."] },
  "rightColumn": { "heading": "Right", "bullets": ["..."] },
  "stats": [{"label": "...", "value": "..."}, ...],
  "timelineItems": [{"year": "2020", "event": "Something happened"}, ...],
  "imageKeyword": "Specific descriptive keyword for a professional photo representing this slide's topic (ONLY if the user prompt asks for images or if it adds visual value)",
  "speakerNotes": "Presenter notes"
}
Guidelines:
1. Generate EXACTLY ${slideCount} slides.
2. Slide 1 MUST be type "title".
3. Slide ${slideCount} MUST be a "Thank You" slide (type: "title", title: "Thank You", subtitle: "Any questions?").
4. If the user prompt mentions "images" or "photos", provide a descriptive 'imageKeyword' for every relevant slide.
5. Content must be highly accurate, professional, and well-structured.`;

    const userMessages = [];
    if (base64Image) {
        userMessages.push({
            role: "user",
            content: [
                { type: "text", text: `Create a ${slideCount}-slide presentation about: ${prompt}` },
                { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } },
            ],
        });
    } else {
        userMessages.push({
            role: "user",
            content: `Create a ${slideCount}-slide presentation about: ${prompt}`,
        });
    }

    const model = base64Image
        ? "meta-llama/llama-4-scout-17b-16e-instruct"
        : "llama-3.3-70b-versatile";

    const response = await getGroq().chat.completions.create({
        model,
        messages: [
            { role: "system", content: systemPrompt },
            ...userMessages,
        ],
        max_tokens: 4096,
        temperature: 0.6,
        response_format: base64Image ? undefined : { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content || "[]";
    const jsonMatch = raw.match(/(\[\s*\{[\s\S]*\}\s*\])/m)
        || raw.match(/```(?:json)?\s*([\s\S]*?)```/);

    const jsonStr = jsonMatch ? jsonMatch[1] : raw;

    try {
        let slides = JSON.parse(jsonStr);
        slides = Array.isArray(slides) ? slides : (slides.slides || slides.presentation || []);
        
        // Post-process to ensure images are only used if appropriate
        // AND convert keywords to professional placeholder URLs
        // Use LoremFlickr or Unsplash Source for reliable topic-based images
        const finalSlides = slides.map(s => {
            if (s.imageKeyword) {
                // Topic-based high-res images
                s.image = `https://loremflickr.com/800/600/${encodeURIComponent(s.imageKeyword.replace(/\s+/g, ','))}`;
            }
            return s;
        });

        return finalSlides;
    } catch {
        throw new Error("AI did not return valid slide JSON. Please try again.");
    }
};

/**
 * Text improvement engine using Groq
 */
export const improveTextEngine = async (text, action) => {
    let systemPrompt = "You are a direct textual assistant. Return ONLY the edited response exactly. Do NOT use quotes around your answer. Do NOT explain your answer.";
    if (action === "spelling") {
        systemPrompt += " Fix spelling and grammatical errors of the provided text.";
    } else if (action === "autocomplete") {
        systemPrompt += " Complete the thought or sentence provided by the user naturally but keep it concise.";
    } else if (action === "improve") {
        systemPrompt += " Make the text sound more professional and punchy for a PowerPoint slide.";
    } else {
        systemPrompt += " Edit the text appropriately.";
    }

    const response = await getGroq().chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
        ],
        temperature: 0.3,
        max_tokens: 500,
    });
    
    return response.choices[0]?.message?.content?.trim() || text;
};
