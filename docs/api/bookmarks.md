# Bookmarks API

The Bookmarks API provides functionality for users to save and manage external bookmarks and question bookmarks. The API supports both modern external bookmark management and legacy question bookmarking.

## External Bookmarks

External bookmarks allow users to save links to external resources with titles, excerpts, and tags.

### Get User Bookmarks

Retrieves a paginated list of the authenticated user's external bookmarks.

**Endpoint:** `GET /api/bookmarks`

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
    "success": true,
    "data": {
        "bookmarks": [
            {
                "_id": "bookmark_id",
                "user": "user_id",
                "title": "Bookmark Title",
                "excerpt": "Brief description of the content",
                "link": "https://example.com",
                "tags": ["tag1", "tag2"],
                "isPublic": false,
                "createdAt": "2024-01-01T00:00:00.000Z",
                "updatedAt": "2024-01-01T00:00:00.000Z"
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 5,
            "totalBookmarks": 50,
            "hasNextPage": true,
            "hasPrevPage": false
        }
    }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `500`: Server error

### Add External Bookmark

Creates a new external bookmark for the authenticated user.

**Endpoint:** `POST /api/bookmarks`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
    "title": "Bookmark Title",
    "excerpt": "Brief description of the content",
    "link": "https://example.com",
    "tags": ["tag1", "tag2"],
    "isPublic": false
}
```

**Required Fields:**
- `title`: Bookmark title (string, required)
- `excerpt`: Brief description (string, required)
- `link`: URL to bookmark (string, required)

**Optional Fields:**
- `tags`: Array of tag strings (default: [])
- `isPublic`: Whether bookmark is public (boolean, default: false)

**Response:**
```json
{
    "success": true,
    "message": "Bookmark added successfully",
    "data": {
        "bookmark": {
            "_id": "bookmark_id",
            "user": "user_id",
            "title": "Bookmark Title",
            "excerpt": "Brief description of the content",
            "link": "https://example.com",
            "tags": ["tag1", "tag2"],
            "isPublic": false,
            "createdAt": "2024-01-01T00:00:00.000Z",
            "updatedAt": "2024-01-01T00:00:00.000Z"
        }
    }
}
```

**Status Codes:**
- `201`: Bookmark created successfully
- `400`: Missing required fields
- `401`: Unauthorized
- `500`: Server error

### Remove External Bookmark

Deletes a specific external bookmark owned by the authenticated user.

**Endpoint:** `DELETE /api/bookmarks/:bookmarkId`

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `bookmarkId`: ID of the bookmark to delete

**Response:**
```json
{
    "success": true,
    "message": "Bookmark removed successfully"
}
```

**Status Codes:**
- `200`: Bookmark removed successfully
- `401`: Unauthorized
- `404`: Bookmark not found
- `500`: Server error

## Question Bookmarks (Legacy)

Question bookmarks allow users to save questions for later reference. These are stored directly in the user's profile.

### Add Question Bookmark

Adds a question to the authenticated user's bookmarks.

**Endpoint:** `POST /api/bookmarks/question/:questionId`

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `questionId`: ID of the question to bookmark

**Response:**
```json
{
    "success": true,
    "message": "Question bookmarked successfully",
    "data": {
        "questionId": "question_id",
        "totalBookmarks": 5
    }
}
```

**Status Codes:**
- `200`: Question bookmarked successfully
- `400`: Question already bookmarked
- `401`: Unauthorized
- `404`: Question not found
- `500`: Server error

### Remove Question Bookmark

Removes a question from the authenticated user's bookmarks.

**Endpoint:** `DELETE /api/bookmarks/question/:questionId`

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `questionId`: ID of the question to remove from bookmarks

**Response:**
```json
{
    "success": true,
    "message": "Bookmark removed successfully",
    "data": {
        "questionId": "question_id",
        "totalBookmarks": 4
    }
}
```

**Status Codes:**
- `200`: Bookmark removed successfully
- `400`: Question not in bookmarks
- `401`: Unauthorized
- `500`: Server error

### Check Question Bookmark Status

Checks if a specific question is bookmarked by the authenticated user.

**Endpoint:** `GET /api/bookmarks/check/:questionId`

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `questionId`: ID of the question to check

**Response:**
```json
{
    "success": true,
    "data": {
        "questionId": "question_id",
        "isBookmarked": true
    }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `500`: Server error

## Data Models

### Bookmark Model

```javascript
{
    _id: ObjectId,
    user: ObjectId (ref: 'User'),
    title: String (required),
    excerpt: String (required),
    link: String (required),
    tags: [String],
    isPublic: Boolean (default: false),
    createdAt: Date,
    updatedAt: Date
}
```

### User Bookmarks Array

Questions are stored in the user's bookmarks array:

```javascript
{
    // ... other user fields
    bookmarks: [ObjectId] // Array of question IDs
}
```

## Error Handling

All bookmark endpoints follow the standard error response format:

```json
{
    "success": false,
    "message": "Error description"
}
```

Common error scenarios:
- **401 Unauthorized**: Missing or invalid authentication token
- **404 Not Found**: Bookmark or question does not exist
- **400 Bad Request**: Invalid request data or question already bookmarked
- **500 Server Error**: Internal server error

## Rate Limiting

Bookmark operations are subject to rate limiting to prevent abuse. Users should implement appropriate retry logic with exponential backoff for failed requests.