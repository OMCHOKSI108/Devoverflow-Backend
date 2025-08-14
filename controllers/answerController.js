import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import User from '../models/User.js';

// @desc    Create a new answer for a question
// @route   POST /api/answers/:questionId
// @access  Private
export const createAnswer = async (req, res) => {
    try {
        const { body } = req.body;
        const { questionId } = req.params;

        // Validation
        if (!body) {
            return res.status(400).json({
                success: false,
                message: 'Please provide answer body'
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

        // Create answer
        const answer = await Answer.create({
            user: req.user.id,
            question: questionId,
            body: body.trim()
        });

        // Add answer to question's answers array
        question.answers.push(answer._id);
        await question.save();

        // Populate user data
        await answer.populate('user', 'username reputation');

        res.status(201).json({
            success: true,
            message: 'Answer created successfully',
            data: { answer }
        });

    } catch (error) {
        console.error('Create answer error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating answer'
        });
    }
};

// @desc    Get all answers for a question
// @route   GET /api/answers/:questionId
// @access  Public
export const getAnswersByQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'votes'; // votes, createdAt
        const order = req.query.order === 'asc' ? 1 : -1;

        const skip = (page - 1) * limit;

        // Check if question exists
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Build sort object - put accepted answers first
        let sortOptions = { isAccepted: -1 };
        sortOptions[sortBy] = order;

        const answers = await Answer.find({ question: questionId })
            .populate('user', 'username reputation profile')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username'
                }
            })
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        const totalAnswers = await Answer.countDocuments({ question: questionId });

        res.status(200).json({
            success: true,
            data: {
                answers,
                totalAnswers,
                currentPage: page,
                totalPages: Math.ceil(totalAnswers / limit)
            }
        });

    } catch (error) {
        console.error('Get answers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching answers'
        });
    }
};

// @desc    Update an answer
// @route   PUT /api/answers/:id
// @access  Private (only answer owner)
export const updateAnswer = async (req, res) => {
    try {
        const { body } = req.body;

        let answer = await Answer.findById(req.params.id);

        if (!answer) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        // Check if user owns the answer
        if (answer.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this answer'
            });
        }

        // Update answer
        answer = await Answer.findByIdAndUpdate(
            req.params.id,
            { body },
            { new: true, runValidators: true }
        ).populate('user', 'username reputation');

        res.status(200).json({
            success: true,
            message: 'Answer updated successfully',
            data: { answer }
        });

    } catch (error) {
        console.error('Update answer error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating answer'
        });
    }
};

// @desc    Delete an answer
// @route   DELETE /api/answers/:id
// @access  Private (only answer owner or admin)
export const deleteAnswer = async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.id);

        if (!answer) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        // Check if user owns the answer or is admin
        if (answer.user.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this answer'
            });
        }

        // Remove answer from question's answers array
        await Question.findByIdAndUpdate(
            answer.question,
            { $pull: { answers: answer._id } }
        );

        // Delete the answer
        await Answer.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Answer deleted successfully'
        });

    } catch (error) {
        console.error('Delete answer error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting answer'
        });
    }
};

// @desc    Vote on an answer (upvote/downvote)
// @route   POST /api/answers/:id/vote
// @access  Private
export const voteOnAnswer = async (req, res) => {
    try {
        const { voteType } = req.body; // 'up' or 'down'

        if (!['up', 'down'].includes(voteType)) {
            return res.status(400).json({
                success: false,
                message: 'Vote type must be "up" or "down"'
            });
        }

        const answer = await Answer.findById(req.params.id);

        if (!answer) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        // Prevent users from voting on their own answers
        if (answer.user.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot vote on your own answer'
            });
        }

        // Update vote count
        const voteValue = voteType === 'up' ? 1 : -1;
        answer.votes += voteValue;
        await answer.save();

        // Update answer owner's reputation
        const reputationChange = voteType === 'up' ? 10 : -5;
        await User.findByIdAndUpdate(
            answer.user,
            { $inc: { reputation: reputationChange } }
        );

        res.status(200).json({
            success: true,
            message: `Answer ${voteType}voted successfully`,
            data: {
                answerId: answer._id,
                newVoteCount: answer.votes
            }
        });

    } catch (error) {
        console.error('Vote answer error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error voting on answer'
        });
    }
};

// @desc    Accept an answer as the correct solution
// @route   POST /api/answers/:id/accept
// @access  Private (only question owner)
export const acceptAnswer = async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.id).populate('question');

        if (!answer) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        // Check if user owns the question
        if (answer.question.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Only the question owner can accept answers'
            });
        }

        // Unaccept all other answers for this question
        await Answer.updateMany(
            { question: answer.question._id },
            { isAccepted: false }
        );

        // Accept this answer
        answer.isAccepted = true;
        await answer.save();

        // Give bonus reputation to answer owner
        await User.findByIdAndUpdate(
            answer.user,
            { $inc: { reputation: 15 } }
        );

        res.status(200).json({
            success: true,
            message: 'Answer accepted successfully',
            data: { answer }
        });

    } catch (error) {
        console.error('Accept answer error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error accepting answer'
        });
    }
};

// @desc    Get answers by user
// @route   GET /api/answers/user/:userId
// @access  Public
export const getAnswersByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const answers = await Answer.find({ user: userId })
            .populate('user', 'username reputation')
            .populate('question', 'title')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalAnswers = await Answer.countDocuments({ user: userId });

        res.status(200).json({
            success: true,
            data: {
                answers,
                totalAnswers,
                currentPage: page,
                totalPages: Math.ceil(totalAnswers / limit)
            }
        });

    } catch (error) {
        console.error('Get user answers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user answers'
        });
    }
};
