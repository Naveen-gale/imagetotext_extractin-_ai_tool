import { uploadImages } from "../services/uploadImage.service.js";
import { Router } from "express";
import { convertText } from "../controllers/converter.controller.js";
const router = Router();


router.post("/convert", uploadImages, convertText)


export default router;