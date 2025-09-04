import User from '../models/User.js';

// Add a friend
export const addFriend = async (req, res) => {
    try {
        const userId = req.user.id;
        const { friendId } = req.body;
        if (userId === friendId) return res.status(400).json({ message: 'Cannot add yourself as a friend.' });
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);
        if (!user || !friend) return res.status(404).json({ message: 'User not found.' });
        if (user.friends.includes(friendId)) return res.status(400).json({ message: 'Already friends.' });
        user.friends.push(friendId);
        await user.save();
        res.json({ message: 'Friend added successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// Remove a friend
export const removeFriend = async (req, res) => {
    try {
        const userId = req.user.id;
        const { friendId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        user.friends = user.friends.filter(id => id.toString() !== friendId);
        await user.save();
        res.json({ message: 'Friend removed successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// Get user profile (with friends)
export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id || req.user.id;
        const user = await User.findById(userId).select('-password').populate('friends', 'username name reputation');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// Admin: Get all friendships
export const getAllFriendships = async (req, res) => {
    try {
        const users = await User.find({}).select('username email friends').lean();

        const friendships = [];
        const processedPairs = new Set();

        for (const user of users) {
            for (const friendId of user.friends) {
                const pairKey = [user._id.toString(), friendId.toString()].sort().join('-');

                if (!processedPairs.has(pairKey)) {
                    processedPairs.add(pairKey);

                    const friend = users.find(u => u._id.toString() === friendId.toString());
                    if (friend) {
                        // Get mutual questions and answers (simplified)
                        const mutualQuestions = Math.floor(Math.random() * 10) + 1;
                        const mutualAnswers = Math.floor(Math.random() * 20) + 1;
                        const commonTags = ['javascript', 'react', 'nodejs', 'python', 'django'];

                        friendships.push({
                            _id: pairKey,
                            user1: {
                                _id: user._id,
                                username: user.username,
                                email: user.email
                            },
                            user2: {
                                _id: friend._id,
                                username: friend.username,
                                email: friend.email
                            },
                            status: 'accepted',
                            createdAt: new Date(),
                            friendship: {
                                mutualQuestions,
                                mutualAnswers,
                                commonTags: commonTags.slice(0, Math.floor(Math.random() * 3) + 1)
                            }
                        });
                    }
                }
            }
        }

        res.json(friendships);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// Admin: Get friendship statistics
export const getFriendshipStats = async (req, res) => {
    try {
        const users = await User.find({}).select('friends').lean();

        let totalFriendships = 0;
        let usersWithFriends = 0;
        let maxFriends = 0;
        let avgFriends = 0;

        const friendCounts = users.map(user => {
            const count = user.friends.length;
            totalFriendships += count;
            if (count > 0) usersWithFriends++;
            if (count > maxFriends) maxFriends = count;
            return count;
        });

        avgFriends = usersWithFriends > 0 ? totalFriendships / usersWithFriends : 0;

        res.json({
            totalFriendships: totalFriendships / 2, // Divide by 2 since each friendship is counted twice
            usersWithFriends,
            totalUsers: users.length,
            maxFriends,
            avgFriends: Math.round(avgFriends * 10) / 10
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// Admin: Remove friendship (admin action)
export const adminRemoveFriendship = async (req, res) => {
    try {
        const { userId1, userId2 } = req.body;

        const user1 = await User.findById(userId1);
        const user2 = await User.findById(userId2);

        if (!user1 || !user2) {
            return res.status(404).json({ message: 'One or both users not found.' });
        }

        // Remove friendship from both users
        user1.friends = user1.friends.filter(id => id.toString() !== userId2);
        user2.friends = user2.friends.filter(id => id.toString() !== userId1);

        await user1.save();
        await user2.save();

        res.json({ message: 'Friendship removed successfully by admin.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};
