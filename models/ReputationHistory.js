import mongoose from 'mongoose';

const reputationHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true,
        enum: [
            'question_asked',
            'answer_accepted',
            'answer_upvoted',
            'question_upvoted',
            'answer_downvoted',
            'question_downvoted',
            'badge_earned',
            'moderation_penalty',
            'admin_adjustment'
        ]
    },
    relatedEntity: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'entityType'
    },
    entityType: {
        type: String,
        enum: ['Question', 'Answer', 'Comment']
    },
    totalReputation: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
reputationHistorySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('ReputationHistory', reputationHistorySchema);