import ImageKit from "imagekit";
import fs from "fs/promises";
import path from "path";

// Lazy initialization so dotenv loads before keys are read
let _imagekit = null;
const getImageKit = () => {
    if (!_imagekit) {
        _imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        });
    }
    return _imagekit;
};

/**
 * Uploads an image file to ImageKit and returns metadata
 */
export const uploadToImageKit = async (filePath, originalName) => {
    try {
        const fileBuffer = await fs.readFile(filePath);
        const fileName = `img_${Date.now()}_${path.basename(originalName)}`;

        const response = await getImageKit().upload({
            file: fileBuffer,
            fileName,
            folder: "/image-to-text",
            useUniqueFileName: true,
            tags: ["ocr", "image-to-text"],
        });

        return {
            url: response.url,
            fileId: response.fileId,
            name: response.name,
            filePath: response.filePath,
            thumbnailUrl: response.thumbnailUrl,
        };
    } catch (error) {
        console.error("ImageKit upload error:", error.message);
        throw new Error(`Image upload failed: ${error.message}`);
    }
};
