import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
// In ES modules, __dirname is not available by default. Use this workaround:
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import questionsRoutes from './routes/questions.js';
import answersRoutes from './routes/answers.js';
import commentsRoutes from './routes/comments.js';
import aiRoutes from './routes/ai.js';
import usersRoutes from './routes/users.js';
import bookmarksRoutes from './routes/bookmarks.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';
import friendsRoutes from './routes/friends.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Core Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// CORS Middleware for mobile app
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qa_app')
    .then(() => {
        console.log('📂 Connected to MongoDB');
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });

// Root endpoint - API information
// NOTE: You have two app.get('/') routes. Express will only use the first one it encounters.
// This one provides a detailed overview.
app.get('/', (req, res) => {
    res.status(200).json({
        message: '🚀 Mobile Q&A App API Server',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            documentation: 'http://https://devoverflow-backend.onrender.com/api/docs',
            postmanGuide: 'http://https://devoverflow-backend.onrender.com/api/postman-guide',
            apiBase: 'http://https://devoverflow-backend.onrender.com/api'
        },
        features: [
            '✅ User Authentication (JWT)',
            '✅ Questions & Answers System',
            '✅ Voting & Reputation System',
            '✅ Comments & Bookmarks',
            '✅ AI-Powered Suggestions',
            '✅ File Upload Support',
            '✅ Admin Panel',
            '✅ Email Notifications',
            '✅ Search & Filtering',
            '✅ Pagination Support'
        ],
        quickStart: [
            '1. Visit /api/docs for complete API documentation',
            '2. Visit /api/postman-guide for Postman testing guide',
            '3. Register a user at POST /api/auth/register',
            '4. Login at POST /api/auth/login to get your token',
            '5. Use the token for protected endpoints'
        ]
    });
});


// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Base Route - Show available endpoints
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🚀 Q&A Backend API - Available Endpoints',
        version: '1.0.0',
        baseUrl: 'http://https://devoverflow-backend.onrender.com/api',
        documentation: {
            fullDocs: '/api/docs',
            postmanGuide: '/api/postman-guide',
            healthCheck: '/health'
        },
        endpoints: {
            '🔐 Authentication': {
                register: {
                    method: 'POST',
                    url: '/api/auth/register',
                    description: 'Register a new user account',
                    auth: 'Not required'
                },
                login: {
                    method: 'POST',
                    url: '/api/auth/login',
                    description: 'Login and get authentication token',
                    auth: 'Not required'
                },
                profile: {
                    method: 'GET',
                    url: '/api/auth/me',
                    description: 'Get current user profile',
                    auth: 'Bearer token required'
                }
            },
            '❓ Questions': {
                getAllQuestions: {
                    method: 'GET',
                    url: '/api/questions',
                    description: 'Get all questions with pagination',
                    auth: 'Not required'
                },
                createQuestion: {
                    method: 'POST',
                    url: '/api/questions',
                    description: 'Create a new question',
                    auth: 'Bearer token required'
                },
                getQuestion: {
                    method: 'GET',
                    url: '/api/questions/:id',
                    description: 'Get a specific question by ID',
                    auth: 'Not required'
                },
                searchQuestions: {
                    method: 'GET',
                    url: '/api/questions/search',
                    description: 'Search questions by keywords',
                    auth: 'Not required'
                }
            },
            '💬 Answers': {
                createAnswer: {
                    method: 'POST',
                    url: '/api/answers/:questionId',
                    description: 'Create an answer for a question',
                    auth: 'Bearer token required'
                },
                getAnswers: {
                    method: 'GET',
                    url: '/api/answers/:questionId',
                    description: 'Get all answers for a question',
                    auth: 'Not required'
                },
                voteAnswer: {
                    method: 'POST',
                    url: '/api/answers/:id/vote',
                    description: 'Vote on an answer (upvote/downvote)',
                    auth: 'Bearer token required'
                }
            },
            '💭 Comments': {
                addCommentToQuestion: {
                    method: 'POST',
                    url: '/api/comments/question/:questionId',
                    description: 'Add comment to a question',
                    auth: 'Bearer token required'
                },
                addCommentToAnswer: {
                    method: 'POST',
                    url: '/api/comments/answer/:answerId',
                    description: 'Add comment to an answer',
                    auth: 'Bearer token required'
                }
            },
            '🤖 AI Features': {
                answerSuggestion: {
                    method: 'POST',
                    url: '/api/ai/answer-suggestion',
                    description: 'Get AI-powered answer suggestions',
                    auth: 'Bearer token required'
                },
                chatbot: {
                    method: 'POST',
                    url: '/api/ai/chatbot',
                    description: 'Chat with AI for programming help',
                    auth: 'Bearer token required'
                },
                tagSuggestions: {
                    method: 'POST',
                    url: '/api/ai/tag-suggestions',
                    description: 'Get AI-powered tag suggestions',
                    auth: 'Bearer token required'
                }
            },
            '👥 Users & Social': {
                getUserProfile: {
                    method: 'GET',
                    url: '/api/users/:id',
                    description: 'Get user profile by ID',
                    auth: 'Not required'
                },
                followUser: {
                    method: 'POST',
                    url: '/api/users/:id/follow',
                    description: 'Follow another user',
                    auth: 'Bearer token required'
                },
                leaderboard: {
                    method: 'GET',
                    url: '/api/users/leaderboard',
                    description: 'Get top users by reputation',
                    auth: 'Not required'
                }
            },
            '🔖 Bookmarks': {
                getBookmarks: {
                    method: 'GET',
                    url: '/api/bookmarks',
                    description: 'Get user bookmarked questions',
                    auth: 'Bearer token required'
                },
                addBookmark: {
                    method: 'POST',
                    url: '/api/bookmarks/:questionId',
                    description: 'Bookmark a question',
                    auth: 'Bearer token required'
                }
            },
            '📁 File Upload': {
                uploadFile: {
                    method: 'POST',
                    url: '/api/upload',
                    description: 'Upload files (images, documents)',
                    auth: 'Bearer token required'
                }
            },
            '🛡️ Admin Panel': {
                getReports: {
                    method: 'GET',
                    url: '/api/admin/reports',
                    description: 'Get all content reports',
                    auth: 'Admin token required'
                },
                getStats: {
                    method: 'GET',
                    url: '/api/admin/stats',
                    description: 'Get comprehensive admin dashboard statistics',
                    auth: 'Admin token required'
                },
                manageUser: {
                    method: 'PUT',
                    url: '/api/admin/users/:id',
                    description: 'Manage users (ban/unban, promote/demote)',
                    auth: 'Admin token required'
                }
            },
            '👫 Friends': {
                addFriend: {
                    method: 'POST',
                    url: '/api/friends/add',
                    description: 'Send friend request to another user',
                    auth: 'Bearer token required'
                },
                removeFriend: {
                    method: 'POST',
                    url: '/api/friends/remove',
                    description: 'Remove friend or cancel friend request',
                    auth: 'Bearer token required'
                },
                getProfile: {
                    method: 'GET',
                    url: '/api/friends/profile/:id?',
                    description: 'Get detailed user profile with friend status',
                    auth: 'Bearer token required'
                }
            }
        },
        quickStart: [
            '1. 📝 Register: POST /api/auth/register',
            '2. 🔑 Login: POST /api/auth/login',
            '3. 🏠 Browse questions: GET /api/questions',
            '4. ❓ Ask question: POST /api/questions',
            '5. 💬 Answer questions: POST /api/answers/:questionId',
            '6. 🤖 Use AI features: POST /api/ai/chatbot'
        ],
        notes: [
            '🔒 Protected endpoints require "Authorization: Bearer <token>" header',
            '📄 All responses are in JSON format',
            '🔄 Most endpoints support pagination with ?page=1&limit=10',
            '🔍 Search endpoints support filtering and sorting',
            '📊 Admin endpoints require admin privileges'
        ]
    });
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/answers', answersRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/friends', friendsRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// This second root route is unreachable because the one above is defined first.
/*
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Q&A Backend API is running successfully!',
        version: '1.0.0',
        baseUrl: 'http://https://devoverflow-backend.onrender.com/api',
        documentation: '/api/docs',
        endpoints: {
            auth: '/api/auth',
            questions: '/api/questions',
            answers: '/api/answers',
            comments: '/api/comments',
            ai: '/api/ai',
            users: '/api/users',
            bookmarks: '/api/bookmarks',
            upload: '/api/upload',
            admin: '/api/admin'
        }
    });
});
*/

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
    res.status(200).json({
        title: 'Mobile Q&A App API Documentation',
        version: '1.0.0',
        baseUrl: 'http://https://devoverflow-backend.onrender.com/api',
        authentication: {
            type: 'Bearer Token',
            header: 'Authorization: Bearer <your-jwt-token>',
            note: 'Get token from login or register endpoints'
        },
        endpoints: {
            authentication: {
                register: {
                    method: 'POST',
                    url: '/api/auth/register',
                    access: 'Public',
                    description: 'Register a new user',
                    body: {
                        username: 'string (required)',
                        email: 'string (required)',
                        password: 'string (required)'
                    },
                    response: 'Returns JWT token and user data'
                },
                login: {
                    method: 'POST',
                    url: '/api/auth/login',
                    access: 'Public',
                    description: 'Login user',
                    body: {
                        email: 'string (required)',
                        password: 'string (required)'
                    },
                    response: 'Returns JWT token and user data'
                },
                getProfile: {
                    method: 'GET',
                    url: '/api/auth/me',
                    access: 'Private',
                    description: 'Get current user profile',
                    headers: 'Authorization: Bearer <token>',
                    response: 'Returns current user data'
                },
                updateProfile: {
                    method: 'PUT',
                    url: '/api/auth/profile',
                    access: 'Private',
                    description: 'Update user profile',
                    headers: 'Authorization: Bearer <token>',
                    body: {
                        bio: 'string (optional)',
                        location: 'string (optional)',
                        website: 'string (optional)'
                    }
                }
            },
            questions: {
                getAllQuestions: {
                    method: 'GET',
                    url: '/api/questions',
                    access: 'Public',
                    description: 'Get all questions with pagination',
                    queryParams: {
                        page: 'number (default: 1)',
                        limit: 'number (default: 10)',
                        sortBy: 'string (createdAt, votes, answers)',
                        order: 'string (asc, desc)',
                        tags: 'string (comma-separated)'
                    }
                },
                createQuestion: {
                    method: 'POST',
                    url: '/api/questions',
                    access: 'Private',
                    description: 'Create a new question',
                    headers: 'Authorization: Bearer <token>',
                    body: {
                        title: 'string (required)',
                        body: 'string (required)',
                        tags: 'array of strings (optional)'
                    }
                },
                getQuestionById: {
                    method: 'GET',
                    url: '/api/questions/:id',
                    access: 'Public',
                    description: 'Get specific question by ID'
                },
                updateQuestion: {
                    method: 'PUT',
                    url: '/api/questions/:id',
                    access: 'Private (Owner only)',
                    description: 'Update a question',
                    headers: 'Authorization: Bearer <token>',
                    body: {
                        title: 'string (optional)',
                        body: 'string (optional)',
                        tags: 'array of strings (optional)'
                    }
                },
                deleteQuestion: {
                    method: 'DELETE',
                    url: '/api/questions/:id',
                    access: 'Private (Owner/Admin)',
                    description: 'Delete a question',
                    headers: 'Authorization: Bearer <token>'
                },
                voteQuestion: {
                    method: 'POST',
                    url: '/api/questions/:id/vote',
                    access: 'Private',
                    description: 'Vote on a question',
                    headers: 'Authorization: Bearer <token>',
                    body: {
                        voteType: 'string (up or down)'
                    }
                },
                searchQuestions: {
                    method: 'GET',
                    url: '/api/questions/search',
                    access: 'Public',
                    description: 'Search questions',
                    queryParams: {
                        q: 'string (search query)',
                        tags: 'string (comma-separated)',
                        page: 'number',
                        limit: 'number'
                    }
                }
            },
            answers: {
                createAnswer: {
                    method: 'POST',
                    url: '/api/answers/:questionId',
                    access: 'Private',
                    description: 'Create answer for a question',
                    headers: 'Authorization: Bearer <token>',
                    body: {
                        body: 'string (required)'
                    }
                },
                getAnswersByQuestion: {
                    method: 'GET',
                    url: '/api/answers/question/:questionId',
                    access: 'Public',
                    description: 'Get all answers for a question'
                },
                updateAnswer: {
                    method: 'PUT',
                    url: '/api/answers/:id',
                    access: 'Private (Owner only)',
                    description: 'Update an answer',
                    headers: 'Authorization: Bearer <token>',
                    body: {
                        body: 'string (required)'
                    }
                },
                deleteAnswer: {
                    method: 'DELETE',
                    url: '/api/answers/:id',
                    access: 'Private (Owner/Admin)',
                    description: 'Delete an answer',
                    headers: 'Authorization: Bearer <token>'
                },
                voteAnswer: {
                    method: 'POST',
                    url: '/api/answers/:id/vote',
                    access: 'Private',
                    description: 'Vote on an answer',
                    headers: 'Authorization: Bearer <token>',
                    body: {
                        voteType: 'string (up or down)'
                    }
                },
                acceptAnswer: {
                    method: 'POST',
                    url: '/api/answers/:id/accept',
                    access: 'Private (Question Owner)',
                    description: 'Accept answer as solution',
                    headers: 'Authorization: Bearer <token>'
                }
            },
            comments: {
                addCommentToQuestion: {
                    method: 'POST',
                    url: '/api/comments/question/:questionId',
                    access: 'Private',
                    description: 'Add comment to question',
                    headers: 'Authorization: Bearer <token>',
                    body: {
                        body: 'string (required)'
                    }
                },
                addCommentToAnswer: {
                    method: 'POST',
                    url: '/api/comments/answer/:answerId',
                    access: 'Private',
                    description: 'Add comment to answer',
                    headers: 'Authorization: Bearer <token>',
                    body: {
                        body: 'string (required)'
                    }
                },
                getQuestionComments: {
                    method: 'GET',
                    url: '/api/comments/question/:questionId',
                    access: 'Public',
                    description: 'Get comments for a question'
                },
                getAnswerComments: {
                    method: 'GET',
                    url: '/api/comments/answer/:answerId',
                    access: 'Public',
                    description: 'Get comments for an answer'
                }
            },
            ai: {
                getStatus: {
                    method: 'GET',
                    url: '/api/ai/status',
                    access: 'Public',
                    description: 'Check AI service status'
                },
                getAnswerSuggestion: {
                    method: 'POST',
                    url: '/api/ai/answer-suggestion',
                    access: 'Private',
                    description: 'Get AI answer suggestion',
                    headers: 'Authorization: Bearer <token>',
                    body: {
                        questionTitle: 'string (required)',
                        questionBody: 'string (required)',
                        tags: 'array of strings (optional)'
                    }
                },
                getTagSuggestions: {
                    method: 'POST',
                    url: '/api/ai/tag-suggestions',
                    access: 'Private',
                    description: 'Get AI tag suggestions',
                    headers: 'Authorization: Bearer <token>',
                    body: {
                        questionTitle: 'string (required)',
                        questionBody: 'string (required)'
                    }
                },
                chatbot: {
                    method: 'POST',
                    url: '/api/ai/chatbot',
                    access: 'Private',
                    description: 'AI chatbot interaction',
                    headers: 'Authorization: Bearer <token>',
                    body: {
                        message: 'string (required)',
                        context: 'string (optional)'
                    }
                }
            },
            users: {
                getProfile: {
                    method: 'GET',
                    url: '/api/users/:id',
                    access: 'Public',
                    description: 'Get user profile by ID'
                },
                getLeaderboard: {
                    method: 'GET',
                    url: '/api/users/leaderboard',
                    access: 'Public',
                    description: 'Get top users by reputation',
                    queryParams: {
                        limit: 'number (default: 10)',
                        timeframe: 'string (all, month, week)'
                    }
                },
                searchUsers: {
                    method: 'GET',
                    url: '/api/users/search',
                    access: 'Public',
                    description: 'Search users',
                    queryParams: {
                        q: 'string (search query)',
                        page: 'number',
                        limit: 'number'
                    }
                }
            },
            bookmarks: {
                getBookmarks: {
                    method: 'GET',
                    url: '/api/bookmarks',
                    access: 'Private',
                    description: 'Get user bookmarks',
                    headers: 'Authorization: Bearer <token>'
                },
                addBookmark: {
                    method: 'POST',
                    url: '/api/bookmarks/:questionId',
                    access: 'Private',
                    description: 'Add question to bookmarks',
                    headers: 'Authorization: Bearer <token>'
                },
                removeBookmark: {
                    method: 'DELETE',
                    url: '/api/bookmarks/:questionId',
                    access: 'Private',
                    description: 'Remove question from bookmarks',
                    headers: 'Authorization: Bearer <token>'
                }
            },
            fileUpload: {
                uploadFile: {
                    method: 'POST',
                    url: '/api/upload',
                    access: 'Private',
                    description: 'Upload file (images, documents)',
                    headers: 'Authorization: Bearer <token>',
                    contentType: 'multipart/form-data',
                    body: {
                        file: 'file (required, max 5MB)'
                    }
                }
            },
            admin: {
                getReports: {
                    method: 'GET',
                    url: '/api/admin/reports',
                    access: 'Admin only',
                    description: 'Get all content reports',
                    headers: 'Authorization: Bearer <admin-token>'
                },
                createReport: {
                    method: 'POST',
                    url: '/api/admin/reports',
                    access: 'Private',
                    description: 'Report content',
                    headers: 'Authorization: Bearer <token>',
                    body: {
                        contentId: 'string (required)',
                        contentType: 'string (question or answer)',
                        reason: 'string (required)'
                    }
                },
                getStats: {
                    method: 'GET',
                    url: '/api/admin/stats',
                    access: 'Admin only',
                    description: 'Get admin dashboard statistics',
                    headers: 'Authorization: Bearer <admin-token>'
                }
            }
        },
        sampleData: {
            note: 'Use the following sample data to test the API with Postman',
            instructions: 'Visit /api/postman-guide for detailed Postman setup instructions'
        }
    });
});

// Postman Testing Guide
app.get('/api/postman-guide', (req, res) => {
    res.status(200).json({
        title: 'Postman Testing Guide - Mobile Q&A App API',
        baseUrl: 'http://https://devoverflow-backend.onrender.com/api',
        instructions: {
            setup: [
                '1. Download and install Postman from https://www.postman.com/',
                '2. Create a new collection called "Q&A App API"',
                '3. Set collection variables: baseUrl = http://https://devoverflow-backend.onrender.com/api',
                '4. For protected routes, add Authorization header: Bearer {{token}}'
            ],
            workflow: [
                '1. First register a user to get a token',
                '2. Use the token for all protected endpoints',
                '3. Create questions, answers, and comments',
                '4. Test AI features and admin functionality'
            ]
        },
        sampleData: {
            users: [
                { username: 'john_dev', email: 'john@example.com', password: 'password123' },
                { username: 'jane_coder', email: 'jane@example.com', password: 'password123' },
                { username: 'bob_programmer', email: 'bob@example.com', password: 'password123' },
                { username: 'alice_engineer', email: 'alice@example.com', password: 'password123' },
                { username: 'charlie_dev', email: 'charlie@example.com', password: 'password123' },
                { username: 'diana_coder', email: 'diana@example.com', password: 'password123' },
                { username: 'eve_programmer', email: 'eve@example.com', password: 'password123' },
                { username: 'frank_engineer', email: 'frank@example.com', password: 'password123' },
                { username: 'grace_dev', email: 'grace@example.com', password: 'password123' },
                { username: 'admin_user', email: 'admin@example.com', password: 'admin123' }
            ],
            questions: [
                { title: 'How to implement JWT authentication in Node.js?', body: 'I am building a REST API and need to implement secure authentication using JSON Web Tokens. Can someone guide me through the process?', tags: ['nodejs', 'jwt', 'authentication', 'security'] },
                { title: 'Best practices for React state management?', body: 'I have a large React application and I am struggling with state management. Should I use Redux, Context API, or something else?', tags: ['react', 'state-management', 'redux', 'context-api'] },
                { title: 'MongoDB aggregation pipeline optimization', body: 'My MongoDB queries are running slow with large datasets. How can I optimize aggregation pipelines for better performance?', tags: ['mongodb', 'aggregation', 'performance', 'database'] },
                { title: 'Express.js middleware error handling', body: 'What is the best way to handle errors in Express.js middleware? I want to create a centralized error handling system.', tags: ['expressjs', 'middleware', 'error-handling', 'nodejs'] },
                { title: 'Docker containerization for Node.js apps', body: 'I want to containerize my Node.js application using Docker. What are the best practices for creating efficient Docker images?', tags: ['docker', 'nodejs', 'containerization', 'devops'] },
                { title: 'JavaScript async/await vs Promises', body: 'When should I use async/await versus traditional Promises? What are the performance implications of each approach?', tags: ['javascript', 'async-await', 'promises', 'asynchronous'] },
                { title: 'TypeScript generic types best practices', body: 'I am learning TypeScript and struggling with generic types. Can someone explain when and how to use them effectively?', tags: ['typescript', 'generics', 'types', 'javascript'] },
                { title: 'REST API versioning strategies', body: 'What are the different approaches to API versioning? Should I use URL versioning, header versioning, or something else?', tags: ['api', 'versioning', 'rest', 'backend'] },
                { title: 'React Native navigation patterns', body: 'I am building a React Native app and need to implement complex navigation. What are the current best practices?', tags: ['react-native', 'navigation', 'mobile', 'routing'] },
                { title: 'GraphQL vs REST API comparison', body: 'I am trying to decide between GraphQL and REST for my new project. What are the pros and cons of each approach?', tags: ['graphql', 'rest', 'api', 'comparison'] }
            ],
            answers: [
                { body: 'For JWT authentication in Node.js, you should use the jsonwebtoken library. Here is a basic implementation: \\n\\n```javascript\\nconst jwt = require("jsonwebtoken");\\n\\n// Generate token\\nconst token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });\\n\\n// Verify token\\nconst decoded = jwt.verify(token, process.env.JWT_SECRET);\\n```\\n\\nMake sure to store the secret securely and set appropriate expiration times.' },
                { body: 'For React state management, it depends on your app size:\\n\\n- **Small apps**: Use useState and useContext\\n- **Medium apps**: Context API with useReducer\\n- **Large apps**: Redux Toolkit or Zustand\\n\\nRedux is overkill for small apps, but great for complex state with time-travel debugging.' },
                { body: 'MongoDB aggregation optimization tips:\\n\\n1. Use $match early to filter documents\\n2. Add indexes for fields used in $match and $sort\\n3. Use $project to limit fields\\n4. Consider $limit to reduce processing\\n\\n```javascript\\n// Good pipeline\\n[\\n  { $match: { status: "active" } },\\n  { $sort: { createdAt: -1 } },\\n  { $limit: 100 },\\n  { $project: { title: 1, author: 1 } }\\n]\\n```' },
                { body: 'For Express.js error handling, create a centralized error middleware:\\n\\n```javascript\\napp.use((err, req, res, next) => {\\n  console.error(err.stack);\\n  res.status(err.status || 500).json({\\n    error: err.message || "Internal Server Error"\\n  });\\n});\\n```\\n\\nAlways call next(error) in your route handlers to trigger this middleware.' },
                { body: 'Docker best practices for Node.js:\\n\\n1. Use multi-stage builds\\n2. Use .dockerignore file\\n3. Run as non-root user\\n4. Use alpine images for smaller size\\n\\n```dockerfile\\nFROM node:16-alpine\\nWORKDIR /app\\nCOPY package*.json ./\\nRUN npm ci --only=production\\nCOPY . .\\nUSER node\\nEXPOSE 3000\\nCMD ["npm", "start"]\\n```' },
                { body: 'async/await vs Promises:\\n\\n**Use async/await when:**\\n- Sequential operations\\n- Better readability\\n- Error handling with try/catch\\n\\n**Use Promises when:**\\n- Parallel operations (Promise.all)\\n- Chaining transformations\\n- Library compatibility\\n\\nPerformance is similar, choose based on readability and use case.' },
                { body: 'TypeScript generics provide type safety and reusability:\\n\\n```typescript\\n// Generic function\\nfunction identity<T>(arg: T): T {\\n  return arg;\\n}\\n\\n// Generic interface\\ninterface ApiResponse<T> {\\n  data: T;\\n  status: number;\\n}\\n\\n// Usage\\nconst userResponse: ApiResponse<User> = await fetchUser();\\n```\\n\\nUse generics when you want type safety without knowing the exact type at compile time.' },
                { body: 'API versioning strategies:\\n\\n1. **URL versioning**: /api/v1/users (most common)\\n2. **Header versioning**: Accept-Version: v1\\n3. **Query parameter**: /api/users?version=1\\n\\nURL versioning is recommended for REST APIs as it is simple, cacheable, and discoverable.' },
                { body: 'React Native navigation with React Navigation 6:\\n\\n```javascript\\nimport { NavigationContainer } from "@react-navigation/native";\\nimport { createStackNavigator } from "@react-navigation/stack";\\n\\nconst Stack = createStackNavigator();\\n\\nfunction App() {\\n  return (\\n    <NavigationContainer>\\n      <Stack.Navigator>\\n        <Stack.Screen name="Home" component={HomeScreen} />\\n        <Stack.Screen name="Details" component={DetailsScreen} />\\n      </Stack.Navigator>\\n    </NavigationContainer>\\n  );\\n}\\n```' },
                { body: 'GraphQL vs REST comparison:\\n\\n**GraphQL advantages:**\\n- Single endpoint\\n- Client specifies data needs\\n- Strong type system\\n- Real-time subscriptions\\n\\n**REST advantages:**\\n- Simple and familiar\\n- Better caching\\n- Easier debugging\\n- Mature ecosystem\\n\\nChoose GraphQL for complex data requirements, REST for simple CRUD operations.' }
            ],
            comments: [
                { body: 'Thanks for the detailed explanation. This really helped me understand the concept better.' },
                { body: 'Have you considered using middleware for this? It might simplify your implementation.' },
                { body: 'This approach worked perfectly for my use case. Thanks for sharing!' },
                { body: 'Excellent answer! I would also recommend checking the official documentation for more details.' },
                { body: 'This solution is outdated. Here is a more modern approach that works better.' },
                { body: 'I tried this but got an error. Can you help me debug the issue?' },
                { body: 'Perfect timing! I was just working on this exact problem yesterday.' },
                { body: 'This is a comprehensive answer. Saving this for future reference!' }
            ],
            reports: [
                { reason: 'spam', description: 'This content appears to be promotional spam' },
                { reason: 'inappropriate', description: 'Content contains inappropriate language' },
                { reason: 'duplicate', description: 'This question has already been asked before' },
                { reason: 'off-topic', description: 'This content is not related to programming' },
                { reason: 'low-quality', description: 'Answer lacks sufficient detail and explanation' }
            ]
        },
        postmanSteps: {
            step1_register: {
                method: 'POST',
                url: '{{baseUrl}}/auth/register',
                description: 'Register a new user',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    username: 'testuser1',
                    email: 'test1@example.com',
                    password: 'password123'
                },
                note: 'Save the returned token for subsequent requests. Set it as collection variable "token"'
            },
            step2_login: {
                method: 'POST',
                url: '{{baseUrl}}/auth/login',
                description: 'Login existing user',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    email: 'test1@example.com',
                    password: 'password123'
                },
                note: 'Copy the token from response and update your collection variable'
            },
            step3_profile: {
                method: 'GET',
                url: '{{baseUrl}}/auth/profile',
                headers: { 'Authorization': 'Bearer {{token}}' },
                description: 'Get user profile (test authentication)'
            },
            step4_createQuestion: {
                method: 'POST',
                url: '{{baseUrl}}/questions',
                headers: {
                    'Authorization': 'Bearer {{token}}',
                    'Content-Type': 'application/json'
                },
                body: {
                    title: 'How to use Postman for API testing?',
                    body: 'I want to learn how to effectively test APIs using Postman. Any tips and best practices?',
                    tags: ['postman', 'api', 'testing', 'automation']
                },
                note: 'Save the returned question ID for next steps'
            },
            step5_getAllQuestions: {
                method: 'GET',
                url: '{{baseUrl}}/questions',
                description: 'Get all questions (public endpoint, no auth required)',
                note: 'Test pagination with ?page=1&limit=10'
            },
            step6_getQuestionById: {
                method: 'GET',
                url: '{{baseUrl}}/questions/{{questionId}}',
                description: 'Get specific question details',
                note: 'Replace {{questionId}} with actual ID from step 4'
            },
            step7_createAnswer: {
                method: 'POST',
                url: '{{baseUrl}}/answers/{{questionId}}',
                headers: {
                    'Authorization': 'Bearer {{token}}',
                    'Content-Type': 'application/json'
                },
                body: {
                    body: 'Postman is great for API testing! Here are some tips:\\n\\n1. Use environment variables for different environments\\n2. Create collections to organize your requests\\n3. Use pre-request scripts for dynamic data\\n4. Add tests to validate responses\\n5. Use collection runner for automated testing\\n\\nStart with creating a workspace and setting up your base URL as an environment variable.'
                },
                note: 'Save the answer ID for voting and commenting'
            },
            step8_voteQuestion: {
                method: 'POST',
                url: '{{baseUrl}}/questions/{{questionId}}/vote',
                headers: {
                    'Authorization': 'Bearer {{token}}',
                    'Content-Type': 'application/json'
                },
                body: {
                    type: 'upvote'
                },
                description: 'Vote on a question (upvote/downvote)'
            },
            step9_voteAnswer: {
                method: 'POST',
                url: '{{baseUrl}}/answers/{{answerId}}/vote',
                headers: {
                    'Authorization': 'Bearer {{token}}',
                    'Content-Type': 'application/json'
                },
                body: {
                    type: 'upvote'
                },
                description: 'Vote on an answer'
            },
            step10_addComment: {
                method: 'POST',
                url: '{{baseUrl}}/comments/question/{{questionId}}',
                headers: {
                    'Authorization': 'Bearer {{token}}',
                    'Content-Type': 'application/json'
                },
                body: {
                    body: 'Great question! This is very relevant for modern web development.'
                },
                description: 'Add comment to question'
            },
            step11_bookmark: {
                method: 'POST',
                url: '{{baseUrl}}/bookmarks/{{questionId}}',
                headers: {
                    'Authorization': 'Bearer {{token}}'
                },
                description: 'Bookmark a question'
            },
            step12_aiSuggestion: {
                method: 'POST',
                url: '{{baseUrl}}/ai/suggestion',
                headers: {
                    'Authorization': 'Bearer {{token}}',
                    'Content-Type': 'application/json'
                },
                body: {
                    questionTitle: 'How to optimize React performance?',
                    questionBody: 'My React app is running slowly with large lists. What are the best optimization techniques?',
                    tags: ['react', 'performance', 'optimization']
                },
                description: 'Get AI-powered suggestions for question'
            }
        },
        environmentVariables: {
            variables: {
                baseUrl: 'http://https://devoverflow-backend.onrender.com/api',
                token: 'your-jwt-token-here',
                questionId: 'question-id-from-create-response',
                answerId: 'answer-id-from-create-response',
                userId: 'user-id-from-auth-response'
            }
        },
        testingWorkflow: {
            phase1_authentication: [
                'Register 10 users using the sample data provided',
                'Login with each user to get their tokens',
                'Test profile endpoints to verify authentication'
            ],
            phase2_content: [
                'Create 10 questions using different users',
                'Add 2-3 answers per question',
                'Vote on questions and answers',
                'Add comments to questions and answers'
            ],
            phase3_features: [
                'Test bookmark functionality',
                'Try AI suggestion feature',
                'Test search and filtering',
                'Upload profile pictures'
            ],
            phase4_admin: [
                'Create admin user',
                'Test user management',
                'Test content moderation',
                'Generate reports'
            ]
        },
        tips: [
            'Use environment variables for baseUrl and token',
            'Create tests in Postman to validate responses automatically',
            'Use pre-request scripts to set dynamic values like timestamps',
            'Organize requests in folders by feature (Auth, Questions, Answers, etc.)',
            'Use collection runner for automated testing of entire workflows',
            'Export collections to share with team members',
            'Set up monitoring to check API health regularly',
            'Use mock servers for frontend development before backend is ready',
            'Create documentation from your Postman collections',
        ],
        troubleshooting: {
            commonIssues: [
                {
                    issue: 'Token not working',
                    solution: 'Check if token is properly set in Authorization header with "Bearer " prefix'
                },
                {
                    issue: '404 errors',
                    solution: 'Verify the base URL is correct and server is running on port 3000'
                },
                {
                    issue: 'Validation errors',
                    solution: 'Check request body format matches the API documentation'
                },
                {
                    issue: 'CORS errors',
                    solution: 'CORS is configured for development, but check if origin is allowed'
                }
            ]
        }
    });
});

// Handle 404 errors
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global Error Handler:', error);

    let errorMessage = 'Something went wrong!';
    let statusCode = 500;

    // Mongoose validation error
    if (error.name === 'ValidationError') {
        errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
        statusCode = 400;
    }

    // Mongoose duplicate key error
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        errorMessage = `${field} already exists`;
        statusCode = 400;
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        errorMessage = 'Invalid token';
        statusCode = 401;
    }

    if (error.name === 'TokenExpiredError') {
        errorMessage = 'Token expired';
        statusCode = 401;
    }

    res.status(statusCode).json({
        success: false,
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📱 API Base URL: http://localhost:${PORT}/api`);
});