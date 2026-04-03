import { textConverter } from "../services/textConverter.service.js";
import fs from "fs/promises";

/**
 * Optimized text conversion controller
 * - Handles parallel file processing
 * - Cleans up uploaded files
 * - Fixes multiple response header issue
 * - Returns only fileName and text as requested
 */
const convertText = async (req, res) => {
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({
            error: "No files received! Please ensure you are using 'photos' as the field name and sending 'form-data'."
        });
    }

    console.log(`Processing ${files.length} files...`);

    try {
        // Parallel processing of all uploaded files
        const processedResults = await Promise.all(
            files.map(async (file) => {
                try {
                    // Correctly await the OCR service
                    const rawText = await textConverter(file.path);
                    
                    // Clean extracted text (remove multiple newlines and spaces)
                    const cleanText = rawText
                        .replace(/[\n\r]+/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();

                    return {
                        fileName: file.originalname,
                        text: cleanText
                    };
                } catch (err) {
                    console.error(`Error processing file ${file.originalname}:`, err.message);
                    return {
                        fileName: file.originalname,
                        text: "OCR failed for this file"
                    };
                } finally {
                    // Automatic cleanup: Delete file regardless of success/error
                    try {
                        await fs.unlink(file.path);
                    } catch (unlinkErr) {
                        console.error(`Failed to delete file ${file.path}:`, unlinkErr.message);
                    }
                }
            })
        );

        // Return only the results array as requested
        return res.status(200).json(processedResults);

    } catch (error) {
        console.error("Global Conversion Error:", error);
        
        // Ensure cleanup even on global failure (though mapped logic should handle it)
        for (const file of files) {
            try { await fs.unlink(file.path); } catch {}
        }

        return res.status(500).json({
            error: "Critical error during text conversion",
            details: error.message
        });
    }
}

export { convertText };