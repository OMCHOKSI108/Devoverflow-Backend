import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import {
    getBookmarks,
    addBookmark,
    removeBookmark,
    checkBookmark
} from '../controllers/bookmarkController.js';

// All routes are protected
router.get('/', protect, getBookmarks);
router.post('/:questionId', protect, addBookmark);
router.delete('/:questionId', protect, removeBookmark);
router.get('/check/:questionId', protect, checkBookmark);

export default router;
