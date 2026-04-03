import Tesseract from "tesseract.js";

export const textConverter = async (imagePath) => {
    try {
        const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
        return text;
    } catch (error) {
        console.error("OCR Error:", error.message);
        throw error;
    }
}
