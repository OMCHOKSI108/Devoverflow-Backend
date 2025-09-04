import express from 'express';
const router = express.Router();
import { addFriend, removeFriend, getProfile, getAllFriendships, getFriendshipStats, adminRemoveFriendship } from '../controllers/friendController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

// User routes
router.post('/add', protect, addFriend);
router.post('/remove', protect, removeFriend);
router.get('/profile/:id?', protect, getProfile);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllFriendships);
router.get('/admin/stats', protect, adminOnly, getFriendshipStats);
router.delete('/admin/remove', protect, adminOnly, adminRemoveFriendship);

export default router;
