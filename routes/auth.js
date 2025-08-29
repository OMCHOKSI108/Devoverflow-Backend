import express from 'express';
const router = express.Router();
import {
    register,
    registerAdmin,
    login,
    verifyEmail,
    getMe,
    updateProfile,
    setupAdmin,
    resendVerification
} from '../controllers/authController.js';
import {
    forgotPassword,
    resetPassword,
    passwordResetLimiter
} from '../controllers/passwordResetController.js';
import { protect } from '../middleware/authMiddleware.js';

// Public routes
router.post('/register', register);
router.post('/register-admin', registerAdmin); // Admin registration endpoint
router.post('/login', login);
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/setup-admin', setupAdmin); // TEMPORARY - remove in production

// Password Reset routes
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
