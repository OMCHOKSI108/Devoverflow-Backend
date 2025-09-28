# Friends API

The Friends API provides social networking functionality for users to connect with each other, manage friendships, and view friend-related information.

## Base URL
```
/api/friends
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## User Endpoints

### Add Friend
Send a friend request to another user.

**Endpoint:** `POST /api/friends/add`

**Request Body:**
```json
{
  "userId": "string" // ID of the user to add as friend
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Friend added successfully."
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Cannot add yourself as a friend."
}
```
```json
{
  "success": false,
  "message": "Already friends."
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "User not found."
}
```

---

### Remove Friend
Remove an existing friend connection.

**Endpoint:** `POST /api/friends/remove`

**Request Body:**
```json
{
  "userId": "string" // ID of the friend to remove
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Friend removed successfully."
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "User not found."
}
```

---

### Get User Profile
Get detailed user profile information including friends list.

**Endpoint:** `GET /api/friends/profile/:id?`

**Parameters:**
- `id` (optional): User ID to get profile for. If not provided, returns current user's profile.

**Response (Success - 200):**
```json
{
  "_id": "string",
  "username": "string",
  "name": "string",
  "email": "string",
  "reputation": 150,
  "profileImage": "string",
  "badges": ["array", "of", "badge", "ids"],
  "friends": [
    {
      "_id": "string",
      "username": "string",
      "name": "string",
      "reputation": 120
    }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Response (Error - 404):**
```json
{
  "message": "User not found."
}
```

---

## Admin Endpoints

### Get All Friendships
Retrieve all friendship connections in the system (Admin only).

**Endpoint:** `GET /api/friends/admin/all`

**Response (Success - 200):**
```json
[
  {
    "_id": "user1_id-user2_id",
    "user1": {
      "_id": "string",
      "username": "string",
      "email": "string"
    },
    "user2": {
      "_id": "string",
      "username": "string",
      "email": "string"
    },
    "status": "accepted",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "friendship": {
      "mutualQuestions": 5,
      "mutualAnswers": 12,
      "commonTags": ["javascript", "react"]
    }
  }
]
```

---

### Get Friendship Statistics
Get statistical information about friendships in the system (Admin only).

**Endpoint:** `GET /api/friends/admin/stats`

**Response (Success - 200):**
```json
{
  "totalFriendships": 45,
  "usersWithFriends": 32,
  "totalUsers": 100,
  "maxFriends": 15,
  "avgFriends": 2.8
}
```

---

### Remove Friendship (Admin)
Force remove a friendship connection between two users (Admin only).

**Endpoint:** `DELETE /api/friends/admin/remove`

**Request Body:**
```json
{
  "userId1": "string",
  "userId2": "string"
}
```

**Response (Success - 200):**
```json
{
  "message": "Friendship removed successfully by admin."
}
```

**Response (Error - 404):**
```json
{
  "message": "One or both users not found."
}
```

---

## Data Models

### Friend Object
```json
{
  "_id": "string",
  "username": "string",
  "name": "string",
  "email": "string",
  "reputation": 150,
  "profileImage": "string",
  "badges": ["array", "of", "badge", "ids"],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Friendship Statistics
```json
{
  "totalFriendships": "number",     // Total number of friendships (bidirectional)
  "usersWithFriends": "number",     // Number of users who have at least one friend
  "totalUsers": "number",           // Total number of users in the system
  "maxFriends": "number",           // Maximum number of friends any user has
  "avgFriends": "number"            // Average number of friends per user (with friends)
}
```

---

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid data, self-friend, already friends)
- `404` - User not found
- `500` - Server error

---

## Usage Examples

### Adding a Friend
```javascript
const response = await fetch('/api/friends/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_jwt_token'
  },
  body: JSON.stringify({
    userId: 'user_id_to_add'
  })
});

const result = await response.json();
console.log(result); // { success: true, message: "Friend added successfully." }
```

### Getting Friends List
```javascript
const response = await fetch('/api/friends/profile', {
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  }
});

const profile = await response.json();
console.log('Friends:', profile.friends);
console.log('Friend count:', profile.friends.length);
```

### Removing a Friend
```javascript
const response = await fetch('/api/friends/remove', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_jwt_token'
  },
  body: JSON.stringify({
    userId: 'friend_id_to_remove'
  })
});

const result = await response.json();
console.log(result); // { success: true, message: "Friend removed successfully." }
```

---

## Notes

- Friendships are bidirectional - when user A adds user B as a friend, user B will also see user A in their friends list
- Users cannot add themselves as friends
- Duplicate friend requests are prevented
- Admin endpoints require both authentication and admin privileges
- Friendship statistics include mutual activity data (questions, answers, common tags)</content>
<parameter name="filePath">d:\SEM 5\AIML308_Mobile Application Development\PRACTICALS\backend\docs\api\friends.md