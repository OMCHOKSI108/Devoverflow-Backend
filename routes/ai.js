import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import {
    getAiStatus,
    getAnswerSuggestion,
    getTagSuggestions,
    chatbot,
    getQuestionImprovements,
    getSimilarQuestions
    ,
    createFlowchart,
    getFlow,
    getFlowRender
} from '../controllers/aiController.js';

// Public routes
router.get('/status', getAiStatus);
router.post('/similar-questions', getSimilarQuestions);

// Protected routes
router.post('/answer-suggestion', protect, getAnswerSuggestion);
router.post('/tag-suggestions', protect, getTagSuggestions);
router.post('/chatbot', protect, chatbot);
router.post('/question-improvements', protect, getQuestionImprovements);

// Flowchart endpoints
router.post('/flowchart', protect, createFlowchart);
router.get('/flowchart/:id', protect, getFlow);
router.get('/flowchart/:id/render', protect, getFlowRender);

export default router;
