import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import {
    getMyProfile,
    getUserProfile,
    updateUserProfile,
    getLeaderboard,
    searchUsers,
    getUserActivity,
    followUser,
    unfollowUser,
    getUserFollowing,
    getUserFollowers,
    getUserSuggestions,
    getConnectionStatus,
    getUserReputation,
    getUserSummary,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUserSettings,
    updateUserSettings
} from '../controllers/userController.js';

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================
router.get('/leaderboard', getLeaderboard);
router.get('/search', searchUsers);

// ============================================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================================

// Current user routes (must be protected and come first)
router.get('/me', protect, getMyProfile);
router.put('/profile', protect, updateUserProfile);

// User settings
router.get('/settings', protect, getUserSettings);
router.put('/settings', protect, updateUserSettings);

// User discovery
router.get('/suggestions', protect, getUserSuggestions);

// Notifications
router.get('/notifications', protect, getUserNotifications);
router.put('/notifications/read-all', protect, markAllNotificationsAsRead);
router.put('/notifications/:id/read', protect, markNotificationAsRead);

// ============================================================================
// USER-SPECIFIC ROUTES (Mixed public/protected)
// ============================================================================

// Public user information
router.get('/:id/reputation', getUserReputation);
router.get('/:id/summary', getUserSummary);
router.get('/:id/activity', getUserActivity);
router.get('/:id/following', getUserFollowing);
router.get('/:id/followers', getUserFollowers);

// Protected user interactions
router.get('/:id/connection-status', protect, getConnectionStatus);
router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);

// Public user profile (must come last to avoid conflicts)
router.get('/:id', getUserProfile);

export default router;
