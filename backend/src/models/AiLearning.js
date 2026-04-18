import mongoose from 'mongoose';

const aiLearningSchema = new mongoose.Schema({
    sessionId: { type: String, index: true },
    originalValue: { type: String, required: true },
    correctedValue: { type: String, required: true },
    type: { type: String, enum: ['title', 'bullet', 'quote', 'stat', 'timeline', 'style', 'general'], default: 'general' },
    slideTopic: { type: String },
    createdAt: { type: Date, default: Date.now },
});

// Index for fast retrieval of recent corrections in a session
aiLearningSchema.index({ sessionId: 1, createdAt: -1 });

export default mongoose.model('AiLearning', aiLearningSchema);
