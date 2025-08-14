import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { uploadFile } from '../controllers/uploadController.js';
router.post('/', protect, uploadFile);
export default router;
