import mongoose from 'mongoose';

const pptHistorySchema = new mongoose.Schema({
    prompt: { type: String, required: true },
    slideCount: { type: Number, required: true },
    template: { type: String, required: true },
    fontStyle: { type: String, required: true },
    slides: { type: Array, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('PptHistory', pptHistorySchema);
