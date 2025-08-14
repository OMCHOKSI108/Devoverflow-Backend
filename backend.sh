#!/bin/bash

# --- Final Backend Generation Script ---
# This script creates a complete Node.js, Express, and MongoDB backend structure
# with all features discussed, including authentication, Gemini AI integration,
# user profiles, file uploads, and admin moderation tools.

# Define the project directory name
PROJECT_NAME="mobile_app_backend"

# --- Script Start ---
echo "🚀 Starting complete backend project setup for '$PROJECT_NAME'..."

# Create project directory and navigate into it
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# 1. Initialize Node.js project and create package.json silently
echo "📦 Initializing Node.js project..."
npm init -y > /dev/null

# 2. Install all required dependencies
echo "📥 Installing dependencies (express, mongoose, bcryptjs, jsonwebtoken, dotenv, @google/generative-ai, nodemailer, multer)..."
npm install express mongoose bcryptjs jsonwebtoken dotenv @google/generative-ai nodemailer multer > /dev/null

# 3. Create the full directory structure
echo "📁 Creating directory structure (controllers, models, routes, middleware, uploads)..."
mkdir -p controllers models routes middleware uploads

# 4. Create the .env file with a comprehensive template
echo "🔑 Creating .env file template. IMPORTANT: You must fill this file with your credentials!"
cat << 'EOF' > .env
# -------------------------------------
# SERVER CONFIGURATION
# -------------------------------------
PORT=3000
NODE_ENV=development

# -------------------------------------
# DATABASE CONFIGURATION (MongoDB)
# -------------------------------------
# Your full MongoDB connection string (e.g., from MongoDB Atlas)
MONGO_URI=your_mongodb_connection_string_here

# -------------------------------------
# AUTHENTICATION (JSON Web Token)
# -------------------------------------
# Use a strong, random string for the JWT secret
JWT_SECRET=replace_this_with_a_very_long_random_secret_string
JWT_EXPIRES_IN=30d

# -------------------------------------
# GOOGLE GEMINI AI API
# -------------------------------------
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_DEFAULT_MODEL=gemini-1.5-flash

# -------------------------------------
# EMAIL CONFIGURATION (Nodemailer for Email Verification)
# -------------------------------------
# For Gmail, use an "App Password". For other services, use their SMTP details.
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email_address@gmail.com
EMAIL_PASS=your_generated_app_password
EMAIL_FROM="Your App Name <no-reply@yourdomain.com>"

# -------------------------------------
# APPLICATION SETTINGS
# -------------------------------------
# The base URL of your frontend app (for creating verification links)
CLIENT_URL=http://localhost:8080
EOF

# 5. Create the main server file: app.js
echo "⚙️  Creating main server file: app.js..."
cat << 'EOF' > app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Core Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB Connected...'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/answers', require('./routes/answers'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/users', require('./routes/users'));
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/admin', require('./routes/admin'));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic root route for health check
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend API is running.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server is running on port ${PORT}`));
EOF

# 6. Create Authentication Middleware
echo "🛡️  Creating authentication middleware (protect, admin)..."
cat << 'EOF' > middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes by verifying JWT
exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token and attach to request object
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error('Authentication Error:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// Middleware to grant access to admin users only
exports.admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
};
EOF

# 7. Create all Mongoose Schemas (Models)
echo "💾 Creating all Mongoose schemas in /models..."
# User Model
cat << 'EOF' > models/User.js
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    reputation: { type: Number, default: 0 },
    badges: [String],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    profile: {
        bio: { type: String, default: '' },
        location: { type: String, default: '' },
        website: { type: String, default: '' },
    },
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);
EOF
# Question Model
cat << 'EOF' > models/Question.js
const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    tags: [String],
    votes: { type: Number, default: 0 },
    answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, { timestamps: true });
questionSchema.index({ title: 'text', body: 'text' });
module.exports = mongoose.model('Question', questionSchema);
EOF
# Answer Model
cat << 'EOF' > models/Answer.js
const mongoose = require('mongoose');
const answerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    body: { type: String, required: true },
    votes: { type: Number, default: 0 },
    isAccepted: { type: Boolean, default: false },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, { timestamps: true });
module.exports = mongoose.model('Answer', answerSchema);
EOF
# Comment Model
cat << 'EOF' > models/Comment.js
const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true },
}, { timestamps: true });
module.exports = mongoose.model('Comment', commentSchema);
EOF
# Report Model
cat << 'EOF' > models/Report.js
const mongoose = require('mongoose');
const reportSchema = new mongoose.Schema({
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    contentType: { type: String, enum: ['question', 'answer'], required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
}, { timestamps: true });
module.exports = mongoose.model('Report', reportSchema);
EOF

# 8. Create all Routes and placeholder Controllers
echo "🕹️  Creating all routes and placeholder controllers..."

# --- AUTH ---
cat << 'EOF' > routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, verifyEmail } = require('../controllers/authController');
router.post('/register', register);
router.post('/login', login);
router.get('/verify/:token', verifyEmail);
module.exports = router;
EOF
cat << 'EOF' > controllers/authController.js
// PLACEHOLDER: Implement full logic
exports.register = async (req, res) => res.status(501).json({ message: "Register endpoint not implemented." });
exports.login = async (req, res) => res.status(501).json({ message: "Login endpoint not implemented." });
exports.verifyEmail = async (req, res) => res.status(501).json({ message: "Verify email endpoint not implemented." });
EOF

# --- QUESTIONS ---
cat << 'EOF' > routes/questions.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAllQuestions, createQuestion, searchQuestions, voteOnQuestion } = require('../controllers/questionController');
router.route('/').get(getAllQuestions).post(protect, createQuestion);
router.get('/search', searchQuestions);
router.post('/:id/vote', protect, voteOnQuestion);
module.exports = router;
EOF
cat << 'EOF' > controllers/questionController.js
// PLACEHOLDER: Implement full logic
exports.getAllQuestions = async (req, res) => res.status(501).json({ message: "Get all questions endpoint not implemented." });
exports.createQuestion = async (req, res) => res.status(501).json({ message: "Create question endpoint not implemented." });
exports.searchQuestions = async (req, res) => res.status(501).json({ message: "Search questions endpoint not implemented." });
exports.voteOnQuestion = async (req, res) => res.status(501).json({ message: "Vote on question endpoint not implemented." });
EOF

# --- ANSWERS ---
cat << 'EOF' > routes/answers.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createAnswer, voteOnAnswer, acceptAnswer } = require('../controllers/answerController');
router.post('/:questionId', protect, createAnswer);
router.post('/:id/vote', protect, voteOnAnswer);
router.post('/:id/accept', protect, acceptAnswer);
module.exports = router;
EOF
cat << 'EOF' > controllers/answerController.js
// PLACEHOLDER: Implement full logic
exports.createAnswer = async (req, res) => res.status(501).json({ message: "Create answer endpoint not implemented." });
exports.voteOnAnswer = async (req, res) => res.status(501).json({ message: "Vote on answer endpoint not implemented." });
exports.acceptAnswer = async (req, res) => res.status(501).json({ message: "Accept answer endpoint not implemented." });
EOF

# --- COMMENTS ---
cat << 'EOF' > routes/comments.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
router.post('/question/:questionId', protect, (req, res) => res.status(501).json({message: "Add comment to question endpoint not implemented"}));
router.post('/answer/:answerId', protect, (req, res) => res.status(501).json({message: "Add comment to answer endpoint not implemented"}));
module.exports = router;
EOF

# --- AI (GEMINI) ---
cat << 'EOF' > routes/ai.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAiStatus, getAnswerSuggestion, getTagSuggestions, chatbot, getQuestionImprovements } = require('../controllers/aiController');
router.get('/status', getAiStatus);
router.get('/answer-suggestion/:questionId', getAnswerSuggestion);
router.post('/tag-suggestions', protect, getTagSuggestions);
router.post('/chatbot', protect, chatbot);
router.post('/question-improvements', protect, getQuestionImprovements);
module.exports = router;
EOF
cat << 'EOF' > controllers/aiController.js
// PLACEHOLDER: Implement full logic with Gemini SDK
exports.getAiStatus = (req, res) => res.json({ status: 'AI operational', model: process.env.GEMINI_DEFAULT_MODEL });
exports.getAnswerSuggestion = async (req, res) => res.status(501).json({ message: "AI answer suggestion endpoint not implemented." });
exports.getTagSuggestions = async (req, res) => res.status(501).json({ message: "AI tag suggestions endpoint not implemented." });
exports.chatbot = async (req, res) => res.status(501).json({ message: "AI chatbot endpoint not implemented." });
exports.getQuestionImprovements = async (req, res) => res.status(501).json({ message: "AI question improvements endpoint not implemented." });
EOF

# --- USERS / PROFILES ---
cat << 'EOF' > routes/users.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyProfile, getUserProfile, updateUserProfile } = require('../controllers/userController');
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateUserProfile);
router.get('/:id', getUserProfile);
module.exports = router;
EOF
cat << 'EOF' > controllers/userController.js
// PLACEHOLDER: Implement full logic
exports.getMyProfile = async (req, res) => res.status(501).json({ message: "Get my profile endpoint not implemented." });
exports.getUserProfile = async (req, res) => res.status(501).json({ message: "Get user profile endpoint not implemented." });
exports.updateUserProfile = async (req, res) => res.status(501).json({ message: "Update user profile endpoint not implemented." });
EOF

# --- BOOKMARKS ---
cat << 'EOF' > routes/bookmarks.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getBookmarks, addBookmark, removeBookmark } = require('../controllers/bookmarkController');
router.route('/').get(protect, getBookmarks).post(protect, addBookmark);
router.delete('/:id', protect, removeBookmark);
module.exports = router;
EOF
cat << 'EOF' > controllers/bookmarkController.js
// PLACEHOLDER: Implement full logic
exports.getBookmarks = async (req, res) => res.status(501).json({ message: "Get bookmarks endpoint not implemented." });
exports.addBookmark = async (req, res) => res.status(501).json({ message: "Add bookmark endpoint not implemented." });
exports.removeBookmark = async (req, res) => res.status(501).json({ message: "Remove bookmark endpoint not implemented." });
EOF

# --- UPLOAD ---
cat << 'EOF' > routes/upload.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadFile } = require('../controllers/uploadController');
router.post('/', protect, uploadFile);
module.exports = router;
EOF
cat << 'EOF' > controllers/uploadController.js
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `file-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage, limits: { fileSize: 5000000 } }).single('file'); // 5MB limit
exports.uploadFile = (req, res) => {
    upload(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        if (!req.file) return res.status(400).json({ message: 'No file was uploaded.' });
        res.status(200).json({
            message: 'File uploaded successfully',
            filePath: `/uploads/${req.file.filename}`
        });
    });
};
EOF

# --- ADMIN ---
cat << 'EOF' > routes/admin.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getReports, deleteContentAsAdmin } = require('../controllers/adminController');
router.use(protect, admin); // Secure all routes in this file
router.get('/reports', getReports);
router.delete('/content/:id', deleteContentAsAdmin);
module.exports = router;
EOF
cat << 'EOF' > controllers/adminController.js
// PLACEHOLDER: Implement full logic
exports.getReports = async (req, res) => res.status(501).json({ message: "Get reports endpoint not implemented." });
exports.deleteContentAsAdmin = async (req, res) => res.status(501).json({ message: "Admin delete content endpoint not implemented." });
EOF


# --- Final Instructions ---
echo ""
echo "✅ Backend project '$PROJECT_NAME' created successfully!"
echo ""
echo "--- NEXT STEPS ---"
echo "1. Navigate into the project directory: cd $PROJECT_NAME"
echo "2. VERY IMPORTANT: Open the .env file and fill in your actual credentials."
echo "3. Review the placeholder logic in the '/controllers' directory. Each function currently returns a '501 Not Implemented' status. You must replace these with your application's logic."
echo "4. Run 'node app.js' to start your server."
echo ""
echo "Happy coding!"
echo ""