import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getReports,
    createReport,
    resolveReport,
    deleteContentAsAdmin,
    getAdminStats,
    manageUser
} from '../controllers/adminController.js';

// Public route for creating reports
router.post('/reports', protect, createReport);

// Admin-only routes
router.use(protect, admin); // Secure all routes below this line

router.get('/reports', getReports);
router.put('/reports/:id/resolve', resolveReport);
router.get('/stats', getAdminStats);
router.delete('/content/:type/:id', deleteContentAsAdmin);
router.put('/users/:id', manageUser);

export default router;
