# Comments API

The Comments API provides endpoints for managing comments on questions and answers, enabling discussion and clarification.

## Endpoints

### Get Comments for Question

Retrieve all comments for a specific question.

**Endpoint:** `GET /api/comments/question/:questionId`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "_id": "comment_id",
        "content": "Can you provide more details about your current implementation?",
        "author": {
          "_id": "user_id",
          "name": "Alice Johnson",
          "reputation": 450
        },
        "question": "question_id",
        "votes": 3,
        "createdAt": "2025-09-28T12:00:00.000Z",
        "updatedAt": "2025-09-28T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8,
      "pages": 1
    }
  }
}
```

### Get Comments for Answer

Retrieve all comments for a specific answer.

**Endpoint:** `GET /api/comments/answer/:answerId`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "_id": "comment_id",
        "content": "This solution worked perfectly for me!",
        "author": {
          "_id": "user_id",
          "name": "Bob Wilson",
          "reputation": 320
        },
        "answer": "answer_id",
        "votes": 5,
        "createdAt": "2025-09-28T13:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "pages": 1
    }
  }
}
```

### Add Comment to Question

Add a comment to a specific question.

**Endpoint:** `POST /api/comments/question/:questionId`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "content": "Can you provide more details about your current implementation?"
}
```

**Validation Rules:**
- Content: Required, 5-500 characters

**Response:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "_id": "comment_id",
    "content": "Can you provide more details about your current implementation?",
    "author": "user_id",
    "question": "question_id",
    "votes": 0,
    "createdAt": "2025-09-28T15:00:00.000Z"
  }
}
```

### Add Comment to Answer

Add a comment to a specific answer.

**Endpoint:** `POST /api/comments/answer/:answerId`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "content": "This solution worked perfectly for me!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "_id": "comment_id",
    "content": "This solution worked perfectly for me!",
    "author": "user_id",
    "answer": "answer_id",
    "votes": 0,
    "createdAt": "2025-09-28T15:15:00.000Z"
  }
}
```

### Update Comment

Update an existing comment (author only).

**Endpoint:** `PUT /api/comments/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "content": "Updated comment with additional clarification."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment updated successfully",
  "data": {
    "_id": "comment_id",
    "content": "Updated comment with additional clarification.",
    "updatedAt": "2025-09-28T15:30:00.000Z"
  }
}
```

### Delete Comment

Delete a comment (author or admin only).

**Endpoint:** `DELETE /api/comments/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```