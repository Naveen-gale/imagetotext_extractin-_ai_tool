import fs from "fs/promises";
import { getGroq } from "./groq.service.js"; // Need to export getGroq from groq.service.js

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

/**
 * Parses local files (PDF, DOCX, PPTX, TXT) to raw string
 */
export const extractDocumentText = async (filePath, originalName) => {
    const ext = (originalName || filePath).split(".").pop().toLowerCase();
    
    try {
        if (ext === "pdf") {
            const dataBuffer = await fs.readFile(filePath);
            const data = await pdfParse(dataBuffer);
            return data.text;
        } 
        else if (ext === "docx" || ext === "doc" || ext === "pptx" || ext === "ppt") {
            const op = createRequire(import.meta.url)("officeparser");
            const parsed = await op.parseOffice(filePath, { toText: true });
            
            // Fallback in case officeparser still returns an AST object
            if (typeof parsed === 'object' && parsed !== null) {
                try {
                    let extracted = [];
                    const extractStrings = (node) => {
                        if (Array.isArray(node)) {
                            node.forEach(extractStrings);
                        } else if (node && typeof node === 'object') {
                            if (node.type === 'text' && typeof node.text === 'string') {
                                extracted.push(node.text);
                            } else {
                                Object.values(node).forEach(extractStrings);
                            }
                        }
                    };
                    extractStrings(parsed);
                    
                    if (extracted.length > 0) {
                        return extracted.join(' ');
                    }
                    return JSON.stringify(parsed);
                } catch(e) {
                    return String(parsed);
                }
            }
            return parsed;
        }
        else if (ext === "txt") {
            return await fs.readFile(filePath, "utf-8");
        }
        else {
            throw new Error(`Unsupported document extension: ${ext}`);
        }
    } catch (error) {
        throw new Error(`Failed to parse document locally: ${error.message}`);
    }
};

/**
 * AI Formatting Step: Takes raw document text and uses AI to fix layout/extraction errors
 */
export const formatDocumentTextWithAI = async (rawText) => {
    // If text is super long, just return it because LLM max context or max output might cut it off
    // llama-3.1-8b-instant context is 8k, max output 4k. 
    if (rawText.length > 15000) {
        return rawText; 
    }
    
    try {
        const groq = getGroq();
        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "You are a document transcription formatter. Take this raw extracted text (from a PDF/Doc/PPT) and format it cleanly. Preserve exactly all information, lists, and structure. Do NOT summarize. Do not say 'Here is the text'. Output strictly the cleaned text."
                },
                {
                    role: "user",
                    content: `Clean and format this text:\n\n${rawText}`
                }
            ],
            max_tokens: 4096,
            temperature: 0.1,
        });
        
        return response.choices[0]?.message?.content || rawText;
    } catch (error) {
        console.warn("AI document formatting failed, returning raw text:", error.message);
        return rawText; // Fallback to raw text if AI is overloaded
    }
};
