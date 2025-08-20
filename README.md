# Mobile Q&A App Backend

A complete Node.js backend API for a mobile Q&A application with AI integration.

## Features

### Core Functionality
- **User Authentication** - Registration, login, email verification, JWT tokens
- **Questions & Answers** - Full CRUD operations with voting and search
- **Comments System** - Add comments to questions and answers
- **Bookmarks** - Save questions for later reference
- **File Uploads** - Support for image and document attachments
- **AI Integration** - Powered by Google Gemini AI for suggestions and improvements

### Advanced Features
- **Admin Panel** - Content moderation, user management, and reporting system
- **Reputation System** - User reputation based on community engagement
- **Search & Filtering** - Full-text search with advanced filtering options
- **Pagination** - Efficient data loading for mobile clients
- **Error Handling** - Comprehensive error handling and validation

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Google Gemini AI
- **File Upload**: Multer
- **Email**: Nodemailer
- **Security**: bcryptjs for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Google Gemini API key (for AI features)
- Email service credentials (for email verification)

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   - Copy `.env` file and update with your credentials
   - Set your MongoDB URI
   - Add your Gemini API key
   - Configure email settings

3. **Start the Server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Verify Installation**
   - Open http://localhost:3000
   - You should see the API status page

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify/:token` - Email verification
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Questions
- `GET /api/questions` - Get all questions (with pagination)
- `POST /api/questions` - Create new question
- `GET /api/questions/:id` - Get specific question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `GET /api/questions/search` - Search questions
- `POST /api/questions/:id/vote` - Vote on question

### Answers
- `GET /api/answers/question/:questionId` - Get answers for question
- `POST /api/answers/:questionId` - Create new answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer
- `POST /api/answers/:id/vote` - Vote on answer
- `POST /api/answers/:id/accept` - Accept answer as solution

### Comments
- `GET /api/comments/question/:questionId` - Get question comments
- `GET /api/comments/answer/:answerId` - Get answer comments
- `POST /api/comments/question/:questionId` - Add comment to question
- `POST /api/comments/answer/:answerId` - Add comment to answer
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### AI Features
- `GET /api/ai/status` - Check AI service status
- `POST /api/ai/answer-suggestion` - Get AI answer suggestions
- `POST /api/ai/tag-suggestions` - Get tag suggestions
- `POST /api/ai/chatbot` - AI chatbot interaction
- `POST /api/ai/question-improvements` - Get question improvement suggestions
- `POST /api/ai/similar-questions` - Find similar questions

### Users
- `GET /api/users/me` - Get current user profile
- `GET /api/users/:id` - Get user profile by ID
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/leaderboard` - Get top users by reputation
- `GET /api/users/search` - Search users
- `GET /api/users/:id/activity` - Get user activity feed

### Bookmarks
- `GET /api/bookmarks` - Get user bookmarks
- `POST /api/bookmarks/:questionId` - Add bookmark
- `DELETE /api/bookmarks/:questionId` - Remove bookmark
- `GET /api/bookmarks/check/:questionId` - Check bookmark status

### File Upload
- `POST /api/upload` - Upload file (images, documents)

### Admin (Admin access required)
- `GET /api/admin/reports` - Get all reports
- `POST /api/admin/reports` - Create new report
- `PUT /api/admin/reports/:id/resolve` - Resolve report
- `GET /api/admin/stats` - Get admin dashboard statistics
- `DELETE /api/admin/content/:type/:id` - Delete content as admin
- `PUT /api/admin/users/:id` - Manage user (ban/promote/etc.)

## Mobile App Integration

This backend is specifically designed for mobile applications with:

- **RESTful API** - Clean, predictable endpoints
- **JSON Responses** - Lightweight data format
- **CORS Support** - Cross-origin requests enabled
- **Token Authentication** - Stateless authentication perfect for mobile
- **Pagination** - Efficient data loading for mobile networks
- **Error Handling** - Consistent error response format

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **Input Validation** - Comprehensive request validation
- **Role-based Access** - Admin and user roles
- **CORS Protection** - Controlled cross-origin access
- **File Upload Security** - File type and size restrictions

## Business Logic Examples

### Reputation System
- Question upvote: +5 reputation
- Answer upvote: +10 reputation
- Accepted answer: +15 reputation bonus
- Downvotes: -2 to -5 reputation

### AI Integration
- **Answer Suggestions**: AI analyzes questions and provides helpful answers
- **Tag Suggestions**: Automatic tag recommendations based on content
- **Question Improvements**: AI feedback for better question formulation
- **Chatbot**: General programming help and guidance

### Content Moderation
- **User Reports**: Community-driven content reporting
- **Admin Dashboard**: Centralized moderation tools
- **Automated Actions**: Bulk content management
- **User Management**: Ban, promote, and manage user accounts

## Testing the API

You can test the API using tools like:
- **Postman** - Import the API endpoints
- **curl** - Command line testing
- **Mobile App** - Direct integration testing

Example login request:
```bash
curl -X POST http://https://devoverflow-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

## Architecture Overview

This backend follows the **Monolithic Architecture** pattern, which is perfect for getting started:

- **Single Codebase** - All functionality in one application
- **Shared Database** - All models use the same MongoDB instance
- **Unified API** - Single entry point for all mobile app requests
- **Easy Deployment** - Simple deployment and scaling

The structure follows the **MVC Pattern**:
- **Models** (`/models`) - Data schemas and database interactions
- **Controllers** (`/controllers`) - Business logic and request handling
- **Routes** (`/routes`) - API endpoint definitions and middleware
- **Middleware** (`/middleware`) - Authentication and validation

## Configuration

Key environment variables to configure:

```env
# Database
MONGO_URI=mongodb://localhost:27017/mobile_app_db

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# AI
GEMINI_API_KEY=your_gemini_api_key

# Server
PORT=3000
NODE_ENV=development
```

## Deployment

This backend can be deployed to:
- **Heroku** - Easy deployment with MongoDB Atlas
- **AWS EC2** - Full control over the environment
- **DigitalOcean** - Simple cloud deployment
- **Vercel** - Serverless deployment option

## Documentation

The backend is fully documented with:
- **Inline Comments** - Detailed code documentation
- **API Comments** - Every endpoint documented
- **Error Handling** - Comprehensive error responses
- **Examples** - Real-world usage examples

## Contributing

This is a complete, production-ready backend. Key areas for potential enhancement:
- Real-time features (WebSocket integration)
- Caching layer (Redis)
- Email templates
- Push notifications
- Advanced AI features

## License

This project is provided as educational material for mobile app development.

---

**Built for Mobile App Development Course**
