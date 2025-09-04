import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Comment from '../models/Comment.js';
import Report from '../models/Report.js';

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private (Admin only)
export const getReports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status; // pending, resolved
        const contentType = req.query.contentType; // question, answer
        const skip = (page - 1) * limit;

        // Build filter
        let filter = {};
        if (status) filter.status = status;
        if (contentType) filter.contentType = contentType;

        const reports = await Report.find(filter)
            .populate('reporter', 'username email')
            .populate({
                path: 'contentId',
                populate: {
                    path: 'user',
                    select: 'username email'
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalReports = await Report.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                reports,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalReports / limit),
                    totalReports,
                    hasNextPage: page < Math.ceil(totalReports / limit),
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching reports'
        });
    }
};

// @desc    Create a new report
// @route   POST /api/admin/reports
// @access  Private
export const createReport = async (req, res) => {
    try {
        const { contentId, contentType, reason } = req.body;

        // Validation
        if (!contentId || !contentType || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Please provide contentId, contentType, and reason'
            });
        }

        // Check if content exists
        let content;
        if (contentType === 'question') {
            content = await Question.findById(contentId);
        } else if (contentType === 'answer') {
            content = await Answer.findById(contentId);
        }

        if (!content) {
            return res.status(404).json({
                success: false,
                message: `${contentType} not found`
            });
        }

        // Check if user already reported this content
        const existingReport = await Report.findOne({
            reporter: req.user.id,
            contentId,
            contentType
        });

        if (existingReport) {
            return res.status(400).json({
                success: false,
                message: 'You have already reported this content'
            });
        }

        // Create report
        const report = await Report.create({
            reporter: req.user.id,
            contentId,
            contentType,
            reason
        });

        await report.populate('reporter', 'username');

        res.status(201).json({
            success: true,
            message: 'Report submitted successfully',
            data: { report }
        });

    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating report'
        });
    }
};

// @desc    Resolve a report
// @route   PUT /api/admin/reports/:id/resolve
// @access  Private (Admin only)
export const resolveReport = async (req, res) => {
    try {
        const { action } = req.body; // 'dismiss' or 'delete'

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Update report status
        report.status = 'resolved';
        await report.save();

        // Take action if needed
        if (action === 'delete') {
            if (report.contentType === 'question') {
                await Question.findByIdAndDelete(report.contentId);
                // Also delete associated answers
                await Answer.deleteMany({ question: report.contentId });
            } else if (report.contentType === 'answer') {
                await Answer.findByIdAndDelete(report.contentId);
            }
        }

        res.status(200).json({
            success: true,
            message: `Report resolved ${action === 'delete' ? 'and content deleted' : ''}`,
            data: { report }
        });

    } catch (error) {
        console.error('Resolve report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error resolving report'
        });
    }
};

// @desc    Delete content as admin
// @route   DELETE /api/admin/content/:type/:id
// @access  Private (Admin only)
export const deleteContentAsAdmin = async (req, res) => {
    try {
        const { type, id } = req.params;

        let deletedContent;

        if (type === 'question') {
            deletedContent = await Question.findByIdAndDelete(id);
            if (deletedContent) {
                // Delete associated answers
                await Answer.deleteMany({ question: id });
                // Delete associated comments
                await Comment.deleteMany({ contentId: id, contentType: 'question' });
            }
        } else if (type === 'answer') {
            deletedContent = await Answer.findByIdAndDelete(id);
            if (deletedContent) {
                // Remove from question's answers array
                await Question.findByIdAndUpdate(
                    deletedContent.question,
                    { $pull: { answers: id } }
                );
                // Delete associated comments
                await Comment.deleteMany({ contentId: id, contentType: 'answer' });
            }
        } else if (type === 'comment') {
            const comment = await Comment.findByIdAndDelete(id);
            if (comment) {
                // Remove from question/answer comments array
                if (comment.contentType === 'question') {
                    await Question.findByIdAndUpdate(
                        comment.contentId,
                        { $pull: { comments: id } }
                    );
                } else if (comment.contentType === 'answer') {
                    await Answer.findByIdAndUpdate(
                        comment.contentId,
                        { $pull: { comments: id } }
                    );
                }
            }
            deletedContent = comment;
        }

        if (!deletedContent) {
            return res.status(404).json({
                success: false,
                message: `${type} not found`
            });
        }

        res.status(200).json({
            success: true,
            message: `${type} deleted successfully`,
            data: { deletedId: id }
        });

    } catch (error) {
        console.error('Admin delete content error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting content'
        });
    }
};

// @desc    Get comprehensive admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getAdminStats = async (req, res) => {
    try {
        // === BASIC COUNTS ===
        const totalUsers = await User.countDocuments();
        const totalQuestions = await Question.countDocuments();
        const totalAnswers = await Answer.countDocuments();
        const totalComments = await Comment.countDocuments();
        const totalReports = await Report.countDocuments();
        const pendingReports = await Report.countDocuments({ status: 'pending' });
        const resolvedReports = await Report.countDocuments({ status: 'resolved' });

        // === USER ANALYTICS ===
        const verifiedUsers = await User.countDocuments({ isVerified: true });
        const unverifiedUsers = await User.countDocuments({ isVerified: false });
        const adminUsers = await User.countDocuments({ isAdmin: true });
        const regularUsers = await User.countDocuments({ isAdmin: false });

        // === CONTENT ANALYTICS ===
        const questionsWithAnswers = await Question.countDocuments({
            $expr: { $gt: [{ $size: "$answers" }, 0] }
        });
        const unansweredQuestions = await Question.countDocuments({ answers: { $size: 0 } });
        const acceptedAnswers = await Answer.countDocuments({ isAccepted: true });
        const unacceptedAnswers = await Answer.countDocuments({ isAccepted: false });

        // === TIME-BASED ANALYTICS ===
        const now = new Date();
        const today = new Date(now.setHours(0, 0, 0, 0));
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Today's activity
        const todayUsers = await User.countDocuments({ createdAt: { $gte: today } });
        const todayQuestions = await Question.countDocuments({ createdAt: { $gte: today } });
        const todayAnswers = await Answer.countDocuments({ createdAt: { $gte: today } });
        const todayComments = await Comment.countDocuments({ createdAt: { $gte: today } });

        // Yesterday's activity
        const yesterdayUsers = await User.countDocuments({
            createdAt: { $gte: yesterday, $lt: today }
        });
        const yesterdayQuestions = await Question.countDocuments({
            createdAt: { $gte: yesterday, $lt: today }
        });
        const yesterdayAnswers = await Answer.countDocuments({
            createdAt: { $gte: yesterday, $lt: today }
        });

        // Weekly activity
        const weeklyUsers = await User.countDocuments({ createdAt: { $gte: weekAgo } });
        const weeklyQuestions = await Question.countDocuments({ createdAt: { $gte: weekAgo } });
        const weeklyAnswers = await Answer.countDocuments({ createdAt: { $gte: weekAgo } });
        const weeklyComments = await Comment.countDocuments({ createdAt: { $gte: weekAgo } });

        // Monthly activity
        const monthlyUsers = await User.countDocuments({ createdAt: { $gte: monthAgo } });
        const monthlyQuestions = await Question.countDocuments({ createdAt: { $gte: monthAgo } });
        const monthlyAnswers = await Answer.countDocuments({ createdAt: { $gte: monthAgo } });

        // === TOP PERFORMERS ===
        const topUsersByReputation = await User.find()
            .select('username email reputation isAdmin isVerified createdAt')
            .sort({ reputation: -1 })
            .limit(10);

        const topQuestionsByVotes = await Question.find()
            .select('title votes user createdAt')
            .populate('user', 'username')
            .sort({ 'votes.upvotes': -1 })
            .limit(5);

        const topAnswersByVotes = await Answer.find()
            .select('body votes isAccepted user question createdAt')
            .populate('user', 'username')
            .populate('question', 'title')
            .sort({ 'votes.upvotes': -1 })
            .limit(5);

        // === MOST ACTIVE USERS ===
        const mostActiveUsers = await User.aggregate([
            {
                $lookup: {
                    from: 'questions',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'questions'
                }
            },
            {
                $lookup: {
                    from: 'answers',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'answers'
                }
            },
            {
                $addFields: {
                    totalActivity: {
                        $add: [{ $size: '$questions' }, { $size: '$answers' }]
                    }
                }
            },
            {
                $project: {
                    username: 1,
                    email: 1,
                    reputation: 1,
                    isAdmin: 1,
                    questionsCount: { $size: '$questions' },
                    answersCount: { $size: '$answers' },
                    totalActivity: 1
                }
            },
            { $sort: { totalActivity: -1 } },
            { $limit: 10 }
        ]);

        // === TAG ANALYTICS ===
        const popularTags = await Question.aggregate([
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { tag: '$_id', count: 1, _id: 0 } }
        ]);

        // === GROWTH METRICS ===
        const calculateGrowthRate = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const userGrowthRate = calculateGrowthRate(todayUsers, yesterdayUsers);
        const questionGrowthRate = calculateGrowthRate(todayQuestions, yesterdayQuestions);
        const answerGrowthRate = calculateGrowthRate(todayAnswers, yesterdayAnswers);

        // === ENGAGEMENT METRICS ===
        const averageAnswersPerQuestion = totalQuestions > 0 ?
            Math.round((totalAnswers / totalQuestions) * 100) / 100 : 0;

        const answerAcceptanceRate = totalAnswers > 0 ?
            Math.round((acceptedAnswers / totalAnswers) * 100) : 0;

        const userVerificationRate = totalUsers > 0 ?
            Math.round((verifiedUsers / totalUsers) * 100) : 0;

        // === RECENT ACTIVITY ===
        const recentUsers = await User.find()
            .select('username email isVerified isAdmin createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentQuestions = await Question.find()
            .select('title user createdAt votes')
            .populate('user', 'username')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentAnswers = await Answer.find()
            .select('body user question createdAt isAccepted')
            .populate('user', 'username')
            .populate('question', 'title')
            .sort({ createdAt: -1 })
            .limit(5);

        // === SYSTEM HEALTH ===
        const systemHealth = {
            totalContentItems: totalQuestions + totalAnswers + totalComments,
            contentEngagement: averageAnswersPerQuestion,
            userEngagement: userVerificationRate,
            moderationLoad: pendingReports,
            platformActivity: todayUsers + todayQuestions + todayAnswers,
            healthScore: Math.min(100, Math.round(
                (userVerificationRate * 0.3) +
                (answerAcceptanceRate * 0.3) +
                (Math.min(averageAnswersPerQuestion * 20, 40)) +
                (Math.max(0, 100 - pendingReports * 5))
            ))
        };

        res.status(200).json({
            success: true,
            message: 'Admin dashboard statistics retrieved successfully',
            data: {
                // === OVERVIEW TOTALS ===
                totals: {
                    users: totalUsers,
                    questions: totalQuestions,
                    answers: totalAnswers,
                    comments: totalComments,
                    reports: totalReports
                },

                // === USER STATISTICS ===
                userStats: {
                    total: totalUsers,
                    verified: verifiedUsers,
                    unverified: unverifiedUsers,
                    admins: adminUsers,
                    regular: regularUsers,
                    verificationRate: userVerificationRate
                },

                // === CONTENT STATISTICS ===
                contentStats: {
                    questions: {
                        total: totalQuestions,
                        answered: questionsWithAnswers,
                        unanswered: unansweredQuestions,
                        answerRate: totalQuestions > 0 ?
                            Math.round((questionsWithAnswers / totalQuestions) * 100) : 0
                    },
                    answers: {
                        total: totalAnswers,
                        accepted: acceptedAnswers,
                        unaccepted: unacceptedAnswers,
                        acceptanceRate: answerAcceptanceRate,
                        averagePerQuestion: averageAnswersPerQuestion
                    },
                    comments: totalComments
                },

                // === REPORTS & MODERATION ===
                reports: {
                    total: totalReports,
                    pending: pendingReports,
                    resolved: resolvedReports,
                    resolutionRate: totalReports > 0 ?
                        Math.round((resolvedReports / totalReports) * 100) : 0
                },

                // === ACTIVITY ANALYTICS ===
                activity: {
                    today: {
                        users: todayUsers,
                        questions: todayQuestions,
                        answers: todayAnswers,
                        comments: todayComments,
                        total: todayUsers + todayQuestions + todayAnswers + todayComments
                    },
                    yesterday: {
                        users: yesterdayUsers,
                        questions: yesterdayQuestions,
                        answers: yesterdayAnswers,
                        total: yesterdayUsers + yesterdayQuestions + yesterdayAnswers
                    },
                    thisWeek: {
                        users: weeklyUsers,
                        questions: weeklyQuestions,
                        answers: weeklyAnswers,
                        comments: weeklyComments,
                        total: weeklyUsers + weeklyQuestions + weeklyAnswers + weeklyComments
                    },
                    thisMonth: {
                        users: monthlyUsers,
                        questions: monthlyQuestions,
                        answers: monthlyAnswers,
                        total: monthlyUsers + monthlyQuestions + monthlyAnswers
                    }
                },

                // === GROWTH METRICS ===
                growth: {
                    users: {
                        today: todayUsers,
                        yesterday: yesterdayUsers,
                        growthRate: userGrowthRate,
                        trend: userGrowthRate > 0 ? 'up' : userGrowthRate < 0 ? 'down' : 'stable'
                    },
                    questions: {
                        today: todayQuestions,
                        yesterday: yesterdayQuestions,
                        growthRate: questionGrowthRate,
                        trend: questionGrowthRate > 0 ? 'up' : questionGrowthRate < 0 ? 'down' : 'stable'
                    },
                    answers: {
                        today: todayAnswers,
                        yesterday: yesterdayAnswers,
                        growthRate: answerGrowthRate,
                        trend: answerGrowthRate > 0 ? 'up' : answerGrowthRate < 0 ? 'down' : 'stable'
                    }
                },

                // === TOP PERFORMERS ===
                topPerformers: {
                    usersByReputation: topUsersByReputation,
                    questionsByVotes: topQuestionsByVotes,
                    answersByVotes: topAnswersByVotes,
                    mostActiveUsers: mostActiveUsers
                },

                // === CONTENT INSIGHTS ===
                insights: {
                    popularTags: popularTags,
                    engagementMetrics: {
                        averageAnswersPerQuestion: averageAnswersPerQuestion,
                        answerAcceptanceRate: answerAcceptanceRate,
                        userVerificationRate: userVerificationRate
                    }
                },

                // === RECENT ACTIVITY ===
                recentActivity: {
                    users: recentUsers,
                    questions: recentQuestions,
                    answers: recentAnswers
                },

                // === SYSTEM HEALTH ===
                systemHealth: systemHealth,

                // === METADATA ===
                metadata: {
                    generatedAt: new Date(),
                    dataRange: {
                        today: today,
                        weekAgo: weekAgo,
                        monthAgo: monthAgo
                    }
                }
            }
        });

    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching admin dashboard statistics'
        });
    }
};

// @desc    Manage user (ban/unban, promote/demote, verify/unverify, suspend/unsuspend)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
export const manageUser = async (req, res) => {
    try {
        const { action, data } = req.body; // action: 'ban', 'unban', 'promote', 'demote', 'verify', 'unverify', 'suspend', 'unsuspend'
        const userId = req.params.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent self-modification for critical actions
        if (userId === req.user.id && ['delete', 'ban', 'suspend'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot perform this action on your own account'
            });
        }

        let message = '';
        let updatedUser = null;

        switch (action) {
            case 'promote':
                user.isAdmin = true;
                message = 'User promoted to admin successfully';
                break;
            case 'demote':
                user.isAdmin = false;
                message = 'User demoted from admin successfully';
                break;
            case 'verify':
                user.isVerified = true;
                user.emailVerifiedAt = new Date();
                message = 'User verified successfully';
                break;
            case 'unverify':
                user.isVerified = false;
                user.emailVerifiedAt = null;
                message = 'User verification removed successfully';
                break;
            case 'ban':
                user.reputation = 0;
                user.isVerified = false;
                message = 'User banned successfully';
                break;
            case 'unban':
                user.reputation = 10;
                message = 'User unbanned successfully';
                break;
            case 'suspend':
                // Add a suspended field if it doesn't exist
                user.isSuspended = true;
                user.suspendedAt = new Date();
                message = 'User suspended successfully';
                break;
            case 'unsuspend':
                user.isSuspended = false;
                user.suspendedAt = null;
                message = 'User unsuspended successfully';
                break;
            case 'reset_password':
                // In a real app, you'd send a password reset email
                // For now, we'll just mark the user as needing password reset
                user.passwordResetToken = 'admin-reset-' + Date.now();
                user.passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
                message = 'Password reset initiated for user';
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid action'
                });
        }

        await user.save();
        updatedUser = await User.findById(userId).select('-password');

        res.status(200).json({
            success: true,
            message,
            data: { user: updatedUser }
        });

    } catch (error) {
        console.error('Manage user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error managing user'
        });
    }
};

// @desc    Delete user permanently
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent self-deletion
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        // Delete all related content
        await Question.deleteMany({ user: userId });
        await Answer.deleteMany({ user: userId });
        await Comment.deleteMany({ user: userId });

        // Remove from other users' following/followers lists
        await User.updateMany(
            { following: userId },
            { $pull: { following: userId } }
        );
        await User.updateMany(
            { followers: userId },
            { $pull: { followers: userId } }
        );

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: 'User and all associated content deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting user'
        });
    }
};

// @desc    Update user details
// @route   PUT /api/admin/users/:id/details
// @access  Private (Admin only)
export const updateUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const { username, email, fullName, bio, location, website, reputation, isVerified, isAdmin } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update allowed fields
        if (username) user.username = username;
        if (email) user.email = email;
        if (fullName !== undefined) user.profile.fullName = fullName;
        if (bio !== undefined) user.profile.bio = bio;
        if (location !== undefined) user.profile.location = location;
        if (website !== undefined) user.profile.website = website;
        if (reputation !== undefined) user.reputation = reputation;
        if (isVerified !== undefined) user.isVerified = isVerified;
        if (isAdmin !== undefined) user.isAdmin = isAdmin;

        await user.save();

        const updatedUser = await User.findById(userId).select('-password');

        res.status(200).json({
            success: true,
            message: 'User details updated successfully',
            data: { user: updatedUser }
        });

    } catch (error) {
        console.error('Update user details error:', error);

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error updating user details'
        });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const role = req.query.role || 'all';
        const status = req.query.status || 'all';
        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1;

        // Build search query
        let searchQuery = {};

        // Search by username, email, or name
        if (search) {
            searchQuery.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by role
        if (role !== 'all') {
            searchQuery.role = role;
        }

        // Filter by status (you might want to add an 'isActive' field to User model)
        if (status === 'active') {
            searchQuery.isActive = { $ne: false };
        } else if (status === 'inactive') {
            searchQuery.isActive = false;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const totalUsers = await User.countDocuments(searchQuery);

        // Get users with sorting and pagination
        const users = await User.find(searchQuery)
            .select('-password') // Exclude password field
            .sort({ [sortBy]: order })
            .skip(skip)
            .limit(limit)
            .populate('bookmarks', 'title createdAt');

        // Get user statistics for each user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const questionsCount = await Question.countDocuments({ user: user._id });
                const answersCount = await Answer.countDocuments({ user: user._id });
                const acceptedAnswersCount = await Answer.countDocuments({
                    user: user._id,
                    isAccepted: true
                });

                return {
                    ...user.toObject(),
                    stats: {
                        questionsAsked: questionsCount,
                        answersGiven: answersCount,
                        acceptedAnswers: acceptedAnswersCount,
                        reputation: user.reputation,
                        badges: user.badges || [],
                        joinedDate: user.createdAt
                    }
                };
            })
        );

        // Calculate pagination info
        const totalPages = Math.ceil(totalUsers / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).json({
            success: true,
            data: {
                users: usersWithStats,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalUsers,
                    hasNextPage,
                    hasPrevPage,
                    limit
                },
                filters: {
                    search,
                    role,
                    status,
                    sortBy,
                    order: order === 1 ? 'asc' : 'desc'
                }
            }
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving users'
        });
    }
};

// @desc    Edit question as admin
// @route   PUT /api/admin/questions/:id
// @access  Private (Admin only)
export const editQuestionAsAdmin = async (req, res) => {
    try {
        const { title, content, tags, status } = req.body;
        const questionId = req.params.id;

        const question = await Question.findById(questionId).populate('user', 'username email');

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Update question fields
        if (title !== undefined) question.title = title;
        if (content !== undefined) question.content = content;
        if (tags !== undefined) question.tags = tags;
        if (status !== undefined) question.status = status;

        question.updatedAt = new Date();

        await question.save();

        // Populate user data for response
        await question.populate('user', 'username email');

        res.status(200).json({
            success: true,
            message: 'Question updated successfully',
            data: question
        });

    } catch (error) {
        console.error('Edit question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating question'
        });
    }
};

// @desc    Edit answer as admin
// @route   PUT /api/admin/answers/:id
// @access  Private (Admin only)
export const editAnswerAsAdmin = async (req, res) => {
    try {
        const { content, isAccepted } = req.body;
        const answerId = req.params.id;

        const answer = await Answer.findById(answerId)
            .populate('user', 'username email')
            .populate('question', 'title');

        if (!answer) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        // Update answer fields
        if (content !== undefined) answer.content = content;
        if (isAccepted !== undefined) {
            answer.isAccepted = isAccepted;
            // If marking as accepted, unmark other answers for this question
            if (isAccepted) {
                await Answer.updateMany(
                    { question: answer.question, _id: { $ne: answerId } },
                    { isAccepted: false }
                );
            }
        }

        answer.updatedAt = new Date();

        await answer.save();

        // Populate data for response
        await answer.populate('user', 'username email');
        await answer.populate('question', 'title');

        res.status(200).json({
            success: true,
            message: 'Answer updated successfully',
            data: answer
        });

    } catch (error) {
        console.error('Edit answer error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating answer'
        });
    }
};

// @desc    Add comment as admin
// @route   POST /api/admin/comments
// @access  Private (Admin only)
export const addCommentAsAdmin = async (req, res) => {
    try {
        const { content, contentType, contentId } = req.body;

        if (!content || !contentType || !contentId) {
            return res.status(400).json({
                success: false,
                message: 'Content, contentType, and contentId are required'
            });
        }

        // Verify the content exists
        let contentExists = false;
        if (contentType === 'question') {
            contentExists = await Question.findById(contentId);
        } else if (contentType === 'answer') {
            contentExists = await Answer.findById(contentId);
        }

        if (!contentExists) {
            return res.status(404).json({
                success: false,
                message: `${contentType} not found`
            });
        }

        const comment = new Comment({
            content,
            user: req.user.id,
            contentType,
            contentId,
            isAdminComment: true
        });

        await comment.save();

        // Populate user data
        await comment.populate('user', 'username email isAdmin');

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: comment
        });

    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error adding comment'
        });
    }
};

// @desc    Edit comment as admin
// @route   PUT /api/admin/comments/:id
// @access  Private (Admin only)
export const editCommentAsAdmin = async (req, res) => {
    try {
        const { content } = req.body;
        const commentId = req.params.id;

        const comment = await Comment.findById(commentId).populate('user', 'username email');

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Update comment content
        if (content !== undefined) comment.content = content;
        comment.updatedAt = new Date();

        await comment.save();

        // Populate user data for response
        await comment.populate('user', 'username email');

        res.status(200).json({
            success: true,
            message: 'Comment updated successfully',
            data: comment
        });

    } catch (error) {
        console.error('Edit comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating comment'
        });
    }
};

// @desc    Delete comment as admin
// @route   DELETE /api/admin/comments/:id
// @access  Private (Admin only)
export const deleteCommentAsAdmin = async (req, res) => {
    try {
        const commentId = req.params.id;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        await Comment.findByIdAndDelete(commentId);

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

// @desc    Get all questions for admin management
// @route   GET /api/admin/questions
// @access  Private (Admin only)
export const getAllQuestionsAsAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const status = req.query.status;
        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1;
        const skip = (page - 1) * limit;

        // Build filter
        let filter = {};
        if (status && status !== 'all') filter.status = status;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const questions = await Question.find(filter)
            .populate('user', 'username email isAdmin')
            .sort({ [sortBy]: order })
            .skip(skip)
            .limit(limit);

        const totalQuestions = await Question.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                questions,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalQuestions / limit),
                    totalQuestions,
                    hasNextPage: page < Math.ceil(totalQuestions / limit),
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get all questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving questions'
        });
    }
};

// @desc    Get all answers for admin management
// @route   GET /api/admin/answers
// @access  Private (Admin only)
export const getAllAnswersAsAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1;
        const skip = (page - 1) * limit;

        // Build filter
        let filter = {};
        if (search) {
            filter.$or = [
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const answers = await Answer.find(filter)
            .populate('user', 'username email isAdmin')
            .populate('question', 'title')
            .sort({ [sortBy]: order })
            .skip(skip)
            .limit(limit);

        const totalAnswers = await Answer.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                answers,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalAnswers / limit),
                    totalAnswers,
                    hasNextPage: page < Math.ceil(totalAnswers / limit),
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get all answers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving answers'
        });
    }
};

// @desc    Get all comments for admin management
// @route   GET /api/admin/comments
// @access  Private (Admin only)
export const getAllCommentsAsAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1;
        const skip = (page - 1) * limit;

        // Build filter
        let filter = {};
        if (search) {
            filter.content = { $regex: search, $options: 'i' };
        }

        const comments = await Comment.find(filter)
            .populate('user', 'username email isAdmin')
            .sort({ [sortBy]: order })
            .skip(skip)
            .limit(limit);

        const totalComments = await Comment.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                comments,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalComments / limit),
                    totalComments,
                    hasNextPage: page < Math.ceil(totalComments / limit),
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get all comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving comments'
        });
    }
};
