import User from '../models/User.js';
import ReputationHistory from '../models/ReputationHistory.js';

// @desc    Get user reputation and level info
// @route   GET /api/gamification/reputation
// @access  Private
export const getUserReputation = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('reputation badges');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Calculate level based on reputation
        const level = calculateLevel(user.reputation);
        const nextLevelPoints = calculateNextLevelPoints(level);

        res.status(200).json({
            success: true,
            data: {
                reputation: user.reputation,
                level: level,
                nextLevelPoints: nextLevelPoints,
                progressToNextLevel: user.reputation - calculateLevelPoints(level)
            }
        });

    } catch (error) {
        console.error('Get user reputation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get user reputation history
// @route   GET /api/gamification/reputation/history
// @access  Private
export const getReputationHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const history = await ReputationHistory.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('relatedEntity', 'title body');

        const totalHistory = await ReputationHistory.countDocuments({ user: req.user.id });
        const totalPages = Math.ceil(totalHistory / limit);

        res.status(200).json({
            success: true,
            data: {
                history: history.map(item => ({
                    points: item.points,
                    reason: item.reason,
                    timestamp: item.createdAt,
                    total: item.totalReputation,
                    relatedEntity: item.relatedEntity
                })),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalHistory,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get reputation history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get user badges
// @route   GET /api/gamification/badges
// @access  Private
export const getUserBadges = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('badges reputation');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get all available badges with their requirements
        const availableBadges = getAvailableBadges();
        const userBadges = availableBadges.filter(badge => user.badges.includes(badge.id));

        res.status(200).json({
            success: true,
            data: {
                badges: userBadges.map(badge => ({
                    ...badge,
                    unlockedAt: user.reputation >= badge.requirement ? new Date() : null
                }))
            }
        });

    } catch (error) {
        console.error('Get user badges error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get user privileges
// @route   GET /api/gamification/privileges
// @access  Private
export const getUserPrivileges = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('privileges reputation');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get all available privileges
        const availablePrivileges = getAvailablePrivileges();
        const userPrivileges = availablePrivileges.filter(privilege =>
            user.privileges.includes(privilege.id) || user.reputation >= privilege.requirement
        );

        res.status(200).json({
            success: true,
            data: {
                privileges: userPrivileges
            }
        });

    } catch (error) {
        console.error('Get user privileges error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get leaderboard
// @route   GET /api/gamification/leaderboard
// @access  Private
export const getLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const period = req.query.period || 'all_time';

        let dateFilter = {};
        if (period === 'monthly') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            dateFilter = { createdAt: { $gte: oneMonthAgo } };
        } else if (period === 'weekly') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            dateFilter = { createdAt: { $gte: oneWeekAgo } };
        }

        // For now, we'll use total reputation. In a more complex system,
        // we might calculate period-specific reputation
        const users = await User.find(dateFilter)
            .select('username reputation badges profile.fullName profile.avatar')
            .sort({ reputation: -1 })
            .limit(limit);

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            user: {
                id: user._id,
                name: user.profile.fullName || user.username,
                reputation: user.reputation,
                badges: user.badges,
                avatar: user.profile.avatar
            }
        }));

        res.status(200).json({
            success: true,
            data: {
                leaderboard,
                period
            }
        });

    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Helper functions
function calculateLevel(reputation) {
    // Simple level calculation: every 100 points = 1 level
    return Math.floor(reputation / 100) + 1;
}

function calculateLevelPoints(level) {
    return (level - 1) * 100;
}

function calculateNextLevelPoints(level) {
    return level * 100;
}

function getAvailableBadges() {
    return [
        {
            id: 'first_question',
            name: 'Curious Mind',
            description: 'Asked your first question',
            icon: '❓',
            color: '#3498db',
            requirement: 1
        },
        {
            id: 'first_answer',
            name: 'Helper',
            description: 'Provided your first answer',
            icon: '💡',
            color: '#2ecc71',
            requirement: 5
        },
        {
            id: 'accepted_answer',
            name: 'Accepted',
            description: 'Had an answer accepted',
            icon: '✅',
            color: '#27ae60',
            requirement: 10
        },
        {
            id: 'reputation_100',
            name: 'Rising Star',
            description: 'Reached 100 reputation',
            icon: '⭐',
            color: '#f39c12',
            requirement: 100
        },
        {
            id: 'reputation_500',
            name: 'Expert',
            description: 'Reached 500 reputation',
            icon: '🏆',
            color: '#e74c3c',
            requirement: 500
        }
    ];
}

function getAvailablePrivileges() {
    return [
        {
            id: 'vote_up',
            name: 'Vote Up',
            description: 'Can upvote questions and answers',
            icon: '👍',
            requirement: 1
        },
        {
            id: 'comment',
            name: 'Comment',
            description: 'Can comment on questions and answers',
            icon: '💬',
            requirement: 10
        },
        {
            id: 'edit',
            name: 'Edit',
            description: 'Can edit own questions and answers',
            icon: '✏️',
            requirement: 50
        },
        {
            id: 'moderate',
            name: 'Moderate',
            description: 'Can flag inappropriate content',
            icon: '🚩',
            requirement: 100
        }
    ];
}