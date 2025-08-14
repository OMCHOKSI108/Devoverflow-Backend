import express from 'express';
const router = express.Router();
import { addFriend, removeFriend, getProfile } from '../controllers/friendController.js';
import { protect } from '../middleware/authMiddleware.js';

// Add friend
router.post('/add', protect, addFriend);
// Remove friend
router.post('/remove', protect, removeFriend);
// Get user profile (with friends)
router.get('/profile/:id?', protect, getProfile);

export default router;
