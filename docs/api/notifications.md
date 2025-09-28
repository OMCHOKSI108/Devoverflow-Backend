# Notifications API

The Notifications API provides functionality for managing user notifications, including retrieving notifications, marking them as read, and managing notification preferences.

## Base URL
```
/api/notifications
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### Get Notifications
Retrieve paginated list of user notifications with optional filtering.

**Endpoint:** `GET /api/notifications`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of notifications per page (default: 20)
- `unread` (optional): Filter for unread notifications only - 'true' or 'false' (default: 'false')

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "string",
        "type": "answer_upvote",
        "title": "Your answer was upvoted",
        "message": "John Doe upvoted your answer to 'How to optimize React performance?'",
        "isRead": false,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "sender": {
          "id": "string",
          "name": "John Doe"
        },
        "data": {
          "questionId": "string",
          "answerId": "string",
          "url": "/questions/123/answer/456"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalNotifications": 100,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "unreadCount": 15
  }
}
```

---

### Mark Notification as Read
Mark a specific notification as read.

**Endpoint:** `PUT /api/notifications/:id/read`

**Parameters:**
- `id`: Notification ID

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "notification": {
    "id": "string",
    "isRead": true
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Notification not found"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Notification is already read"
}
```

---

### Mark All Notifications as Read
Mark all unread notifications as read for the current user.

**Endpoint:** `PUT /api/notifications/read-all`

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "15 notifications marked as read"
}
```

---

### Delete Notification
Delete a specific notification.

**Endpoint:** `DELETE /api/notifications/:id`

**Parameters:**
- `id`: Notification ID

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Notification not found"
}
```

---

## Notification Types

The system supports the following notification types:

| Type | Description | Example Trigger |
|------|-------------|----------------|
| `follow` | User followed you | When another user adds you as a friend |
| `question_upvote` | Question upvoted | When someone upvotes your question |
| `question_downvote` | Question downvoted | When someone downvotes your question |
| `answer_upvote` | Answer upvoted | When someone upvotes your answer |
| `answer_downvote` | Answer downvoted | When someone downvotes your answer |
| `answer_accepted` | Answer accepted | When question author accepts your answer |
| `new_answer` | New answer on followed question | When someone answers a question you asked |
| `new_comment` | New comment | When someone comments on your post |
| `mention` | User mentioned you | When someone @mentions you |
| `badge_earned` | Badge earned | When you earn a new badge |
| `reputation_milestone` | Reputation milestone | When you reach reputation milestones |

---

## Data Models

### Notification Object
```json
{
  "_id": "ObjectId",
  "recipient": "ObjectId",    // Reference to User (recipient)
  "sender": "ObjectId",       // Reference to User (sender)
  "type": "string",           // Notification type (enum)
  "title": "string",          // Short notification title
  "message": "string",        // Detailed notification message
  "isRead": "boolean",        // Read status
  "data": {                   // Additional context data
    "questionId": "ObjectId", // Related question
    "answerId": "ObjectId",   // Related answer
    "commentId": "ObjectId",  // Related comment
    "badge": "string",        // Badge earned
    "reputationChange": "number", // Reputation change amount
    "url": "string"           // Link to related content
  },
  "readAt": "Date",           // When notification was read
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Notification Response
```json
{
  "id": "string",
  "type": "string",
  "title": "string",
  "message": "string",
  "isRead": "boolean",
  "createdAt": "Date",
  "sender": {
    "id": "string",
    "name": "string"
  },
  "data": "object"            // Additional context data
}
```

### Pagination Info
```json
{
  "currentPage": "number",
  "totalPages": "number",
  "totalNotifications": "number",
  "hasNextPage": "boolean",
  "hasPrevPage": "boolean"
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
- `400` - Bad Request (already read, invalid data)
- `404` - Notification not found
- `500` - Server error

---

## Usage Examples

### Getting Notifications
```javascript
// Get all notifications
const response = await fetch('/api/notifications', {
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  }
});

// Get only unread notifications
const unreadResponse = await fetch('/api/notifications?unread=true', {
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  }
});

const data = await response.json();
console.log('Notifications:', data.data.notifications);
console.log('Unread count:', data.data.unreadCount);
```

### Marking Notification as Read
```javascript
const response = await fetch('/api/notifications/60d5ecb74bbb4c001f8b4567/read', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  }
});

const result = await response.json();
console.log(result); // { success: true, message: "Notification marked as read" }
```

### Marking All Notifications as Read
```javascript
const response = await fetch('/api/notifications/read-all', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  }
});

const result = await response.json();
console.log(result); // { success: true, message: "15 notifications marked as read" }
```

### Deleting a Notification
```javascript
const response = await fetch('/api/notifications/60d5ecb74bbb4c001f8b4567', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  }
});

const result = await response.json();
console.log(result); // { success: true, message: "Notification deleted successfully" }
```

### Real-time Notification Updates (WebSocket)
```javascript
// Connect to WebSocket for real-time notifications
const ws = new WebSocket('ws://your-server/notifications');

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('New notification:', notification);

  // Update UI to show new notification
  showNotification(notification);
};
```

---

## Notes

- Notifications are automatically created by the system when relevant events occur
- Users can only access their own notifications
- Notifications include contextual data to help users navigate to relevant content
- The `unreadCount` is provided with every notification request for UI badge updates
- Notifications can be filtered to show only unread items
- Deleting a notification permanently removes it from the user's notification history
- The system supports various notification types for different user interactions</content>
<parameter name="filePath">d:\SEM 5\AIML308_Mobile Application Development\PRACTICALS\backend\docs\api\notifications.md