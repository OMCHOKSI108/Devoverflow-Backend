import Comment from '../models/Comment.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';

// @desc    Add comment to a question
// @route   POST /api/comments/question/:questionId
// @access  Private
export const addCommentToQuestion = async (req, res) => {
    try {
        const { body } = req.body;
        const { questionId } = req.params;

        // Validation
        if (!body) {
            return res.status(400).json({
                success: false,
                message: 'Please provide comment body'
            });
        }

        // Check if question exists
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Create comment
        const comment = await Comment.create({
            user: req.user.id,
            body: body.trim(),
            contentId: questionId,
            contentType: 'question'
        });

        // Add comment to question's comments array
        question.comments.push(comment._id);
        await question.save();

        // Populate user data
        await comment.populate('user', 'username reputation');

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: { comment }
        });

    } catch (error) {
        console.error('Add comment to question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error adding comment'
        });
    }
};

// @desc    Add comment to an answer
// @route   POST /api/comments/answer/:answerId
// @access  Private
export const addCommentToAnswer = async (req, res) => {
    try {
        const { body } = req.body;
        const { answerId } = req.params;

        // Validation
        if (!body) {
            return res.status(400).json({
                success: false,
                message: 'Please provide comment body'
            });
        }

        // Check if answer exists
        const answer = await Answer.findById(answerId);
        if (!answer) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        // Create comment
        const comment = await Comment.create({
            user: req.user.id,
            body: body.trim(),
            contentId: answerId,
            contentType: 'answer'
        });

        // Add comment to answer's comments array
        answer.comments.push(comment._id);
        await answer.save();

        // Populate user data
        await comment.populate('user', 'username reputation');

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: { comment }
        });

    } catch (error) {
        console.error('Add comment to answer error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error adding comment'
        });
    }
};

// @desc    Get comments for a question
// @route   GET /api/comments/question/:questionId
// @access  Public
export const getQuestionComments = async (req, res) => {
    try {
        const { questionId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Check if question exists
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        const comments = await Comment.find({
            contentId: questionId,
            contentType: 'question'
        })
            .populate('user', 'username reputation')
            .sort({ createdAt: 1 }) // Oldest first for comments
            .skip(skip)
            .limit(limit);

        const totalComments = await Comment.countDocuments({
            contentId: questionId,
            contentType: 'question'
        });

        res.status(200).json({
            success: true,
            data: {
                comments,
                totalComments,
                currentPage: page,
                totalPages: Math.ceil(totalComments / limit)
            }
        });

    } catch (error) {
        console.error('Get question comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching comments'
        });
    }
};

// @desc    Get comments for an answer
// @route   GET /api/comments/answer/:answerId
// @access  Public
export const getAnswerComments = async (req, res) => {
    try {
        const { answerId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Check if answer exists
        const answer = await Answer.findById(answerId);
        if (!answer) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        const comments = await Comment.find({
            contentId: answerId,
            contentType: 'answer'
        })
            .populate('user', 'username reputation')
            .sort({ createdAt: 1 }) // Oldest first for comments
            .skip(skip)
            .limit(limit);

        const totalComments = await Comment.countDocuments({
            contentId: answerId,
            contentType: 'answer'
        });

        res.status(200).json({
            success: true,
            data: {
                comments,
                totalComments,
                currentPage: page,
                totalPages: Math.ceil(totalComments / limit)
            }
        });

    } catch (error) {
        console.error('Get answer comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching comments'
        });
    }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private (only comment owner)
export const updateComment = async (req, res) => {
    try {
        const { body } = req.body;

        let comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user owns the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this comment'
            });
        }

        // Update comment
        comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { body },
            { new: true, runValidators: true }
        ).populate('user', 'username reputation');

        res.status(200).json({
            success: true,
            message: 'Comment updated successfully',
            data: { comment }
        });

    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating comment'
        });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (only comment owner or admin)
export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user owns the comment or is admin
        if (comment.user.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        // Remove comment from question/answer comments array
        if (comment.contentType === 'question') {
            await Question.findByIdAndUpdate(
                comment.contentId,
                { $pull: { comments: comment._id } }
            );
        } else if (comment.contentType === 'answer') {
            await Answer.findByIdAndUpdate(
                comment.contentId,
                { $pull: { comments: comment._id } }
            );
        }

        // Delete the comment
        await Comment.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });

    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting comment'
        });
    }
};
