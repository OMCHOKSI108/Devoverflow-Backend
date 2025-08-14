# API Documentation

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## Status Codes

- `200` - Success
- `201` - Created successfully
- `400` - Bad request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Internal server error

## Sample API Calls

### 1. User Registration
```javascript
POST /api/auth/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. User Login
```javascript
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Create Question
```javascript
POST /api/questions
Authorization: Bearer <token>
{
  "title": "How to use React hooks?",
  "body": "I'm learning React and want to understand how hooks work...",
  "tags": ["react", "javascript", "hooks"]
}
```

### 4. Get Questions with Pagination
```javascript
GET /api/questions?page=1&limit=10&sortBy=votes&order=desc&tags=react,javascript
```

### 5. Vote on Question
```javascript
POST /api/questions/60d5ecb54c2d5d4f8c8b4567/vote
Authorization: Bearer <token>
{
  "voteType": "up"
}
```

### 6. AI Answer Suggestion
```javascript
POST /api/ai/answer-suggestion
Authorization: Bearer <token>
{
  "questionTitle": "How to use React hooks?",
  "questionBody": "I'm learning React and want to understand...",
  "tags": ["react", "javascript"]
}
```

### 7. Add Bookmark
```javascript
POST /api/bookmarks/60d5ecb54c2d5d4f8c8b4567
Authorization: Bearer <token>
```

### 8. Create Report
```javascript
POST /api/admin/reports
Authorization: Bearer <token>
{
  "contentId": "60d5ecb54c2d5d4f8c8b4567",
  "contentType": "question",
  "reason": "Spam content"
}
```

## Pagination

Most list endpoints support pagination:

```javascript
GET /api/questions?page=1&limit=10
```

Response includes pagination info:
```json
{
  "success": true,
  "data": {
    "questions": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalQuestions": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## Search and Filtering

### Search Questions
```javascript
GET /api/questions/search?q=react hooks&tags=react,javascript&page=1&limit=10
```

### Filter by Tags
```javascript
GET /api/questions?tags=react,javascript,frontend
```

### Sort Options
```javascript
GET /api/questions?sortBy=votes&order=desc
GET /api/questions?sortBy=createdAt&order=asc
GET /api/questions?sortBy=answers&order=desc
```

## File Upload

```javascript
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form data:
- file: [selected file]
```

Response:
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "filePath": "/uploads/file-1634567890123.jpg"
  }
}
```

## Error Examples

### Validation Error
```json
{
  "success": false,
  "message": "Please provide title and body for the question"
}
```

### Authorization Error
```json
{
  "success": false,
  "message": "Not authorized, no token provided"
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Question not found"
}
```

## Rate Limiting

Currently no rate limiting is implemented, but in production you should add:
- Login attempts: 5 per minute
- Questions: 10 per hour per user
- Answers: 20 per hour per user
- Comments: 30 per hour per user

## Mobile App Integration Tips

1. **Store JWT Token**: Save the token from login response for subsequent requests
2. **Handle Token Expiry**: Refresh or redirect to login when you get 401 errors
3. **Pagination**: Implement infinite scroll using the pagination endpoints
4. **Offline Support**: Cache important data for offline viewing
5. **Error Handling**: Show user-friendly messages based on error responses
6. **Loading States**: Use the async nature of API calls for loading indicators
