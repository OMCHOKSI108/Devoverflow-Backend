import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    body: {
        type: String,
        required: true,
        trim: true
    },
    // Reference to either question or answer
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    contentType: {
        type: String,
        enum: ['question', 'answer'],
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);
