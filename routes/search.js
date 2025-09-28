import express from 'express';
import {
    advancedSearch,
    getSearchSuggestions,
    getTrendingTopics
} from '../controllers/searchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All search routes require authentication
router.use(protect);

// @route   GET /api/search
// @desc    Advanced search for questions
// @access  Private
router.get('/', advancedSearch);

// @route   GET /api/search/suggestions
// @desc    Get search suggestions and popular tags
// @access  Private
router.get('/suggestions', getSearchSuggestions);

// @route   GET /api/search/trending
// @desc    Get trending topics/tags
// @access  Private
router.get('/trending', getTrendingTopics);

export default router;