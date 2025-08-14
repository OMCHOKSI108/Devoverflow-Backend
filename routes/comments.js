import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import {
    addCommentToQuestion,
    addCommentToAnswer,
    getQuestionComments,
    getAnswerComments,
    updateComment,
    deleteComment
} from '../controllers/commentController.js';

// Public routes
router.get('/question/:questionId', getQuestionComments);
router.get('/answer/:answerId', getAnswerComments);

// Protected routes
router.post('/question/:questionId', protect, addCommentToQuestion);
router.post('/answer/:answerId', protect, addCommentToAnswer);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

export default router;
