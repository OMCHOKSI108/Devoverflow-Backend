import express from 'express';
const router = express.Router();
import {
    register,
    registerAdmin,
    login,
    verifyEmail,
    getMe,
    updateProfile,
    setupAdmin
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

// Public routes
router.post('/register', register);
router.post('/register-admin', registerAdmin); // Admin registration endpoint
router.post('/login', login);
router.get('/verify/:token', verifyEmail);
router.post('/setup-admin', setupAdmin); // TEMPORARY - remove in production

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
