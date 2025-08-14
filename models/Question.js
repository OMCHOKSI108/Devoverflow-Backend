import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    tags: [String],
    votes: { type: Number, default: 0 },
    answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, { timestamps: true });

questionSchema.index({ title: 'text', body: 'text' });

export default mongoose.model('Question', questionSchema);
