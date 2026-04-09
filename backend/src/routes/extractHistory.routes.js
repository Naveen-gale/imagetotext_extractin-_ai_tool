import express from "express";
import { saveHistory, getHistory, deleteHistoryItem, clearHistory } from "../controllers/extractHistory.controller.js";

const router = express.Router();

router.post("/", saveHistory);
router.get("/", getHistory);
router.delete("/clear", clearHistory);
router.delete("/:id", deleteHistoryItem);

export default router;
