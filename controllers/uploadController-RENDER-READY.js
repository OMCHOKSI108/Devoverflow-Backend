// DEPLOYMENT-READY UPLOAD CONTROLLER FOR RENDER
// Uses Cloudinary for cloud storage instead of local disk storage

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloud storage configuration for production
const cloudStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'qa-app-uploads',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
        transformation: [
            { width: 1000, height: 1000, crop: 'limit' }, // Optimize images
            { quality: 'auto:good' }
        ]
    }
});

// Local storage configuration for development
const localStorage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `file-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Choose storage based on environment
const storage = process.env.NODE_ENV === 'production' ? cloudStorage : localStorage;

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5000000  // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow specific file types
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and documents are allowed!'));
        }
    }
}).single('file');

export const uploadFile = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file was uploaded.'
            });
        }

        // Response differs based on storage type
        const fileUrl = process.env.NODE_ENV === 'production'
            ? req.file.path  // Cloudinary URL
            : `/uploads/${req.file.filename}`;  // Local URL

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                filename: req.file.filename || req.file.public_id,
                filePath: fileUrl,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
                uploadedAt: new Date().toISOString()
            }
        });
    });
};

// Additional endpoint to delete files (useful for cleanup)
export const deleteFile = async (req, res) => {
    try {
        const { publicId } = req.params;

        if (process.env.NODE_ENV === 'production') {
            // Delete from Cloudinary
            const result = await cloudinary.uploader.destroy(publicId);

            if (result.result === 'ok') {
                res.status(200).json({
                    success: true,
                    message: 'File deleted successfully'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'File not found'
                });
            }
        } else {
            // For local development
            res.status(200).json({
                success: true,
                message: 'File deletion not implemented for local storage'
            });
        }

    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting file'
        });
    }
};
