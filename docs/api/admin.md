# Admin API

The Admin API provides comprehensive administrative functionality for managing the DevOverflow platform. This includes user management, content moderation, reporting systems, and detailed analytics. All admin endpoints require authentication and admin privileges.

## Authentication

All admin endpoints require:
- **Authentication:** Bearer token required
- **Authorization:** Admin privileges required (`isAdmin: true`)

## Reporting System

### Create Report

Allows authenticated users to report inappropriate content (questions or answers).

**Endpoint:** `POST /api/admin/reports`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
    "contentId": "question_or_answer_id",
    "contentType": "question",
    "reason": "Inappropriate content or spam"
}
```

**Required Fields:**
- `contentId`: ID of the content being reported (string, required)
- `contentType`: Type of content - "question" or "answer" (string, required)
- `reason`: Reason for the report (string, required)

**Response:**
```json
{
    "success": true,
    "message": "Report submitted successfully",
    "data": {
        "report": {
            "_id": "report_id",
            "reporter": {
                "username": "reporter_username",
                "_id": "reporter_id"
            },
            "contentId": "content_id",
            "contentType": "question",
            "reason": "Inappropriate content",
            "status": "pending",
            "createdAt": "2024-01-01T00:00:00.000Z"
        }
    }
}
```

**Status Codes:**
- `201`: Report created successfully
- `400`: Missing required fields or already reported
- `401`: Unauthorized
- `404`: Content not found
- `500`: Server error

### Get Reports

Retrieves paginated list of all reports for admin review.

**Endpoint:** `GET /api/admin/reports`

**Authentication:** Required (Bearer token + Admin)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status - "pending" or "resolved"
- `contentType` (optional): Filter by content type - "question" or "answer"

**Response:**
```json
{
    "success": true,
    "data": {
        "reports": [
            {
                "_id": "report_id",
                "reporter": {
                    "username": "reporter_username",
                    "email": "reporter@example.com"
                },
                "contentId": {
                    "_id": "question_id",
                    "title": "Question Title",
                    "user": {
                        "username": "content_author",
                        "email": "author@example.com"
                    }
                },
                "contentType": "question",
                "reason": "Inappropriate content",
                "status": "pending",
                "createdAt": "2024-01-01T00:00:00.000Z"
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 5,
            "totalReports": 100,
            "hasNextPage": true,
            "hasPrevPage": false
        }
    }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `403`: Admin access required
- `500`: Server error

### Resolve Report

Allows admins to resolve reports by either dismissing them or deleting the reported content.

**Endpoint:** `PUT /api/admin/reports/:id/resolve`

**Authentication:** Required (Bearer token + Admin)

**URL Parameters:**
- `id`: Report ID to resolve

**Request Body:**
```json
{
    "action": "dismiss"
}
```

**Actions:**
- `dismiss`: Mark report as resolved without taking action
- `delete`: Delete the reported content and mark report as resolved

**Response:**
```json
{
    "success": true,
    "message": "Report resolved",
    "data": {
        "report": {
            "_id": "report_id",
            "status": "resolved",
            "updatedAt": "2024-01-01T00:00:00.000Z"
        }
    }
}
```

**Status Codes:**
- `200`: Report resolved successfully
- `401`: Unauthorized
- `403`: Admin access required
- `404`: Report not found
- `500`: Server error

## Content Management

### Delete Content

Allows admins to delete any content (questions, answers, or comments) directly.

**Endpoint:** `DELETE /api/admin/content/:type/:id`

**Authentication:** Required (Bearer token + Admin)

**URL Parameters:**
- `type`: Content type - "question", "answer", or "comment"
- `id`: Content ID to delete

**Response:**
```json
{
    "success": true,
    "message": "question deleted successfully",
    "data": {
        "deletedId": "content_id"
    }
}
```

**Status Codes:**
- `200`: Content deleted successfully
- `401`: Unauthorized
- `403`: Admin access required
- `404`: Content not found
- `500`: Server error

### Get All Questions

Retrieves paginated list of all questions for admin management.

**Endpoint:** `GET /api/admin/questions`

**Authentication:** Required (Bearer token + Admin)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search in title and content
- `status` (optional): Filter by status
- `sortBy` (optional): Sort field (default: "createdAt")
- `order` (optional): Sort order - "asc" or "desc" (default: "desc")

**Response:**
```json
{
    "success": true,
    "data": {
        "questions": [
            {
                "_id": "question_id",
                "title": "Question Title",
                "content": "Question content...",
                "user": {
                    "username": "author_username",
                    "email": "author@example.com",
                    "isAdmin": false
                },
                "tags": ["javascript", "react"],
                "votes": { "upvotes": 10, "downvotes": 2 },
                "answers": ["answer_id_1", "answer_id_2"],
                "status": "open",
                "createdAt": "2024-01-01T00:00:00.000Z"
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 10,
            "totalQuestions": 200,
            "hasNextPage": true,
            "hasPrevPage": false
        }
    }
}
```

### Edit Question

Allows admins to edit any question's content.

**Endpoint:** `PUT /api/admin/questions/:id`

**Authentication:** Required (Bearer token + Admin)

**URL Parameters:**
- `id`: Question ID to edit

**Request Body:**
```json
{
    "title": "Updated Question Title",
    "content": "Updated question content...",
    "tags": ["javascript", "nodejs"],
    "status": "open"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Question updated successfully",
    "data": {
        "_id": "question_id",
        "title": "Updated Question Title",
        "content": "Updated question content...",
        "tags": ["javascript", "nodejs"],
        "status": "open",
        "updatedAt": "2024-01-01T00:00:00.000Z"
    }
}
```

### Get All Answers

Retrieves paginated list of all answers for admin management.

**Endpoint:** `GET /api/admin/answers`

**Authentication:** Required (Bearer token + Admin)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search in content
- `sortBy` (optional): Sort field (default: "createdAt")
- `order` (optional): Sort order - "asc" or "desc" (default: "desc")

**Response:**
```json
{
    "success": true,
    "data": {
        "answers": [
            {
                "_id": "answer_id",
                "content": "Answer content...",
                "user": {
                    "username": "author_username",
                    "email": "author@example.com",
                    "isAdmin": false
                },
                "question": {
                    "title": "Question Title",
                    "_id": "question_id"
                },
                "votes": { "upvotes": 5, "downvotes": 1 },
                "isAccepted": false,
                "createdAt": "2024-01-01T00:00:00.000Z"
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 15,
            "totalAnswers": 300,
            "hasNextPage": true,
            "hasPrevPage": false
        }
    }
}
```

### Edit Answer

Allows admins to edit any answer's content or acceptance status.

**Endpoint:** `PUT /api/admin/answers/:id`

**Authentication:** Required (Bearer token + Admin)

**URL Parameters:**
- `id`: Answer ID to edit

**Request Body:**
```json
{
    "content": "Updated answer content...",
    "isAccepted": true
}
```

**Response:**
```json
{
    "success": true,
    "message": "Answer updated successfully",
    "data": {
        "_id": "answer_id",
        "content": "Updated answer content...",
        "isAccepted": true,
        "updatedAt": "2024-01-01T00:00:00.000Z"
    }
}
```

### Get All Comments

Retrieves paginated list of all comments for admin management.

**Endpoint:** `GET /api/admin/comments`

**Authentication:** Required (Bearer token + Admin)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search in content
- `sortBy` (optional): Sort field (default: "createdAt")
- `order` (optional): Sort order - "asc" or "desc" (default: "desc")

**Response:**
```json
{
    "success": true,
    "data": {
        "comments": [
            {
                "_id": "comment_id",
                "content": "Comment content...",
                "user": {
                    "username": "author_username",
                    "email": "author@example.com",
                    "isAdmin": false
                },
                "contentType": "question",
                "contentId": "question_id",
                "isAdminComment": false,
                "createdAt": "2024-01-01T00:00:00.000Z"
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 8,
            "totalComments": 160,
            "hasNextPage": true,
            "hasPrevPage": false
        }
    }
}
```

### Add Comment

Allows admins to add comments to any content.

**Endpoint:** `POST /api/admin/comments`

**Authentication:** Required (Bearer token + Admin)

**Request Body:**
```json
{
    "content": "Admin comment content...",
    "contentType": "question",
    "contentId": "question_id"
}
```

**Required Fields:**
- `content`: Comment content (string, required)
- `contentType`: Type of content - "question" or "answer" (string, required)
- `contentId`: ID of the content to comment on (string, required)

**Response:**
```json
{
    "success": true,
    "message": "Comment added successfully",
    "data": {
        "_id": "comment_id",
        "content": "Admin comment content...",
        "user": {
            "username": "admin_username",
            "email": "admin@example.com",
            "isAdmin": true
        },
        "contentType": "question",
        "contentId": "question_id",
        "isAdminComment": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
    }
}
```

### Edit Comment

Allows admins to edit any comment.

**Endpoint:** `PUT /api/admin/comments/:id`

**Authentication:** Required (Bearer token + Admin)

**URL Parameters:**
- `id`: Comment ID to edit

**Request Body:**
```json
{
    "content": "Updated comment content..."
}
```

**Response:**
```json
{
    "success": true,
    "message": "Comment updated successfully",
    "data": {
        "_id": "comment_id",
        "content": "Updated comment content...",
        "updatedAt": "2024-01-01T00:00:00.000Z"
    }
}
```

### Delete Comment

Allows admins to delete any comment.

**Endpoint:** `DELETE /api/admin/comments/:id`

**Authentication:** Required (Bearer token + Admin)

**URL Parameters:**
- `id`: Comment ID to delete

**Response:**
```json
{
    "success": true,
    "message": "Comment deleted successfully"
}
```

## User Management

### Get All Users

Retrieves paginated list of all users with detailed statistics.

**Endpoint:** `GET /api/admin/users`

**Authentication:** Required (Bearer token + Admin)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by username, email, or name
- `role` (optional): Filter by role - "admin", "user", or "all" (default: "all")
- `status` (optional): Filter by status - "active", "inactive", or "all" (default: "all")
- `sortBy` (optional): Sort field (default: "createdAt")
- `order` (optional): Sort order - "asc" or "desc" (default: "desc")

**Response:**
```json
{
    "success": true,
    "data": {
        "users": [
            {
                "_id": "user_id",
                "username": "john_doe",
                "email": "john@example.com",
                "profile": {
                    "fullName": "John Doe",
                    "bio": "Software developer",
                    "location": "New York",
                    "website": "https://johndoe.com"
                },
                "reputation": 150,
                "isVerified": true,
                "isAdmin": false,
                "createdAt": "2024-01-01T00:00:00.000Z",
                "stats": {
                    "questionsAsked": 25,
                    "answersGiven": 45,
                    "acceptedAnswers": 12,
                    "reputation": 150,
                    "badges": ["helpful", "expert"],
                    "joinedDate": "2024-01-01T00:00:00.000Z"
                }
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 20,
            "totalUsers": 200,
            "hasNextPage": true,
            "hasPrevPage": false,
            "limit": 10
        },
        "filters": {
            "search": "",
            "role": "all",
            "status": "all",
            "sortBy": "createdAt",
            "order": "desc"
        }
    }
}
```

### Manage User

Allows admins to perform various management actions on users.

**Endpoint:** `PUT /api/admin/users/:id`

**Authentication:** Required (Bearer token + Admin)

**URL Parameters:**
- `id`: User ID to manage

**Request Body:**
```json
{
    "action": "promote",
    "data": {}
}
```

**Available Actions:**
- `promote`: Grant admin privileges
- `demote`: Remove admin privileges
- `verify`: Mark user as verified
- `unverify`: Remove verification status
- `ban`: Ban user (sets reputation to 0, removes verification)
- `unban`: Unban user (restores reputation to 10)
- `suspend`: Suspend user account
- `unsuspend`: Unsuspend user account
- `reset_password`: Initiate password reset

**Response:**
```json
{
    "success": true,
    "message": "User promoted to admin successfully",
    "data": {
        "user": {
            "_id": "user_id",
            "username": "john_doe",
            "isAdmin": true,
            "updatedAt": "2024-01-01T00:00:00.000Z"
        }
    }
}
```

### Update User Details

Allows admins to update any user's profile information.

**Endpoint:** `PUT /api/admin/users/:id/details`

**Authentication:** Required (Bearer token + Admin)

**URL Parameters:**
- `id`: User ID to update

**Request Body:**
```json
{
    "username": "new_username",
    "email": "newemail@example.com",
    "fullName": "New Full Name",
    "bio": "Updated bio",
    "location": "New Location",
    "website": "https://newwebsite.com",
    "reputation": 200,
    "isVerified": true,
    "isAdmin": false
}
```

**Response:**
```json
{
    "success": true,
    "message": "User details updated successfully",
    "data": {
        "user": {
            "_id": "user_id",
            "username": "new_username",
            "email": "newemail@example.com",
            "profile": {
                "fullName": "New Full Name",
                "bio": "Updated bio",
                "location": "New Location",
                "website": "https://newwebsite.com"
            },
            "reputation": 200,
            "isVerified": true,
            "isAdmin": false
        }
    }
}
```

### Delete User

Permanently deletes a user and all their associated content.

**Endpoint:** `DELETE /api/admin/users/:id`

**Authentication:** Required (Bearer token + Admin)

**URL Parameters:**
- `id`: User ID to delete

**Response:**
```json
{
    "success": true,
    "message": "User and all associated content deleted successfully"
}
```

**Note:** Admins cannot delete their own accounts.

## Analytics & Statistics

### Get Admin Statistics

Retrieves comprehensive dashboard statistics for admin overview.

**Endpoint:** `GET /api/admin/stats`

**Authentication:** Required (Bearer token + Admin)

**Response:**
```json
{
    "success": true,
    "message": "Admin dashboard statistics retrieved successfully",
    "data": {
        "totals": {
            "users": 1000,
            "questions": 2500,
            "answers": 5000,
            "comments": 1200,
            "reports": 150
        },
        "userStats": {
            "total": 1000,
            "verified": 750,
            "unverified": 250,
            "admins": 5,
            "regular": 995,
            "verificationRate": 75
        },
        "contentStats": {
            "questions": {
                "total": 2500,
                "answered": 2000,
                "unanswered": 500,
                "answerRate": 80
            },
            "answers": {
                "total": 5000,
                "accepted": 800,
                "unaccepted": 4200,
                "acceptanceRate": 16
            },
            "comments": 1200
        },
        "reports": {
            "total": 150,
            "pending": 25,
            "resolved": 125,
            "resolutionRate": 83
        },
        "activity": {
            "today": {
                "users": 10,
                "questions": 25,
                "answers": 50,
                "comments": 15,
                "total": 100
            },
            "yesterday": {
                "users": 8,
                "questions": 20,
                "answers": 45,
                "total": 73
            },
            "thisWeek": {
                "users": 65,
                "questions": 150,
                "answers": 300,
                "comments": 80,
                "total": 595
            },
            "thisMonth": {
                "users": 250,
                "questions": 600,
                "answers": 1200,
                "total": 2050
            }
        },
        "growth": {
            "users": {
                "today": 10,
                "yesterday": 8,
                "growthRate": 25,
                "trend": "up"
            },
            "questions": {
                "today": 25,
                "yesterday": 20,
                "growthRate": 25,
                "trend": "up"
            },
            "answers": {
                "today": 50,
                "yesterday": 45,
                "growthRate": 11,
                "trend": "up"
            }
        },
        "topPerformers": {
            "usersByReputation": [...],
            "questionsByVotes": [...],
            "answersByVotes": [...],
            "mostActiveUsers": [...]
        },
        "insights": {
            "popularTags": [
                { "tag": "javascript", "count": 450 },
                { "tag": "python", "count": 380 }
            ],
            "engagementMetrics": {
                "averageAnswersPerQuestion": 2.0,
                "answerAcceptanceRate": 16,
                "userVerificationRate": 75
            }
        },
        "recentActivity": {
            "users": [...],
            "questions": [...],
            "answers": [...]
        },
        "systemHealth": {
            "totalContentItems": 8700,
            "contentEngagement": 2.0,
            "userEngagement": 75,
            "moderationLoad": 25,
            "platformActivity": 100,
            "healthScore": 85
        },
        "metadata": {
            "generatedAt": "2024-01-01T12:00:00.000Z",
            "dataRange": {
                "today": "2024-01-01T00:00:00.000Z",
                "weekAgo": "2023-12-25T00:00:00.000Z",
                "monthAgo": "2023-12-01T00:00:00.000Z"
            }
        }
    }
}
```

## Error Handling

All admin endpoints follow the standard error response format:

```json
{
    "success": false,
    "message": "Error description"
}
```

Common error scenarios:
- **400 Bad Request**: Invalid request data or action
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Admin privileges required
- **404 Not Found**: Resource not found
- **500 Server Error**: Internal server error

## Rate Limiting

Admin endpoints are subject to rate limiting to prevent abuse. Admins should implement appropriate retry logic with exponential backoff for failed requests.

## Security Notes

- All admin endpoints require both authentication and admin privileges
- Self-modification restrictions prevent admins from demoting or deleting themselves
- Content deletion cascades to remove associated comments and answers
- User deletion removes all associated content and cleans up references
- All actions are logged for audit purposes