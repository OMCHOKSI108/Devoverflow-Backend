import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    tags: [String],
    votes: { type: Number, default: 0 },
    answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

questionSchema.index({ title: 'text', body: 'text' });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ votes: -1, createdAt: -1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ isActive: 1, createdAt: -1 });
questionSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Question', questionSchema);
