import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import {
    getUserReputation,
    getReputationHistory,
    getUserBadges,
    getUserPrivileges,
    getLeaderboard
} from '../controllers/gamificationController.js';

// All gamification routes require authentication
router.get('/reputation', protect, getUserReputation);
router.get('/reputation/history', protect, getReputationHistory);
router.get('/badges', protect, getUserBadges);
router.get('/privileges', protect, getUserPrivileges);
router.get('/leaderboard', protect, getLeaderboard);

export default router;