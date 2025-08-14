import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import {
    createAnswer,
    getAnswersByQuestion,
    updateAnswer,
    deleteAnswer,
    voteOnAnswer,
    acceptAnswer,
    getAnswersByUser
} from '../controllers/answerController.js';

// Public routes
router.get('/question/:questionId', getAnswersByQuestion);
router.get('/user/:userId', getAnswersByUser);

// Protected routes
router.post('/:questionId', protect, createAnswer);
router.put('/:id', protect, updateAnswer);
router.delete('/:id', protect, deleteAnswer);
router.post('/:id/vote', protect, voteOnAnswer);
router.post('/:id/accept', protect, acceptAnswer);

export default router;
