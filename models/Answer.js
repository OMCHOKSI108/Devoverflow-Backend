import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    body: { type: String, required: true },
    votes: { type: Number, default: 0 },
    isAccepted: { type: Boolean, default: false },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, { timestamps: true });

// Add indexes for better performance
answerSchema.index({ question: 1, createdAt: -1 });
answerSchema.index({ user: 1, createdAt: -1 });
answerSchema.index({ votes: -1 });
answerSchema.index({ isAccepted: 1 });

export default mongoose.model('Answer', answerSchema);
