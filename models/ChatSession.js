import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    lastMessage: {
        type: String,
        default: ''
    },
    messageCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
chatSessionSchema.index({ user: 1, createdAt: -1 });
chatSessionSchema.index({ user: 1, isActive: 1 });

export default mongoose.model('ChatSession', chatSessionSchema);