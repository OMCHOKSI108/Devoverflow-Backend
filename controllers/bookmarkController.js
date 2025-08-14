import User from '../models/User.js';
import Question from '../models/Question.js';

// @desc    Get user's bookmarked questions
// @route   GET /api/bookmarks
// @access  Private
export const getBookmarks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await User.findById(req.user.id)
            .populate({
                path: 'bookmarks',
                populate: {
                    path: 'user',
                    select: 'username reputation'
                },
                options: {
                    skip: skip,
                    limit: limit,
                    sort: { createdAt: -1 }
                }
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const totalBookmarks = user.bookmarks.length;
        const totalPages = Math.ceil(totalBookmarks / limit);

        res.status(200).json({
            success: true,
            data: {
                bookmarks: user.bookmarks,
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
            message: 'Server error fetching bookmarks'
        });
    }
};

// @desc    Add a question to bookmarks
// @route   POST /api/bookmarks/:questionId
// @access  Private
export const addBookmark = async (req, res) => {
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
        if (user.bookmarks.includes(questionId)) {
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
        console.error('Add bookmark error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error adding bookmark'
        });
    }
};

// @desc    Remove a question from bookmarks
// @route   DELETE /api/bookmarks/:questionId
// @access  Private
export const removeBookmark = async (req, res) => {
    try {
        const { questionId } = req.params;

        const user = await User.findById(req.user.id);

        // Check if question is bookmarked
        if (!user.bookmarks.includes(questionId)) {
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
        console.error('Remove bookmark error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error removing bookmark'
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
        const isBookmarked = user.bookmarks.includes(questionId);

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
            message: 'Server error checking bookmark status'
        });
    }
};
