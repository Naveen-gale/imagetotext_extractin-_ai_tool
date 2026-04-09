import express from "express";
import { saveHistory, getHistory, deleteHistoryItem, clearHistory, getHistoryById } from "../controllers/history.controller.js";

const router = express.Router();

router.post("/", saveHistory);
router.get("/", getHistory);
router.get("/:id", getHistoryById);
router.delete("/clear", clearHistory);
router.delete("/:id", deleteHistoryItem);

export default router;
