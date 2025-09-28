import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import {
    getBookmarks,
    addBookmark,
    removeBookmark,
    addQuestionBookmark,
    removeQuestionBookmark,
    checkBookmark
} from '../controllers/bookmarkController.js';

// All routes are protected
router.get('/', protect, getBookmarks);
router.post('/', protect, addBookmark);
router.delete('/:bookmarkId', protect, removeBookmark);

// Legacy question bookmarking routes
router.post('/question/:questionId', protect, addQuestionBookmark);
router.delete('/question/:questionId', protect, removeQuestionBookmark);
router.get('/check/:questionId', protect, checkBookmark);

export default router;
