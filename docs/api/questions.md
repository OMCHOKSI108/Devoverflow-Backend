# Questions API

The Questions API provides endpoints for managing questions, including creation, retrieval, updates, voting, and search functionality.

## Endpoints

### Get All Questions

Retrieve a paginated list of all questions.

**Endpoint:** `GET /api/questions`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `sort` (optional): Sort by - "newest", "oldest", "most-voted", "unanswered" (default: "newest")
- `tag` (optional): Filter by tag
- `status` (optional): Filter by status - "open", "closed", "answered"

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "_id": "question_id",
        "title": "How to implement JWT authentication in Node.js?",
        "content": "I need help implementing JWT authentication...",
        "tags": ["nodejs", "jwt", "authentication"],
        "author": {
          "_id": "user_id",
          "name": "John Doe",
          "reputation": 1250
        },
        "votes": 15,
        "answersCount": 3,
        "views": 245,
        "status": "open",
        "createdAt": "2025-09-28T10:00:00.000Z",
        "updatedAt": "2025-09-28T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### Search Questions

Search questions by title, content, or tags.

**Endpoint:** `GET /api/questions/search`

**Query Parameters:**
- `q`: Search query (required)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `tag` (optional): Filter by specific tag

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "_id": "question_id",
        "title": "How to implement JWT authentication in Node.js?",
        "content": "I need help implementing JWT authentication...",
        "tags": ["nodejs", "jwt", "authentication"],
        "author": {
          "_id": "user_id",
          "name": "John Doe"
        },
        "votes": 15,
        "answersCount": 3,
        "createdAt": "2025-09-28T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "pages": 2
    }
  }
}
```

### Get Question by ID

Retrieve detailed information about a specific question.

**Endpoint:** `GET /api/questions/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "question_id",
    "title": "How to implement JWT authentication in Node.js?",
    "content": "I need help implementing JWT authentication in my Express.js application. Can someone provide a complete example?",
    "tags": ["nodejs", "jwt", "authentication", "express"],
    "author": {
      "_id": "user_id",
      "name": "John Doe",
      "reputation": 1250,
      "location": "Mumbai, India"
    },
    "votes": 15,
    "userVote": 1,
    "answersCount": 3,
    "views": 245,
    "status": "open",
    "createdAt": "2025-09-28T10:00:00.000Z",
    "updatedAt": "2025-09-28T14:30:00.000Z"
  }
}
```

### Create Question

Create a new question.

**Endpoint:** `POST /api/questions`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "How to implement JWT authentication in Node.js?",
  "content": "I need help implementing JWT authentication in my Express.js application. Can someone provide a complete example?",
  "tags": ["nodejs", "jwt", "authentication"]
}
```

**Validation Rules:**
- Title: Required, 10-200 characters
- Content: Required, minimum 20 characters
- Tags: Required, 1-5 tags, each 2-20 characters

**Response:**
```json
{
  "success": true,
  "message": "Question created successfully",
  "data": {
    "_id": "question_id",
    "title": "How to implement JWT authentication in Node.js?",
    "content": "I need help implementing JWT authentication...",
    "tags": ["nodejs", "jwt", "authentication"],
    "author": "user_id",
    "votes": 0,
    "answersCount": 0,
    "views": 0,
    "status": "open",
    "createdAt": "2025-09-28T15:00:00.000Z"
  }
}
```

### Update Question

Update an existing question (author only).

**Endpoint:** `PUT /api/questions/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "Updated: How to implement JWT authentication in Node.js?",
  "content": "I need help implementing JWT authentication in my Express.js application. Can someone provide a complete example with middleware?",
  "tags": ["nodejs", "jwt", "authentication", "middleware"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Question updated successfully",
  "data": {
    "_id": "question_id",
    "title": "Updated: How to implement JWT authentication in Node.js?",
    "content": "I need help implementing JWT authentication...",
    "tags": ["nodejs", "jwt", "authentication", "middleware"],
    "updatedAt": "2025-09-28T15:30:00.000Z"
  }
}
```

### Delete Question

Delete a question (author or admin only).

**Endpoint:** `DELETE /api/questions/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Question deleted successfully"
}
```

### Vote on Question

Upvote or downvote a question.

**Endpoint:** `POST /api/questions/:id/vote`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "voteType": 1
}
```

**Vote Types:**
- `1`: Upvote
- `-1`: Downvote
- `0`: Remove vote

**Response:**
```json
{
  "success": true,
  "message": "Vote recorded successfully",
  "data": {
    "votes": 16,
    "userVote": 1
  }
}
```

### Get Questions by User

Retrieve all questions asked by a specific user.

**Endpoint:** `GET /api/questions/user/:userId`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "_id": "question_id",
        "title": "How to implement JWT authentication in Node.js?",
        "tags": ["nodejs", "jwt", "authentication"],
        "votes": 15,
        "answersCount": 3,
        "createdAt": "2025-09-28T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "pages": 1
    }
  }
}
```

### Create Answer for Question

Create an answer for a specific question.

**Endpoint:** `POST /api/questions/:questionId/answers`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "content": "You can implement JWT authentication using the jsonwebtoken package..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Answer created successfully",
  "data": {
    "_id": "answer_id",
    "content": "You can implement JWT authentication using the jsonwebtoken package...",
    "author": "user_id",
    "question": "question_id",
    "votes": 0,
    "createdAt": "2025-09-28T15:45:00.000Z"
  }
}
```