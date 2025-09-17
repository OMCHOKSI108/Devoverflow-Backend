import mongoose from 'mongoose';

const FlowSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    prompt: { type: String, required: true },
    mermaid: { type: String },
    pngUrl: { type: String },
    svgUrl: { type: String },
    status: { type: String, enum: ['pending', 'done', 'failed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Flow', FlowSchema);
