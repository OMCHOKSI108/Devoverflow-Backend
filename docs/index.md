# DevOverflow Backend API Documentation

Welcome to the comprehensive API documentation for the DevOverflow backend, a Node.js-based REST API designed for a mobile Q&A application. This documentation provides detailed information about all available endpoints, authentication mechanisms, data models, and integration guidelines.

## Overview

DevOverflow is a question-and-answer platform built with modern web technologies, featuring AI-powered assistance, user management, content moderation, and real-time interactions. The backend is implemented using Node.js with Express.js framework and MongoDB for data persistence.

### Key Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Content Management**: Questions, answers, comments, and bookmarking functionality
- **AI Integration**: Google Gemini AI for content suggestions and improvements
- **Admin Panel**: Comprehensive administrative controls and analytics
- **File Upload**: Cloudinary integration for image and file uploads
- **Email Notifications**: Automated email verification and notifications

### Technology Stack

- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI Service**: Google Generative AI (Gemini)
- **File Storage**: Cloudinary
- **Email Service**: Gmail SMTP

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/OMCHOKSI108/Devoverflow-Backend.git
   cd Devoverflow-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   npm start
   ```

The API will be available at `http://localhost:3000`.

## API Structure

The API follows RESTful conventions with the following base structure:

```
http://localhost:3000/api/
├── auth/          # Authentication endpoints
├── users/         # User management
├── questions/     # Question operations
├── answers/       # Answer operations
├── comments/      # Comment operations
├── bookmarks/     # Bookmark operations
├── ai/           # AI-powered features
├── admin/        # Administrative functions
└── upload/       # File upload operations
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow a consistent JSON structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "error": null
}
```

## Error Handling

The API uses standard HTTP status codes and provides detailed error messages:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

API endpoints are protected with rate limiting to prevent abuse. Standard limits apply per user per hour.

## Support

For issues, questions, or contributions:

- **GitHub Issues**: [Report bugs or request features](https://github.com/OMCHOKSI108/Devoverflow-Backend/issues)
- **Email**: omchoksi108@gmail.com

---

*This documentation is automatically generated and maintained. Last updated: September 28, 2025*