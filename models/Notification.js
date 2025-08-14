import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'follow',
            'question_upvote',
            'question_downvote',
            'answer_upvote',
            'answer_downvote',
            'answer_accepted',
            'new_answer',
            'new_comment',
            'mention',
            'badge_earned',
            'reputation_milestone'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    data: {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        answerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer' },
        commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
        badge: { type: String },
        reputationChange: { type: Number },
        url: { type: String }
    },
    readAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.model('Notification', notificationSchema);
