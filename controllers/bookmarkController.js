import Bookmark from '../models/Bookmark.js';
import User from '../models/User.js';
import Question from '../models/Question.js';

// @desc    Get user's external bookmarks
// @route   GET /api/bookmarks
// @access  Private
export const getBookmarks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const bookmarks = await Bookmark.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalBookmarks = await Bookmark.countDocuments({ user: req.user.id });
        const totalPages = Math.ceil(totalBookmarks / limit);

        res.status(200).json({
            success: true,
            data: {
                bookmarks,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalBookmarks,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get bookmarks error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Add an external bookmark
// @route   POST /api/bookmarks
// @access  Private
export const addBookmark = async (req, res) => {
    try {
        const { title, excerpt, link, tags, isPublic } = req.body;

        // Validate required fields
        if (!title || !excerpt || !link) {
            return res.status(400).json({
                success: false,
                message: 'Title, excerpt, and link are required'
            });
        }

        // Create bookmark
        const bookmark = await Bookmark.create({
            user: req.user.id,
            title: title.trim(),
            excerpt: excerpt.trim(),
            link: link.trim(),
            tags: tags || [],
            isPublic: isPublic || false
        });

        res.status(201).json({
            success: true,
            message: 'Bookmark added successfully',
            data: {
                bookmark
            }
        });

    } catch (error) {
        console.error('Add bookmark error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Remove an external bookmark
// @route   DELETE /api/bookmarks/:bookmarkId
// @access  Private
export const removeBookmark = async (req, res) => {
    try {
        const bookmark = await Bookmark.findOneAndDelete({
            _id: req.params.bookmarkId,
            user: req.user.id
        });

        if (!bookmark) {
            return res.status(404).json({
                success: false,
                message: 'Bookmark not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Bookmark removed successfully'
        });

    } catch (error) {
        console.error('Remove bookmark error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Add a question to bookmarks (legacy)
// @route   POST /api/bookmarks/question/:questionId
// @access  Private
export const addQuestionBookmark = async (req, res) => {
    try {
        const { questionId } = req.params;

        // Check if question exists
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Check if already bookmarked
        const user = await User.findById(req.user.id);
        if (user.bookmarks.some(bookmark => bookmark.toString() === questionId)) {
            return res.status(400).json({
                success: false,
                message: 'Question already bookmarked'
            });
        }

        // Add bookmark
        user.bookmarks.push(questionId);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Question bookmarked successfully',
            data: {
                questionId,
                totalBookmarks: user.bookmarks.length
            }
        });

    } catch (error) {
        console.error('Add question bookmark error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Remove a question from bookmarks (legacy)
// @route   DELETE /api/bookmarks/question/:questionId
// @access  Private
export const removeQuestionBookmark = async (req, res) => {
    try {
        const { questionId } = req.params;

        const user = await User.findById(req.user.id);

        // Check if question is bookmarked
        if (!user.bookmarks.some(bookmark => bookmark.toString() === questionId)) {
            return res.status(400).json({
                success: false,
                message: 'Question not in bookmarks'
            });
        }

        // Remove bookmark
        user.bookmarks = user.bookmarks.filter(
            bookmark => bookmark.toString() !== questionId
        );
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Bookmark removed successfully',
            data: {
                questionId,
                totalBookmarks: user.bookmarks.length
            }
        });

    } catch (error) {
        console.error('Remove question bookmark error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Check if a question is bookmarked by user
// @route   GET /api/bookmarks/check/:questionId
// @access  Private
export const checkBookmark = async (req, res) => {
    try {
        const { questionId } = req.params;

        const user = await User.findById(req.user.id);
        const isBookmarked = user.bookmarks.some(bookmark => bookmark.toString() === questionId);

        res.status(200).json({
            success: true,
            data: {
                questionId,
                isBookmarked
            }
        });

    } catch (error) {
        console.error('Check bookmark error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
