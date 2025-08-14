const mongoose = require('mongoose');
require('dotenv').config();

// Test MongoDB connection
async function testDatabase() {
    try {
        console.log('🔌 Testing MongoDB connection...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully!');
        await mongoose.connection.close();
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        return false;
    }
}

// Test environment variables
function testEnvironmentVariables() {
    console.log('🔧 Testing environment variables...');
    const required = [
        'MONGO_URI',
        'JWT_SECRET',
        'JWT_EXPIRE',
        'GEMINI_API_KEY',
        'EMAIL_SERVICE',
        'EMAIL_USER',
        'EMAIL_PASS',
        'PORT'
    ];

    const missing = [];
    required.forEach(key => {
        if (!process.env[key]) {
            missing.push(key);
        }
    });

    if (missing.length > 0) {
        console.error('❌ Missing environment variables:', missing);
        return false;
    }

    console.log('✅ All required environment variables are set!');
    return true;
}

// Test file structure
function testFileStructure() {
    console.log('📁 Testing file structure...');
    const fs = require('fs');
    const path = require('path');

    const requiredFiles = [
        'app.js',
        'package.json',
        '.env',
        'models/User.js',
        'models/Question.js',
        'models/Answer.js',
        'models/Comment.js',
        'models/Report.js',
        'controllers/authController.js',
        'controllers/questionController.js',
        'controllers/answerController.js',
        'controllers/aiController.js',
        'controllers/userController.js',
        'controllers/bookmarkController.js',
        'controllers/commentController.js',
        'controllers/adminController.js',
        'controllers/uploadController.js',
        'routes/auth.js',
        'routes/questions.js',
        'routes/answers.js',
        'routes/ai.js',
        'routes/users.js',
        'routes/bookmarks.js',
        'routes/comments.js',
        'routes/admin.js',
        'routes/upload.js',
        'middleware/authMiddleware.js'
    ];

    const missing = [];
    requiredFiles.forEach(file => {
        if (!fs.existsSync(path.join(__dirname, file))) {
            missing.push(file);
        }
    });

    if (missing.length > 0) {
        console.error('❌ Missing files:', missing);
        return false;
    }

    console.log('✅ All required files exist!');
    return true;
}

// Test dependencies
function testDependencies() {
    console.log('📦 Testing dependencies...');
    try {
        require('express');
        require('mongoose');
        require('jsonwebtoken');
        require('bcryptjs');
        require('@google/generative-ai');
        require('multer');
        require('nodemailer');
        require('dotenv');

        console.log('✅ All dependencies are installed!');
        return true;
    } catch (error) {
        console.error('❌ Missing dependency:', error.message);
        console.log('💡 Run: npm install');
        return false;
    }
}

// Main test function
async function runTests() {
    console.log('🚀 Running Backend Readiness Tests...\n');

    const tests = [
        testEnvironmentVariables(),
        testFileStructure(),
        testDependencies(),
        await testDatabase()
    ];

    const passed = tests.filter(Boolean).length;
    const total = tests.length;

    console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);

    if (passed === total) {
        console.log('🎉 Backend is ready to run!');
        console.log('💡 Start with: npm start');
        console.log('🔧 Development mode: npm run dev');
        return true;
    } else {
        console.log('❌ Please fix the issues above before running the backend.');
        return false;
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { runTests };
