# Answers API

The Answers API provides endpoints for managing answers to questions, including creation, updates, voting, and acceptance.

## Endpoints

### Get Answers by Question

Retrieve all answers for a specific question.

**Endpoint:** `GET /api/answers/question/:questionId`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `sort` (optional): Sort by - "newest", "oldest", "most-voted" (default: "most-voted")

**Response:**
```json
{
  "success": true,
  "data": {
    "answers": [
      {
        "_id": "answer_id",
        "content": "You can implement JWT authentication using the jsonwebtoken package...",
        "author": {
          "_id": "user_id",
          "name": "Jane Smith",
          "reputation": 980
        },
        "question": "question_id",
        "votes": 25,
        "isAccepted": true,
        "createdAt": "2025-09-28T11:00:00.000Z",
        "updatedAt": "2025-09-28T11:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

### Get Answers by User

Retrieve all answers provided by a specific user.

**Endpoint:** `GET /api/answers/user/:userId`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "answers": [
      {
        "_id": "answer_id",
        "content": "You can implement JWT authentication...",
        "question": {
          "_id": "question_id",
          "title": "How to implement JWT authentication in Node.js?"
        },
        "votes": 25,
        "isAccepted": true,
        "createdAt": "2025-09-28T11:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

### Update Answer

Update an existing answer (author only).

**Endpoint:** `PUT /api/answers/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "content": "Updated answer content with additional details..."
}
```

**Validation Rules:**
- Content: Required, minimum 10 characters

**Response:**
```json
{
  "success": true,
  "message": "Answer updated successfully",
  "data": {
    "_id": "answer_id",
    "content": "Updated answer content with additional details...",
    "updatedAt": "2025-09-28T16:00:00.000Z"
  }
}
```

### Delete Answer

Delete an answer (author or admin only).

**Endpoint:** `DELETE /api/answers/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Answer deleted successfully"
}
```

### Vote on Answer

Upvote or downvote an answer.

**Endpoint:** `POST /api/answers/:id/vote`

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
    "votes": 26,
    "userVote": 1
  }
}
```

### Accept Answer

Mark an answer as accepted (question author only).

**Endpoint:** `POST /api/answers/:id/accept`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "accepted": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Answer accepted successfully",
  "data": {
    "isAccepted": true
  }
}
```

**Notes:**
- Only the question author can accept answers
- Only one answer can be accepted per question
- Accepting an answer gives reputation bonus to the answer author