import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getReports,
    createReport,
    resolveReport,
    deleteContentAsAdmin,
    getAdminStats,
    manageUser,
    getAllUsers,
    deleteUser,
    updateUserDetails,
    editQuestionAsAdmin,
    editAnswerAsAdmin,
    addCommentAsAdmin,
    editCommentAsAdmin,
    deleteCommentAsAdmin,
    getAllQuestionsAsAdmin,
    getAllAnswersAsAdmin,
    getAllCommentsAsAdmin
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
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/details', updateUserDetails);

// Content Management Routes
router.get('/questions', getAllQuestionsAsAdmin);
router.put('/questions/:id', editQuestionAsAdmin);

router.get('/answers', getAllAnswersAsAdmin);
router.put('/answers/:id', editAnswerAsAdmin);

router.get('/comments', getAllCommentsAsAdmin);
router.post('/comments', addCommentAsAdmin);
router.put('/comments/:id', editCommentAsAdmin);
router.delete('/comments/:id', deleteCommentAsAdmin);

export default router;
