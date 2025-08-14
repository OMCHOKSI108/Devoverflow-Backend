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
