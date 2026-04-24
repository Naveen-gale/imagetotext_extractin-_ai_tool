import mongoose from 'mongoose';

const aiLearningSchema = new mongoose.Schema({
    sessionId: { type: String, index: true },
    
    input: {
        type: { type: String }, // 'title', 'bullet', etc.
        topic: { type: String },
        text: { type: String }
    },

    output: {
        text: { type: String }
    },

    context: {
        slide_type: { type: String },
        style: { type: String },
        max_words: { type: Number }
    },

    meta: {
        source: { type: String, default: 'user_edit' },
        confidence: { type: Number, default: 1.0 }
    },

    createdAt: { type: Date, default: Date.now },
});

// Index for fast retrieval of recent corrections in a session
aiLearningSchema.index({ sessionId: 1, createdAt: -1 });

export default mongoose.model('AiLearning', aiLearningSchema);
