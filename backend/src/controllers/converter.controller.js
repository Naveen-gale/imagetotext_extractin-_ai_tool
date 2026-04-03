import { textConverter } from "../services/textConverter.service.js";


const uploadImage = (req, res) => {
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No files received! Please ensure you are using 'photos' as the field name and sending 'form-data'."
        });
    }

    console.log("Uploaded files:", files);

    res.status(200).json({
        success: true,
        message: "File(s) uploaded successfully",
        data: files
    })
}

const convertText = async (req, res) => {
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No files received! Please ensure you are using 'photos' as the field name and sending 'form-data'."
        });
    }

    try {
        const results = [];
        for (const file of files) {
            const rawText = await textConverter(file.path);
            
            
            const cleanText = rawText.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();

            results.push({
                fileName: file.originalname,
                text: cleanText
            });
        }

        // Return only the results array as requested
        res.status(200).json(results);

    } catch (error) {
        console.error("Conversion Error:", error);
        res.status(500).json({
            error: "Error during text conversion",
            details: error.message
        });
    }
}


export { uploadImage, convertText };