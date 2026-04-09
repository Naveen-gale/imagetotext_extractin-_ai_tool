import PptHistory from "../models/PptHistory.js";

export const saveHistory = async (req, res) => {
    try {
        const history = new PptHistory(req.body);
        await history.save();
        res.status(201).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getHistory = async (req, res) => {
    try {
        const history = await PptHistory.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: history });
    } catch (error) {
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
        await PptHistory.deleteMany({});
        res.status(200).json({ success: true, message: "All history cleared" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
