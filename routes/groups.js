import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import {
    getGroups,
    createGroup,
    getGroupDetails,
    joinGroup,
    leaveGroup,
    postGroupQuestion,
    getGroupQuestions
} from '../controllers/groupController.js';

// All group routes require authentication
router.get('/', protect, getGroups);
router.post('/', protect, createGroup);
router.get('/:groupId', protect, getGroupDetails);
router.post('/:groupId/join', protect, joinGroup);
router.post('/:groupId/leave', protect, leaveGroup);
router.post('/:groupId/questions', protect, postGroupQuestion);
router.get('/:groupId/questions', protect, getGroupQuestions);

export default router;