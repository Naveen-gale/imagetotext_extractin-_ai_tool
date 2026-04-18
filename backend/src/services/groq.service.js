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
                        { type: "text", text: "You are equipped with 'Context-Aware Understanding' and 'Handwriting Style Learning'. Extract ALL text from this image exactly as it appears. You must use context to accurately interpret unclear characters or sloppy handwriting, adapting to the handwriting style intelligently to fix spelling. Return ONLY the extracted text, nothing else." },
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
                { role: "system", content: "You are a Smart Error Correction engine. Automatically fix spelling mistakes, correct grammar, and rewrite unclear sentences to make the output clean, professional, and easy to read. Return ONLY the corrected text." },
                { role: "user", content: `Clean and correct this text:\n\n${text}` },
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
 * Answer a question based on provided text using Groq
 */
export const askQuestion = async (text, question) => {
    try {
        const response = await getGroq().chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: "You are a helpful assistant. Use the provided text to answer the user's question. Be accurate and concise. If the answer is not in the text, politely say so." },
                { role: "user", content: `Context:\n${text}\n\nQuestion: ${question}` },
            ],
            max_tokens: 1024,
            temperature: 0.4,
        });

        return response.choices[0]?.message?.content || "I couldn't find an answer to that question.";
    } catch (error) {
        console.warn(`Groq Ask Question Failed (${error.message}). Running Python fallback...`);
        return await runPythonFallback("askQuestion", { text, question });
    }
};

/**
 * Simplify concept using Groq
 */
export const simplifyConcept = async (text) => {
    try {
        const response = await getGroq().chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: "You are an expert educator. Simplify the following text or concept into easy-to-understand language suitable for a student. Use analogies if helpful. Do NOT use markdown code blocks around your entire answer." },
                { role: "user", content: `Simplify this:\n\n${text}` },
            ],
            max_tokens: 1024,
            temperature: 0.4,
        });
        return response.choices[0]?.message?.content || "Could not simplify.";
    } catch (error) {
        console.warn(`Groq Simplify Failed (${error.message}). Running Python fallback...`);
        return await runPythonFallback("simplifyConcept", { text });
    }
};

/**
 * Generate Knowledge Graph (Mermaid.js) using Groq
 */
export const generateKnowledgeGraph = async (text) => {
    try {
        const response = await getGroq().chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are a knowledge architect. Create a valid Mermaid.js mindmap diagram connecting the main ideas, entities, and concepts found in the provided text. Keep node names concise. Only output valid Mermaid syntax inside a ```mermaid ... ``` code block. Do NOT include any intro or outro text." },
                { role: "user", content: `Generate a Mermaid mindmap for this:\n\n${text}` },
            ],
            max_tokens: 1500,
            temperature: 0.2,
        });

        const raw = response.choices[0]?.message?.content || "";
        const match = raw.match(/```mermaid\n([\s\S]*?)```/);
        return match ? match[1].trim() : raw.trim();
    } catch (error) {
        console.warn(`Groq Knowledge Graph Failed (${error.message}). Running Python fallback...`);
        return await runPythonFallback("generateKnowledgeGraph", { text });
    }
};

/**
 * Real-Time Suggestion Engine using Groq
 */
export const suggestionEngine = async (text) => {
    try {
        const response = await getGroq().chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: "You are a real-time study assistant. Identify 3-5 complex terms, key ideas, or interesting facts from the text and provide clear meanings, explanations, and related info for them. Format clearly using markdown bullet points or headers." },
                { role: "user", content: `Provide suggestions/explanations for:\n\n${text}` },
            ],
            max_tokens: 1024,
            temperature: 0.4,
        });

        return response.choices[0]?.message?.content || "No suggestions available.";
    } catch (error) {
        console.warn(`Groq Suggestion Engine Failed (${error.message}). Running Python fallback...`);
        return await runPythonFallback("suggestionEngine", { text });
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
    const systemPrompt = `You are an expert presentation designer. Create a highly engaging, structured ${slideCount}-slide professional presentation based on the user's input.
IMPORTANT INSTRUCTIONS:
- DO NOT just copy the exact text provided by the user. You must THINK, expand on the core idea, and generate comprehensive, well-structured professional PowerPoint slide content.
- YOUR GOAL IS TO WOW THE USER WITH AN EXPERT-LEVEL SLIDE DECK. DO NOT BE BASIC. DO NOT BE REPETITIVE.
- IMPORTANT: Text MUST fit on the slide. If you have many bullet points, keep each bullet point concise (maximum 15 words each).
- VARIETY IS MANDATORY: Use a diverse mix of slide types. Do NOT reuse the same slide type more than twice in the entire presentation. Ensure you use 'two-column', 'timeline', 'stats', 'quote', and 'content' types to keep it dynamic.
- Each slide should be visually balanced. If using 'image' type, ensure 'bullets' are informative but concise.
- EACH SLIDE MUST HAVE CONTENT: Aim for 4-5 high-quality, punchy bullet points.
- Slide 1 MUST be type "title".
- Slide ${slideCount} MUST be a "Thank You" slide.
- For all slides except 'title' and 'quote', the 'title' field should be very impactful.
- ACCURACY: Content must be highly professional and well-structured.

Respond ONLY with a valid JSON object containing a "slides" array. Do NOT include markdown, code blocks, or extra text.
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
  "imageKeyword": "Extremely specific, descriptive prompt for a photorealistic image representing this slide's topic",
  "speakerNotes": "Presenter notes"
}
`;

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

    const raw = response.choices[0]?.message?.content || "{}";
    const jsonMatch = raw.match(/(\{\s*"slides"[\s\S]*\}\s*\}?)/m) 
        || raw.match(/(\[\s*\{[\s\S]*\}\s*\])/m) 
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
                // Topic-based high-res AI images using pollinations (free, precise topic matching)
                const seed = Math.floor(Math.random() * 1000000);
                s.image = `https://image.pollinations.ai/prompt/${encodeURIComponent(s.imageKeyword)}?width=800&height=600&seed=${seed}&model=flux&nologo=true`;
            }
            return s;
        });

        return finalSlides;
    } catch {
        throw new Error("AI did not return valid slide JSON. Please try again.");
    }
};

/**
 * PHASE 1: Generate an outline for the presentation
 */
export const generatePPTOutline = async (topic, slideCount = 8, styleGuide = null) => {
    const isAuto = slideCount === 0;
    const styleContext = styleGuide ? `Adhere to this design style guide extracted from a reference: ${JSON.stringify(styleGuide)}` : "";
    
    const systemPrompt = `You are a professional presentation architect. Your task is to plan a high-quality presentation.
    - Create a coherent narrative flow.
    - ${isAuto ? "Choose an appropriate slide count (typically 6-12) based on the topic depth." : `Plan exactly ${slideCount} slides.`}
    - For each slide, determine: "type", "title", and a "description" of what the content should cover.
    - ${styleContext}
    - IMPORTANT: If styleGuide is provided, use it ONLY for colors and fonts. ABSOLUTELY DO NOT use its topics or words. Follow the Topic below strictly.
    - Slide types: "title", "content", "image", "two-column", "quote", "timeline", "stats".
    - Respond strictly with JSON: { "outline": [ { "type": "...", "title": "...", "description": "..." }, ... ] }`;

    const response = await getGroq().chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Outline a ${isAuto ? "professionally structured" : slideCount + "-slide"} presentation about: ${topic}` },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
        temperature: 0.5,
    });

    try {
        const data = JSON.parse(response.choices[0].message.content);
        return data.outline || [];
    } catch (e) {
        throw new Error("Failed to generate outline.");
    }
};

/**
 * Generate a new slide that fits contextually into an existing deck
 */
export const generateNewInsertedSlide = async (topic, currentSlides, insertIndex, styleGuide = null) => {
    const prevSlide = insertIndex > 0 ? currentSlides[insertIndex - 1] : null;
    const nextSlide = insertIndex < currentSlides.length ? currentSlides[insertIndex] : null;

    const styleContext = styleGuide ? `Adhere to this design style guide extracted from a reference: ${JSON.stringify(styleGuide)}` : "";

    const systemPrompt = `You are an expert presentation designer. Generate ONE new slide to be inserted into a deck about "${topic}".
    CONTEXT:
    ${prevSlide ? `- Previous Slide: "${prevSlide.title}"` : "- This is the first slide."}
    ${nextSlide ? `- Following Slide: "${nextSlide.title}"` : "- This is the last slide."}
    
    GOAL: Create a slide that bridges the content or adds missing depth.
    - ${styleContext}
    - IMPORTANT: Use styleGuide ONLY for visual theming. DO NOT use its content.
    - Choose fitting type: "content", "image", "two-column", "quote", "timeline", "stats".
    - Respond strictly with JSON for ONE slide object.`;

    const response = await getGroq().chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Generate the best slide to fit this context." },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
        temperature: 0.7,
    });

    try {
        const slide = JSON.parse(response.choices[0].message.content);
        return slide;
    } catch (e) {
        throw new Error("Failed to generate contextual slide.");
    }
};

/**
 * PHASE 2: Generate content for a single slide based on the outline
 */
export const generateSingleSlideContent = async (topic, outline, slideIndex, styleGuide = null) => {
    const slideMeta = outline[slideIndex];
    if (!slideMeta) throw new Error("Invalid slide index.");

    const styleContext = styleGuide ? `Follow these style hints: ${JSON.stringify(styleGuide)}` : "";

    const systemPrompt = `You are an expert slide content creator. Generate detailed, professional content for ONE specific slide in a presentation about "${topic}".
    SLIDE CONTEXT: Slide #${slideIndex + 1} of ${outline.length}.
    DESIRED TOPIC: "${slideMeta.title}"
    DESCRIPTION: "${slideMeta.description}"
    ${styleContext}
    - IMPORTANT: If styleGuide exists, use it ONLY for visual properties. DO NOT repeat its content.
    - Use sophisticated, senior-level language.
    - For 'stats' slides, provide an array "stats": [{ "label": "...", "value": "..." }].
    - For 'timeline' slides, provide "timelineItems": [{ "year": "...", "event": "..." }].
    - For 'image' or 'content' slides, also provide an "imageKeyword" for visual search.
    - Response MUST be a JSON object with properties fitting the type "${slideMeta.type}".
    - Max 5 bullet points.
    
    JSON STRUCTURE (MATCH THE TYPE):
    {
      "type": "${slideMeta.type}",
      "title": "${slideMeta.title}",
      "subtitle": "...",
      "bullets": ["...", "..."],
      "quote": "...",
      "author": "...",
        "leftColumn": { "heading": "...", "bullets": ["..."] },
        "rightColumn": { "heading": "...", "bullets": ["..."] },
        "stats": [{"label": "...", "value": "..."}, ...],
        "timelineItems": [{"year": "...", "event": "..."}, ...],
      "imageKeyword": "Extremely descriptive prompt",
      "speakerNotes": "..."
    }`;

    const response = await getGroq().chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate content for this slide.` },
        ],
        response_format: { type: "json_object" },
        max_tokens: 800, // PER SLIDE
        temperature: 0.4,
    });

    try {
        const slide = JSON.parse(response.choices[0].message.content);
        
        // Post-process image if needed
        if (slide.imageKeyword) {
            const seed = Math.floor(Math.random() * 1000000);
            slide.image = `https://image.pollinations.ai/prompt/${encodeURIComponent(slide.imageKeyword)}?width=800&height=600&seed=${seed}&model=flux&nologo=true`;
        }
        
        return slide;
    } catch (e) {
        throw new Error(`Failed to generate slide content for slide ${slideIndex + 1}`);
    }
};

/**
 * Text improvement engine using Groq
 */
export const improveTextEngine = async (text, action) => {
    let systemPrompt = "You are a direct textual assistant. Return ONLY the edited response exactly. Do NOT use quotes around your answer. Do NOT explain your answer.";
    if (action === "spelling") {
        systemPrompt += " Fix spelling and grammatical errors of the provided text while maintaining the original tone.";
    } else if (action === "autocomplete") {
        systemPrompt += " Complete the thought or sentence provided by the user naturally, adding professional polish and depth.";
    } else if (action === "improve") {
        systemPrompt += " Make the text sound significantly more professional, authoritative, and engaging. Transform basic sentences into expert bullet points suitable for a high-stakes business or academic presentation.";
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

/**
 * Edit existing PPT slide content based on a prompt
 * Expects the current slides JSON array and a prompt describing requested changes.
 */
export const editPPTContent = async (prompt, currentSlides) => {
    const systemPrompt = `You are an expert presentation designer and editor. 
You are given the JSON array of the CURRENT SLIDES of a presentation, and a USER REQUEST detailing how they want to edit or improve the presentation.
IMPORTANT INSTRUCTIONS:
- Apply the user's modifications to the presentation brilliantly. If they ask for expansion, add deep, valuable details and technical facts.
- TEXT FIT: Keep bullet points concise (max 15-20 words) to ensure they fit the full-screen slide.
- VARIETY: If the user asks for a theme change, adjust the layouts and details significantly. Do not keep all slides the same layout.
- You MUST preserve any 'customStyles' objects attached to the slides exactly as they are.
- Ensure every slide has 4-5 bullet points of high-quality information.
- Use diverse slide types ('stats', 'timeline', 'two-column', etc.) to make the edit feel professional.
- Respond ONLY with a valid JSON object containing a "slides" array with exactly the updated slide objects. Do NOT include extra metadata.
- Ensure the result is still a high-quality professional presentation with excellent structural writing.`;

    const userMessage = `USER REQUEST: "${prompt}"

CURRENT SLIDES JSON:
${JSON.stringify(currentSlides, null, 2)}

Return the newly modified slides array as raw JSON.`;

    const response = await getGroq().chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
        ],
        max_tokens: 6000,
        temperature: 0.4,
        response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content || "{}";
    
    try {
        const jsonMatch = raw.match(/(\{\s*"slides"[\s\S]*\}\s*\}?)/m) 
            || raw.match(/(\[\s*\{[\s\S]*\}\s*\])/m) 
            || raw.match(/```(?:json)?\s*([\s\S]*?)```/);
            
        const jsonStr = jsonMatch ? jsonMatch[1] : raw;
        let parsed = JSON.parse(jsonStr);
        let slides = Array.isArray(parsed) ? parsed : (parsed.slides || parsed.presentation || []);
        
        // Post-process to ensure newly added images use Pollinations
        const finalSlides = slides.map(s => {
            if (s.imageKeyword && (!s.image || !s.image.includes('pollinations.ai'))) {
                const seed = Math.floor(Math.random() * 1000000);
                s.image = `https://image.pollinations.ai/prompt/${encodeURIComponent(s.imageKeyword)}?width=800&height=600&seed=${seed}&model=flux&nologo=true`;
            }
            return s;
        });

        return finalSlides;
    } catch (parseErr) {
        console.error("AI JSON Parse Error:", parseErr.message, "Raw was:", raw);
        throw new Error("AI did not return valid edited slide JSON. Please try again.");
    }
};

/**
 * Edit a SINGLE specific slide based on a prompt.
 * Expects a single slide object.
 */
export const editSingleSlideContent = async (prompt, slide) => {
    const systemPrompt = `You are an expert presentation designer. 
You are given ONE CURRENT SLIDE and a USER REQUEST to refine or improve it.
IMPORTANT INSTRUCTIONS:
- Apply the user's modifications ONLY to this single slide brilliantly.
- If they ask for more detail, add deep, valuable technical facts.
- TEXT FIT: Keep bullet points concise (max 15-20 words) to ensure they fit the full-screen slide.
- Preserve any 'customStyles' exactly.
- Return ONLY the updated slide object as valid JSON.
- DO NOT return an array. Return a single object.
- If the prompt implies a visual change, update 'imageKeyword' appropriately.`;

    const userMessage = `USER REQUEST: "${prompt}"

CURRENT SLIDE JSON:
${JSON.stringify(slide, null, 2)}

Return the updated slide as a JSON object.`;

    const response = await getGroq().chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
        ],
        max_tokens: 3000,
        temperature: 0.3,
        response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content || "{}";

    try {
        let updatedSlide = JSON.parse(raw);
        // If it returns a slides array by mistake, pick first
        if (updatedSlide.slides && Array.isArray(updatedSlide.slides)) {
            updatedSlide = updatedSlide.slides[0];
        }

        // Fresh image if keyword changed
        if (updatedSlide.imageKeyword && updatedSlide.imageKeyword !== slide.imageKeyword) {
            const seed = Math.floor(Math.random() * 1000000);
            updatedSlide.image = `https://image.pollinations.ai/prompt/${encodeURIComponent(updatedSlide.imageKeyword)}?width=800&height=600&seed=${seed}&model=flux&nologo=true`;
        }

        return updatedSlide;
    } catch (err) {
        console.error("Single Slide Edit Parse Error:", err);
        throw new Error("Failed to refine slide. Please try again.");
    }
};
