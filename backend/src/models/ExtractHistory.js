import mongoose from 'mongoose';

const extractHistorySchema = new mongoose.Schema({
    results: { type: Array, required: true },
    totalWords: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('ExtractHistory', extractHistorySchema);
