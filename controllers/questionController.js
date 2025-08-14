import Question from '../models/Question.js';
import User from '../models/User.js';
import Answer from '../models/Answer.js';

// @desc    Get all questions with pagination and filtering
// @route   GET /api/questions
// @access  Public
export const getAllQuestions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'createdAt'; // createdAt, votes, answers
        const order = req.query.order === 'asc' ? 1 : -1;
        const tags = req.query.tags ? req.query.tags.split(',') : null;

        const skip = (page - 1) * limit;

        // Build query
        let query = {};
        if (tags && tags.length > 0) {
            query.tags = { $in: tags };
        }

        // Build sort object
        let sortOptions = {};
        if (sortBy === 'answers') {
            sortOptions = { 'answers.length': order };
        } else {
            sortOptions[sortBy] = order;
        }

        const questions = await Question.find(query)
            .populate('user', 'username reputation')
            .populate({
                path: 'answers',
                select: 'user body votes isAccepted createdAt',
                populate: {
                    path: 'user',
                    select: 'username reputation'
                }
            })
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        const totalQuestions = await Question.countDocuments(query);
        const totalPages = Math.ceil(totalQuestions / limit);

        res.status(200).json({
            success: true,
            data: {
                questions,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalQuestions,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching questions'
        });
    }
};

// @desc    Get single question by ID
// @route   GET /api/questions/:id
// @access  Public
export const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('user', 'username reputation profile')
            .populate({
                path: 'answers',
                populate: {
                    path: 'user',
                    select: 'username reputation'
                }
            })
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username'
                }
            });

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { question }
        });

    } catch (error) {
        console.error('Get question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching question'
        });
    }
};

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private
export const createQuestion = async (req, res) => {
    try {
        const { title, body, tags } = req.body;

        // Validation
        if (!title || !body) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title and body for the question'
            });
        }

        // Create question
        const question = await Question.create({
            user: req.user.id,
            title: title.trim(),
            body: body.trim(),
            tags: tags || []
        });

        // Populate user data
        await question.populate('user', 'username reputation');

        res.status(201).json({
            success: true,
            message: 'Question created successfully',
            data: { question }
        });

    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating question'
        });
    }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private (only question owner)
export const updateQuestion = async (req, res) => {
    try {
        const { title, body, tags } = req.body;

        let question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Check if user owns the question
        if (question.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this question'
            });
        }

        // Update question
        question = await Question.findByIdAndUpdate(
            req.params.id,
            { title, body, tags },
            { new: true, runValidators: true }
        ).populate('user', 'username reputation');

        res.status(200).json({
            success: true,
            message: 'Question updated successfully',
            data: { question }
        });

    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating question'
        });
    }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private (only question owner or admin)
export const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Check if user owns the question or is admin
        if (question.user.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this question'
            });
        }

        // Delete associated answers
        await Answer.deleteMany({ question: req.params.id });

        // Delete the question
        await Question.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Question and associated answers deleted successfully'
        });

    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting question'
        });
    }
};

// @desc    Search questions by title, body, or tags
// @route   GET /api/questions/search
// @access  Public
export const searchQuestions = async (req, res) => {
    try {
        const { q, tags, page = 1, limit = 10 } = req.query;

        if (!q && !tags) {
            return res.status(400).json({
                success: false,
                message: 'Please provide search query or tags'
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        let query = {};

        // Text search
        if (q) {
            query.$text = { $search: q };
        }

        // Tag filter
        if (tags) {
            const tagArray = tags.split(',');
            query.tags = { $in: tagArray };
        }

        const questions = await Question.find(query)
            .populate('user', 'username reputation')
            .populate('answers', 'user isAccepted')
            .sort({ score: { $meta: 'textScore' } })
            .skip(skip)
            .limit(parseInt(limit));

        const totalQuestions = await Question.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                questions,
                totalQuestions,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalQuestions / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Search questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error searching questions'
        });
    }
};

// @desc    Vote on a question (upvote/downvote)
// @route   POST /api/questions/:id/vote
// @access  Private
export const voteOnQuestion = async (req, res) => {
    try {
        const { voteType } = req.body; // 'up' or 'down'

        if (!['up', 'down'].includes(voteType)) {
            return res.status(400).json({
                success: false,
                message: 'Vote type must be "up" or "down"'
            });
        }

        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Prevent users from voting on their own questions
        if (question.user.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot vote on your own question'
            });
        }

        // Update vote count
        const voteValue = voteType === 'up' ? 1 : -1;
        question.votes += voteValue;
        await question.save();

        // Update question owner's reputation
        const reputationChange = voteType === 'up' ? 5 : -2;
        await User.findByIdAndUpdate(
            question.user,
            { $inc: { reputation: reputationChange } }
        );

        res.status(200).json({
            success: true,
            message: `Question ${voteType}voted successfully`,
            data: {
                questionId: question._id,
                newVoteCount: question.votes
            }
        });

    } catch (error) {
        console.error('Vote question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error voting on question'
        });
    }
};

// @desc    Get questions by user
// @route   GET /api/questions/user/:userId
// @access  Public
export const getQuestionsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const questions = await Question.find({ user: userId })
            .populate('user', 'username reputation')
            .populate('answers', 'user isAccepted')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalQuestions = await Question.countDocuments({ user: userId });

        res.status(200).json({
            success: true,
            data: {
                questions,
                totalQuestions,
                currentPage: page,
                totalPages: Math.ceil(totalQuestions / limit)
            }
        });

    } catch (error) {
        console.error('Get user questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user questions'
        });
    }
};
