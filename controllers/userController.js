import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Notification from '../models/Notification.js';

// @desc    Get current user's profile
// @route   GET /api/users/me
// @access  Private
export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('bookmarks', 'title votes createdAt');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user statistics
        const questionsCount = await Question.countDocuments({ user: user._id });
        const answersCount = await Answer.countDocuments({ user: user._id });
        const acceptedAnswersCount = await Answer.countDocuments({
            user: user._id,
            isAccepted: true
        });

        const userStats = {
            questionsAsked: questionsCount,
            answersGiven: answersCount,
            acceptedAnswers: acceptedAnswersCount,
            reputation: user.reputation,
            badges: user.badges,
            joinedDate: user.createdAt
        };

        res.status(200).json({
            success: true,
            data: {
                user,
                stats: userStats
            }
        });

    } catch (error) {
        console.error('Get my profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching profile'
        });
    }
};

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -email');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user statistics
        const questionsCount = await Question.countDocuments({ user: user._id });
        const answersCount = await Answer.countDocuments({ user: user._id });
        const acceptedAnswersCount = await Answer.countDocuments({
            user: user._id,
            isAccepted: true
        });

        // Get recent questions and answers
        const recentQuestions = await Question.find({ user: user._id })
            .select('title votes createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentAnswers = await Answer.find({ user: user._id })
            .select('body votes isAccepted createdAt')
            .populate('question', 'title')
            .sort({ createdAt: -1 })
            .limit(5);

        const userStats = {
            questionsAsked: questionsCount,
            answersGiven: answersCount,
            acceptedAnswers: acceptedAnswersCount,
            reputation: user.reputation,
            badges: user.badges,
            joinedDate: user.createdAt
        };

        res.status(200).json({
            success: true,
            data: {
                user,
                stats: userStats,
                recentActivity: {
                    questions: recentQuestions,
                    answers: recentAnswers
                }
            }
        });

    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user profile'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const { fullName, bio, location, website, avatar, tags } = req.body;

        // Validate website URL if provided
        if (website && !isValidUrl(website)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid website URL'
            });
        }

        // Validate tags array
        if (tags && (!Array.isArray(tags) || tags.length > 10)) {
            return res.status(400).json({
                success: false,
                message: 'Tags must be an array with maximum 10 items'
            });
        }

        const updateData = {};
        if (fullName !== undefined) updateData['profile.fullName'] = fullName;
        if (bio !== undefined) updateData['profile.bio'] = bio;
        if (location !== undefined) updateData['profile.location'] = location;
        if (website !== undefined) updateData['profile.website'] = website;
        if (avatar !== undefined) updateData['profile.avatar'] = avatar;
        if (tags !== undefined) updateData['profile.tags'] = tags;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password -verificationToken');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating profile'
        });
    }
};

// Helper function to validate URLs
const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
};

// @desc    Get top users by reputation
// @route   GET /api/users/leaderboard
// @access  Public
export const getLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const timeframe = req.query.timeframe || 'all'; // all, month, week

        let dateFilter = {};
        if (timeframe === 'month') {
            dateFilter = {
                createdAt: {
                    $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            };
        } else if (timeframe === 'week') {
            dateFilter = {
                createdAt: {
                    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            };
        }

        const topUsers = await User.find(dateFilter)
            .select('username reputation badges createdAt')
            .sort({ reputation: -1 })
            .limit(limit);

        res.status(200).json({
            success: true,
            data: {
                leaderboard: topUsers,
                timeframe,
                count: topUsers.length
            }
        });

    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching leaderboard'
        });
    }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
export const searchUsers = async (req, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Please provide search query'
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.find({
            username: { $regex: q, $options: 'i' }
        })
            .select('username reputation badges profile.bio createdAt')
            .sort({ reputation: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalUsers = await User.countDocuments({
            username: { $regex: q, $options: 'i' }
        });

        res.status(200).json({
            success: true,
            data: {
                users,
                totalUsers,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalUsers / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error searching users'
        });
    }
};

// @desc    Get user activity feed
// @route   GET /api/users/:id/activity
// @access  Public
export const getUserActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Get user's questions and answers with timestamps
        const questions = await Question.find({ user: id })
            .select('title votes createdAt')
            .sort({ createdAt: -1 })
            .limit(limit);

        const answers = await Answer.find({ user: id })
            .select('body votes isAccepted createdAt')
            .populate('question', 'title')
            .sort({ createdAt: -1 })
            .limit(limit);

        // Combine and sort activities by date
        const activities = [
            ...questions.map(q => ({
                type: 'question',
                data: q,
                timestamp: q.createdAt
            })),
            ...answers.map(a => ({
                type: 'answer',
                data: a,
                timestamp: a.createdAt
            }))
        ]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(skip, skip + limit);

        res.status(200).json({
            success: true,
            data: {
                activities,
                currentPage: page,
                hasMore: activities.length === limit
            }
        });

    } catch (error) {
        console.error('Get user activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user activity'
        });
    }
};

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
export const followUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;

        if (id === currentUserId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot follow yourself'
            });
        }

        const userToFollow = await User.findById(id);
        if (!userToFollow) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const currentUser = await User.findById(currentUserId);

        // Check if already following
        if (currentUser.following.includes(id)) {
            return res.status(400).json({
                success: false,
                message: 'Already following this user'
            });
        }

        // Add to following list
        currentUser.following.push(id);
        userToFollow.followers.push(currentUserId);

        await Promise.all([
            currentUser.save(),
            userToFollow.save()
        ]);

        // Create notification for the followed user
        await createNotification(
            id,
            currentUserId,
            'follow',
            'New Follower',
            `${currentUser.username} started following you`,
            { url: `/users/${currentUserId}` }
        );

        res.status(200).json({
            success: true,
            message: 'User followed successfully'
        });

    } catch (error) {
        console.error('Follow user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error following user'
        });
    }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/follow
// @access  Private
export const unfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;

        const userToUnfollow = await User.findById(id);
        if (!userToUnfollow) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const currentUser = await User.findById(currentUserId);

        // Check if following
        if (!currentUser.following.includes(id)) {
            return res.status(400).json({
                success: false,
                message: 'Not following this user'
            });
        }

        // Remove from following list
        currentUser.following = currentUser.following.filter(
            followingId => followingId.toString() !== id
        );
        userToUnfollow.followers = userToUnfollow.followers.filter(
            followerId => followerId.toString() !== currentUserId
        );

        await Promise.all([
            currentUser.save(),
            userToUnfollow.save()
        ]);

        res.status(200).json({
            success: true,
            message: 'User unfollowed successfully'
        });

    } catch (error) {
        console.error('Unfollow user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error unfollowing user'
        });
    }
};

// @desc    Get user's following list
// @route   GET /api/users/:id/following
// @access  Public
export const getUserFollowing = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = id === 'me' ? req.user?.id : id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const user = await User.findById(userId)
            .populate('following', 'name username reputation profilePicture createdAt')
            .select('following');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user.following
        });

    } catch (error) {
        console.error('Get following error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching following list'
        });
    }
};

// @desc    Get user's followers list
// @route   GET /api/users/:id/followers
// @access  Public
export const getUserFollowers = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = id === 'me' ? req.user?.id : id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const user = await User.findById(userId)
            .populate('followers', 'name username reputation profilePicture createdAt')
            .select('followers');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user.followers
        });

    } catch (error) {
        console.error('Get followers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching followers list'
        });
    }
};

// @desc    Get user connection suggestions
// @route   GET /api/users/suggestions
// @access  Private
export const getUserSuggestions = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const currentUser = await User.findById(currentUserId).select('following');

        // Get users not already followed, excluding self
        const suggestions = await User.find({
            _id: {
                $nin: [...currentUser.following, currentUserId]
            },
            isVerified: true
        })
            .select('name username reputation profilePicture createdAt')
            .sort({ reputation: -1, createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: suggestions
        });

    } catch (error) {
        console.error('Get suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user suggestions'
        });
    }
};

// @desc    Get connection status with a user
// @route   GET /api/users/:id/connection-status
// @access  Private
export const getConnectionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;

        if (id === currentUserId) {
            return res.status(200).json({
                success: true,
                data: { isFollowing: false, isSelf: true }
            });
        }

        const currentUser = await User.findById(currentUserId).select('following');
        const isFollowing = currentUser.following.includes(id);

        res.status(200).json({
            success: true,
            data: { isFollowing, isSelf: false }
        });

    } catch (error) {
        console.error('Get connection status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error checking connection status'
        });
    }
};

// @desc    Get user reputation breakdown
// @route   GET /api/users/:id/reputation
// @access  Public
export const getUserReputation = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('reputation badges username');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Calculate reputation breakdown
        const questionsVotes = await Question.aggregate([
            { $match: { user: user._id } },
            { $group: { _id: null, totalVotes: { $sum: '$votes' } } }
        ]);

        const answersVotes = await Answer.aggregate([
            { $match: { user: user._id } },
            { $group: { _id: null, totalVotes: { $sum: '$votes' }, acceptedCount: { $sum: { $cond: ['$isAccepted', 1, 0] } } } }
        ]);

        const reputationBreakdown = {
            totalReputation: user.reputation,
            fromQuestions: (questionsVotes[0]?.totalVotes || 0) * 5, // 5 points per upvote
            fromAnswers: (answersVotes[0]?.totalVotes || 0) * 10, // 10 points per upvote
            fromAcceptedAnswers: (answersVotes[0]?.acceptedCount || 0) * 15, // 15 points per accepted answer
            badges: user.badges
        };

        res.status(200).json({
            success: true,
            data: {
                username: user.username,
                reputationBreakdown
            }
        });

    } catch (error) {
        console.error('Get user reputation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching reputation breakdown'
        });
    }
};

// @desc    Get user summary statistics
// @route   GET /api/users/:id/summary
// @access  Public
export const getUserSummary = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('username reputation badges createdAt');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get comprehensive statistics
        const [
            questionsStats,
            answersStats,
            recentQuestions,
            recentAnswers,
            topQuestions,
            topAnswers
        ] = await Promise.all([
            Question.aggregate([
                { $match: { user: user._id } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        totalVotes: { $sum: '$votes' },
                        totalViews: { $sum: '$views' },
                        avgVotes: { $avg: '$votes' }
                    }
                }
            ]),
            Answer.aggregate([
                { $match: { user: user._id } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        totalVotes: { $sum: '$votes' },
                        acceptedCount: { $sum: { $cond: ['$isAccepted', 1, 0] } },
                        avgVotes: { $avg: '$votes' }
                    }
                }
            ]),
            Question.countDocuments({
                user: user._id,
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }),
            Answer.countDocuments({
                user: user._id,
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }),
            Question.find({ user: user._id })
                .select('title votes views createdAt')
                .sort({ votes: -1 })
                .limit(3),
            Answer.find({ user: user._id })
                .select('body votes isAccepted createdAt')
                .populate('question', 'title')
                .sort({ votes: -1 })
                .limit(3)
        ]);

        const summary = {
            user: {
                username: user.username,
                reputation: user.reputation,
                badges: user.badges,
                joinedDate: user.createdAt
            },
            statistics: {
                questions: {
                    total: questionsStats[0]?.total || 0,
                    totalVotes: questionsStats[0]?.totalVotes || 0,
                    totalViews: questionsStats[0]?.totalViews || 0,
                    averageVotes: Math.round((questionsStats[0]?.avgVotes || 0) * 100) / 100,
                    recentCount: recentQuestions
                },
                answers: {
                    total: answersStats[0]?.total || 0,
                    totalVotes: answersStats[0]?.totalVotes || 0,
                    acceptedCount: answersStats[0]?.acceptedCount || 0,
                    acceptanceRate: answersStats[0]?.total > 0
                        ? Math.round((answersStats[0]?.acceptedCount / answersStats[0]?.total) * 100)
                        : 0,
                    averageVotes: Math.round((answersStats[0]?.avgVotes || 0) * 100) / 100,
                    recentCount: recentAnswers
                }
            },
            topContributions: {
                questions: topQuestions,
                answers: topAnswers
            }
        };

        res.status(200).json({
            success: true,
            data: summary
        });

    } catch (error) {
        console.error('Get user summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user summary'
        });
    }
};

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
export const getUserNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, unread = false } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = { recipient: req.user.id };
        if (unread === 'true') {
            filter.isRead = false;
        }

        const [notifications, totalCount, unreadCount] = await Promise.all([
            Notification.find(filter)
                .populate('sender', 'username profile.avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Notification.countDocuments(filter),
            Notification.countDocuments({ recipient: req.user.id, isRead: false })
        ]);

        res.status(200).json({
            success: true,
            data: {
                notifications,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalCount,
                    unreadCount,
                    hasNextPage: skip + notifications.length < totalCount,
                    hasPrevPage: parseInt(page) > 1
                }
            }
        });

    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching notifications'
        });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: req.user.id },
            {
                isRead: true,
                readAt: new Date()
            },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: { notification }
        });

    } catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error marking notification as read'
        });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/users/notifications/read-all
// @access  Private
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            {
                isRead: true,
                readAt: new Date()
            }
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} notifications marked as read`,
            data: {
                markedCount: result.modifiedCount
            }
        });

    } catch (error) {
        console.error('Mark all notifications as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error marking all notifications as read'
        });
    }
};

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
export const getUserSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('settings username email profile.fullName');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                settings: user.settings,
                profile: {
                    username: user.username,
                    email: user.email,
                    fullName: user.profile.fullName
                }
            }
        });

    } catch (error) {
        console.error('Get user settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user settings'
        });
    }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
export const updateUserSettings = async (req, res) => {
    try {
        const { theme, language, emailNotifications, pushNotifications } = req.body;

        // Validate theme
        if (theme && !['light', 'dark', 'auto'].includes(theme)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid theme value. Must be light, dark, or auto'
            });
        }

        const updateData = {};
        if (theme !== undefined) updateData['settings.theme'] = theme;
        if (language !== undefined) updateData['settings.language'] = language;
        if (emailNotifications !== undefined) updateData['settings.emailNotifications'] = emailNotifications;
        if (pushNotifications !== undefined) updateData['settings.pushNotifications'] = pushNotifications;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        ).select('settings username');

        res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            data: {
                settings: user.settings,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating settings'
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

// Utility function to create notifications
export const createNotification = async (recipientId, senderId, type, title, message, data = {}) => {
    try {
        const notification = new Notification({
            recipient: recipientId,
            sender: senderId,
            type,
            title,
            message,
            data
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        return null;
    }
};
