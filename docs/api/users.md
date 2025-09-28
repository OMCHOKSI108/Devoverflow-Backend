# Users API

The Users API provides endpoints for user management, profiles, social features, and user discovery.

## Endpoints

### Get Leaderboard

Retrieve top users by reputation and activity.

**Endpoint:** `GET /api/users/leaderboard`

**Query Parameters:**
- `limit` (optional): Number of users to return (default: 10, max: 50)
- `period` (optional): Time period - "all", "month", "week", "day" (default: "all")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "reputation": 1250,
      "questionsCount": 45,
      "answersCount": 89,
      "location": "Mumbai, India"
    }
  ]
}
```

### Search Users

Search for users by name or username.

**Endpoint:** `GET /api/users/search`

**Query Parameters:**
- `q`: Search query (required)
- `limit` (optional): Number of results (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "username": "johndoe",
      "reputation": 1250,
      "location": "Mumbai, India"
    }
  ]
}
```

### Get Current User Profile

Retrieve authenticated user's profile information.

**Endpoint:** `GET /api/users/me`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "role": "user",
    "reputation": 1250,
    "location": "Mumbai, India",
    "bio": "Software developer",
    "website": "https://johndoe.dev",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "lastActive": "2025-09-28T14:30:00.000Z"
  }
}
```

### Update User Profile

Update authenticated user's profile information.

**Endpoint:** `PUT /api/users/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "location": "Delhi, India",
  "bio": "Full-stack developer",
  "website": "https://johnsmith.dev"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "user_id",
    "name": "John Smith",
    "location": "Delhi, India",
    "bio": "Full-stack developer",
    "website": "https://johnsmith.dev"
  }
}
```

### Get All Users

Retrieve list of all users (for friend search).

**Endpoint:** `GET /api/users`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search by name or username

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "user_id",
        "name": "John Doe",
        "username": "johndoe",
        "reputation": 1250,
        "location": "Mumbai, India"
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

### Get User Profile

Retrieve public profile information for a specific user.

**Endpoint:** `GET /api/users/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "username": "johndoe",
    "reputation": 1250,
    "location": "Mumbai, India",
    "bio": "Software developer",
    "website": "https://johndoe.dev",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "lastActive": "2025-09-28T14:30:00.000Z"
  }
}
```

### Get User Reputation

Retrieve detailed reputation information for a user.

**Endpoint:** `GET /api/users/:id/reputation`

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_id",
    "totalReputation": 1250,
    "questionsUpvotes": 450,
    "answersUpvotes": 800,
    "level": "Expert",
    "badges": ["Top Contributor", "Helpful Answer"]
  }
}
```

### Get User Summary

Retrieve summary statistics for a user.

**Endpoint:** `GET /api/users/:id/summary`

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_id",
    "questionsCount": 45,
    "answersCount": 89,
    "commentsCount": 156,
    "upvotesReceived": 1250,
    "upvotesGiven": 340,
    "followersCount": 67,
    "followingCount": 45
  }
}
```

### Get User Activity

Retrieve recent activity for a user.

**Endpoint:** `GET /api/users/:id/activity`

**Query Parameters:**
- `limit` (optional): Number of activities (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "question",
      "action": "asked",
      "title": "How to implement JWT authentication?",
      "createdAt": "2025-09-28T14:30:00.000Z",
      "points": 10
    },
    {
      "type": "answer",
      "action": "answered",
      "title": "How to implement JWT authentication?",
      "createdAt": "2025-09-28T14:25:00.000Z",
      "points": 15
    }
  ]
}
```

### Get User Following

Retrieve list of users that the specified user is following.

**Endpoint:** `GET /api/users/:id/following`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "following": [
      {
        "_id": "user_id",
        "name": "Jane Smith",
        "username": "janesmith",
        "reputation": 980
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

### Get User Followers

Retrieve list of users following the specified user.

**Endpoint:** `GET /api/users/:id/followers`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "followers": [
      {
        "_id": "user_id",
        "name": "Bob Johnson",
        "username": "bobjohnson",
        "reputation": 750
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 67,
      "pages": 4
    }
  }
}
```

### Follow User

Follow another user.

**Endpoint:** `POST /api/users/:id/follow`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User followed successfully"
}
```

### Unfollow User

Unfollow a user.

**Endpoint:** `DELETE /api/users/:id/follow`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User unfollowed successfully"
}
```

### Get Connection Status

Check relationship status with another user.

**Endpoint:** `GET /api/users/:id/connection-status`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isFollowing": true,
    "isFollowedBy": false,
    "isFriend": false
  }
}
```

### Get User Suggestions

Retrieve suggested users to follow.

**Endpoint:** `GET /api/users/suggestions`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (optional): Number of suggestions (default: 10, max: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "name": "Alice Wilson",
      "username": "alicewilson",
      "reputation": 1200,
      "commonTags": ["javascript", "react"],
      "reason": "Similar interests in web development"
    }
  ]
}
```

### Get Friends

Retrieve authenticated user's friends list.

**Endpoint:** `GET /api/users/friends`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "name": "Jane Smith",
      "username": "janesmith",
      "reputation": 980,
      "friendshipDate": "2025-06-15T10:00:00.000Z"
    }
  ]
}
```

### Add Friend

Send or accept friend request.

**Endpoint:** `POST /api/users/friends/:userId`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Friend request sent"
}
```

### Remove Friend

Remove user from friends list.

**Endpoint:** `DELETE /api/users/friends/:userId`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Friend removed successfully"
}
```

### Get User Notifications

Retrieve user notifications.

**Endpoint:** `GET /api/users/notifications`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `unreadOnly` (optional): Show only unread notifications (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "notification_id",
        "type": "answer_upvote",
        "title": "Your answer received an upvote",
        "message": "User liked your answer to 'How to implement JWT?'",
        "isRead": false,
        "createdAt": "2025-09-28T14:30:00.000Z",
        "relatedId": "answer_id"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    },
    "unreadCount": 12
  }
}
```

### Mark Notification as Read

Mark a specific notification as read.

**Endpoint:** `PUT /api/users/notifications/:id/read`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Mark All Notifications as Read

Mark all notifications as read.

**Endpoint:** `PUT /api/users/notifications/read-all`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### Get User Settings

Retrieve user settings and preferences.

**Endpoint:** `GET /api/users/settings`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "emailNotifications": true,
    "pushNotifications": false,
    "theme": "light",
    "language": "en",
    "privacy": {
      "showEmail": false,
      "showLocation": true,
      "allowMessages": true
    }
  }
}
```

### Update User Settings

Update user settings and preferences.

**Endpoint:** `PUT /api/users/settings`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "emailNotifications": false,
  "pushNotifications": true,
  "theme": "dark",
  "language": "en",
  "privacy": {
    "showEmail": false,
    "showLocation": true,
    "allowMessages": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "emailNotifications": false,
    "pushNotifications": true,
    "theme": "dark",
    "language": "en",
    "privacy": {
      "showEmail": false,
      "showLocation": true,
      "allowMessages": true
    }
  }
}
```