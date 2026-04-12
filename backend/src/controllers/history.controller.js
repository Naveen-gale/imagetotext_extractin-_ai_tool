import PptHistory from "../models/PptHistory.js";

export const saveHistory = async (req, res) => {
    try {
        const sessionId = req.headers["x-session-id"] || "anonymous";
        const history = new PptHistory({ ...req.body, sessionId });
        await history.save();
        res.status(201).json({ success: true, data: history });
    } catch (error) {
        if (error.message.includes("buffering timed out")) {
            return res.status(503).json({ success: false, message: "Database connection failed. Please check your MongoDB IP whitelist or network connection." });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getHistory = async (req, res) => {
    try {
        const sessionId = req.headers["x-session-id"] || "anonymous";
        const history = await PptHistory.find({ sessionId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        if (error.message.includes("buffering timed out")) {
            return res.status(503).json({ success: false, message: "Database connection failed. Please check your MongoDB IP whitelist or network connection." });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getHistoryById = async (req, res) => {
    try {
        const historyItem = await PptHistory.findById(req.params.id);
        if (!historyItem) {
            return res.status(404).json({ success: false, message: "History item not found" });
        }
        res.status(200).json({ success: true, data: historyItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteHistoryItem = async (req, res) => {
    try {
        await PptHistory.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Item deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const clearHistory = async (req, res) => {
    try {
        const sessionId = req.headers["x-session-id"] || "anonymous";
        await PptHistory.deleteMany({ sessionId });
        res.status(200).json({ success: true, message: "All user history cleared" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
