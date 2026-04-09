import ExtractHistory from "../models/ExtractHistory.js";

export const saveHistory = async (req, res) => {
    try {
        const history = new ExtractHistory(req.body);
        await history.save();
        res.status(201).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getHistory = async (req, res) => {
    try {
        const history = await ExtractHistory.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: history });
    } catch (error) {
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
        await ExtractHistory.deleteMany({});
        res.status(200).json({ success: true, message: "All history cleared" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
