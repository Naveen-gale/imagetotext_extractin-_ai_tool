import { uploadImages } from "../services/uploadImage.service.js";
import { Router } from "express";
import {
    convertImages,
    summarize,
    translate,
    grammar,
    extractInfo,
} from "../controllers/converter.controller.js";

const router = Router();

// Image upload & text extraction
router.post("/convert", uploadImages, convertImages);

// AI Features (JSON body)
router.post("/ai/summarize", summarize);
router.post("/ai/translate", translate);
router.post("/ai/fix-grammar", grammar);
router.post("/ai/extract-info", extractInfo);

export default router;