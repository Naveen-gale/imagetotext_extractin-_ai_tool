import ExtractHistory from "../models/ExtractHistory.js";

export const saveHistory = async (req, res) => {
    try {
        const sessionId = req.headers["x-session-id"] || "anonymous";
        const history = new ExtractHistory({ ...req.body, sessionId });
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
        const history = await ExtractHistory.find({ sessionId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        if (error.message.includes("buffering timed out")) {
            return res.status(503).json({ success: false, message: "Database connection failed. Please check your MongoDB IP whitelist or network connection." });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteHistoryItem = async (req, res) => {
    try {
        await ExtractHistory.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Item deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const clearHistory = async (req, res) => {
    try {
        const sessionId = req.headers["x-session-id"] || "anonymous";
        await ExtractHistory.deleteMany({ sessionId });
        res.status(200).json({ success: true, message: "All user history cleared" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
