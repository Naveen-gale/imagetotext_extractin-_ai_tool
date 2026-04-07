import { extractTextFromImage, summarizeText, translateText, fixGrammar, extractKeyInfo, generatePPTContent } from "../services/groq.service.js";
import { uploadToImageKit } from "../services/imagekit.service.js";
import { extractDocumentText, formatDocumentTextWithAI } from "../services/document.service.js";
import fs from "fs/promises";

/**
 * POST /api/v1/convert
 * Upload images or docs → extract text
 */
export const convertImages = async (req, res) => {
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({
            success: false,
            error: "No files received. Use 'photos' as the field name with form-data."
        });
    }

    console.log(`[Convert] Processing ${files.length} file(s)...`);

    try {
        const results = await Promise.all(
            files.map(async (file) => {
                let imagekitData = null;
                try {
                    const ext = file.originalname.split(".").pop().toLowerCase();
                    const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);

                    // 1. Upload to ImageKit (only doing this for images visually, to avoid heavy PDF hosting)
                    if (isImage) {
                        try {
                            imagekitData = await uploadToImageKit(file.path, file.originalname);
                        } catch (uploadErr) {
                            console.warn(`ImageKit upload failed for ${file.originalname}:`, uploadErr.message);
                        }
                    }

                    // 2. Extract Text Based on Document Type
                    let extractedText = "";
                    if (isImage) {
                        extractedText = await extractTextFromImage(file.path);
                    } else {
                        // Extract plain text locally first from PDF/DOC/PPT
                        const rawText = await extractDocumentText(file.path, file.originalname);
                        // Send through AI formatter 
                        extractedText = await formatDocumentTextWithAI(rawText);
                    }

                    return {
                        success: true,
                        fileName: file.originalname,
                        text: extractedText || "[NO TEXT FOUND]",
                        wordCount: (extractedText || "").split(/\s+/).filter(Boolean).length,
                        charCount: (extractedText || "").length,
                        imageUrl: imagekitData?.url || null,
                        imageFileId: imagekitData?.fileId || null,
                        thumbnailUrl: imagekitData?.thumbnailUrl || null,
                    };
                } catch (err) {
                    console.error(`Error processing ${file.originalname}:`, err.message);
                    return {
                        success: false,
                        fileName: file.originalname,
                        text: "",
                        error: err.message,
                        imageUrl: imagekitData?.url || null,
                    };
                } finally {
                    // Clean up temp file
                    try { await fs.unlink(file.path); } catch {}
                }
            })
        );

        return res.status(200).json({
            success: true,
            count: results.length,
            results,
        });

    } catch (error) {
        console.error("[Convert] Fatal error:", error);
        for (const file of files) {
            try { await fs.unlink(file.path); } catch {}
        }
        return res.status(500).json({
            success: false,
            error: "Critical error during processing",
            details: error.message
        });
    }
};

/**
 * POST /api/v1/ai/summarize
 */
export const summarize = async (req, res) => {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
        return res.status(400).json({ success: false, error: "No text provided." });
    }
    try {
        const summary = await summarizeText(text);
        return res.status(200).json({ success: true, summary });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * POST /api/v1/ai/translate
 */
export const translate = async (req, res) => {
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) {
        return res.status(400).json({ success: false, error: "text and targetLanguage are required." });
    }
    try {
        const translated = await translateText(text, targetLanguage);
        return res.status(200).json({ success: true, translated, targetLanguage });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * POST /api/v1/ai/fix-grammar
 */
export const grammar = async (req, res) => {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
        return res.status(400).json({ success: false, error: "No text provided." });
    }
    try {
        const fixed = await fixGrammar(text);
        return res.status(200).json({ success: true, fixed });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * POST /api/v1/ai/extract-info
 */
export const extractInfo = async (req, res) => {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
        return res.status(400).json({ success: false, error: "No text provided." });
    }
    try {
        const info = await extractKeyInfo(text);
        return res.status(200).json({ success: true, info });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * POST /api/v1/ai/generate-ppt
 * Body (multipart/form-data): prompt, slideCount?, image (optional file)
 * Returns JSON array of slide objects.
 */
export const generatePPT = async (req, res) => {
    const prompt = req.body?.prompt?.trim();
    if (!prompt) {
        return res.status(400).json({ success: false, error: "prompt is required." });
    }
    const slideCount = Math.min(Math.max(parseInt(req.body?.slideCount || 8, 10), 4), 20);

    let base64Image = null;
    let mimeType = "image/jpeg";

    if (req.file) {
        try {
            const buffer = await fs.readFile(req.file.path);
            base64Image = buffer.toString("base64");
            mimeType = req.file.mimetype || "image/jpeg";
        } catch (e) {
            console.warn("Could not read uploaded image:", e.message);
        } finally {
            try { await fs.unlink(req.file.path); } catch {}
        }
    }

    try {
        const slides = await generatePPTContent(prompt, base64Image, mimeType, slideCount);
        return res.status(200).json({ success: true, slides });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * POST /api/v1/upload-ppt
 * Body (multipart/form-data): file (the .pptx blob)
 * Returns ImageKit public URL.
 */
export const uploadPPT = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: "No file uploaded." });
    }
    try {
        const result = await uploadToImageKit(req.file.path, req.file.originalname || "presentation.pptx");
        return res.status(200).json({ success: true, url: result.url, fileId: result.fileId });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    } finally {
        try { await fs.unlink(req.file.path); } catch {}
    }
};

/**
 * POST /api/v1/ai/improve-text
 * Body: { text: "...", action: "spelling" | "autocomplete" | "improve" }
 */
export const improveSlideText = async (req, res) => {
    const { text, action } = req.body;
    if (!text || !action) return res.status(400).json({ success: false, error: "Missing text or action." });

    try {
        const { improveTextEngine } = await import("../services/groq.service.js");
        const result = await improveTextEngine(text, action);
        return res.status(200).json({ success: true, text: result });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};