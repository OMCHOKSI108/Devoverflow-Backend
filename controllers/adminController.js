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

// @desc    Manage user (ban/unban, promote/demote)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
export const manageUser = async (req, res) => {
    try {
        const { action } = req.body; // 'ban', 'unban', 'promote', 'demote'
        const userId = req.params.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent self-modification
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot modify your own account'
            });
        }

        switch (action) {
            case 'promote':
                user.isAdmin = true;
                break;
            case 'demote':
                user.isAdmin = false;
                break;
            case 'ban':
                // In a real app, you might add an 'isBanned' field
                // For now, we'll just set reputation to 0
                user.reputation = 0;
                break;
            case 'unban':
                // Restore some reputation
                user.reputation = 10;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid action'
                });
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${action}ed successfully`,
            data: { user: user.select('-password') }
        });

    } catch (error) {
        console.error('Manage user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error managing user'
        });
    }
};
