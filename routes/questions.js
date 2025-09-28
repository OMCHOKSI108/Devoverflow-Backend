import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import {
    getAllQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    searchQuestions,
    voteOnQuestion,
    getQuestionsByUser
} from '../controllers/questionController.js';
import { createAnswer } from '../controllers/answerController.js';

// Public routes
router.get('/', getAllQuestions);
router.get('/search', searchQuestions);
router.get('/user/:userId', getQuestionsByUser);
router.get('/:id', getQuestionById);

// Protected routes
router.post('/', protect, createQuestion);
router.put('/:id', protect, updateQuestion);
router.delete('/:id', protect, deleteQuestion);
router.post('/:id/vote', protect, voteOnQuestion);

// Answers for questions
router.post('/:questionId/answers', protect, createAnswer);

export default router;
