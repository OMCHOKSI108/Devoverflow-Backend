import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import {
    getChatSessions,
    getChatMessages,
    createChatSession,
    sendChatMessage,
    deleteChatSession
} from '../controllers/chatController.js';

// All chat routes require authentication
router.get('/sessions', protect, getChatSessions);
router.post('/sessions', protect, createChatSession);
router.get('/sessions/:sessionId/messages', protect, getChatMessages);
router.post('/sessions/:sessionId/messages', protect, sendChatMessage);
router.delete('/sessions/:sessionId', protect, deleteChatSession);

export default router;