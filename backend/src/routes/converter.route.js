import { uploadImages } from "../services/uploadImage.service.js";
import { Router } from "express";
import { uploadImage, convertText } from "../controllers/converter.controller.js";
const router = Router();


router.post("/convert", uploadImages, uploadImage)
router.post("/convert-text", uploadImages, convertText)


export default router;