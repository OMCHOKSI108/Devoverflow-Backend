# Groups API

The Groups API provides functionality for creating and managing user groups, allowing users to form communities around specific topics or interests. Groups can have questions, members with different roles, and support collaborative Q&A within the community.

## Base URL
```
/api/groups
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### Get All Groups
Retrieve a paginated list of all active groups with optional search functionality.

**Endpoint:** `GET /api/groups`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of groups per page (default: 20)
- `search` (optional): Search term for group name or description

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "memberCount": 25,
        "createdBy": {
          "id": "string",
          "name": "string"
        },
        "createdAt": "2024-01-15T10:30:00.000Z",
        "tags": ["javascript", "react", "web-development"]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalGroups": 100,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### Create Group
Create a new group. The creator automatically becomes an admin member.

**Endpoint:** `POST /api/groups`

**Request Body:**
```json
{
  "name": "string",           // Required, max 100 characters
  "description": "string",    // Required, max 500 characters
  "tags": ["array", "of", "tags"]  // Optional
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Group created successfully",
  "data": {
    "group": {
      "id": "string",
      "name": "string",
      "description": "string",
      "memberCount": 1,
      "createdBy": "string",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "tags": ["array", "of", "tags"]
    }
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Name and description are required"
}
```
```json
{
  "success": false,
  "message": "Group name already exists"
}
```

---

### Get Group Details
Get detailed information about a specific group including members and recent questions.

**Endpoint:** `GET /api/groups/:groupId`

**Parameters:**
- `groupId`: ID of the group

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "group": {
      "id": "string",
      "name": "string",
      "description": "string",
      "members": [
        {
          "id": "string",
          "name": "string",
          "role": "admin",
          "joinedAt": "2024-01-15T10:30:00.000Z"
        }
      ],
      "questions": [
        {
          "id": "string",
          "title": "string",
          "votes": 15,
          "answers": 3,
          "createdAt": "2024-01-15T10:30:00.000Z"
        }
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "tags": ["javascript", "react"]
    }
  }
}
```

**Response (Error - 403):**
```json
{
  "success": false,
  "message": "You must be a member of this group to view details"
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Group not found"
}
```

---

### Join Group
Join an existing group as a member.

**Endpoint:** `POST /api/groups/:groupId/join`

**Parameters:**
- `groupId`: ID of the group to join

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Joined group successfully"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Already a member of this group"
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Group not found"
}
```

---

### Leave Group
Leave a group. Admins cannot leave if they are the last admin.

**Endpoint:** `POST /api/groups/:groupId/leave`

**Parameters:**
- `groupId`: ID of the group to leave

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Left group successfully"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Not a member of this group"
}
```
```json
{
  "success": false,
  "message": "Cannot leave group as the last admin"
}
```

---

### Post Question in Group
Create a new question within a group.

**Endpoint:** `POST /api/groups/:groupId/questions`

**Parameters:**
- `groupId`: ID of the group

**Request Body:**
```json
{
  "title": "string",        // Required
  "body": "string",         // Required
  "tags": ["array", "of", "tags"]  // Optional
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Question posted in group successfully",
  "data": {
    "question": {
      "id": "string",
      "title": "string",
      "body": "string",
      "tags": ["array", "of", "tags"],
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Response (Error - 403):**
```json
{
  "success": false,
  "message": "You must be a member of this group to post questions"
}
```

---

### Get Group Questions
Retrieve paginated questions from a specific group.

**Endpoint:** `GET /api/groups/:groupId/questions`

**Parameters:**
- `groupId`: ID of the group

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of questions per page (default: 20)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "string",
        "title": "string",
        "body": "string",
        "author": {
          "id": "string",
          "name": "string",
          "reputation": 150
        },
        "tags": ["javascript", "react"],
        "votes": 15,
        "answers": 3,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalQuestions": 45,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Response (Error - 403):**
```json
{
  "success": false,
  "message": "You must be a member of this group to view questions"
}
```

---

## Data Models

### Group Object
```json
{
  "_id": "ObjectId",
  "name": "string",           // Max 100 characters
  "description": "string",    // Max 500 characters
  "createdBy": "ObjectId",    // Reference to User
  "members": [
    {
      "user": "ObjectId",     // Reference to User
      "role": "admin|member",
      "joinedAt": "Date"
    }
  ],
  "memberCount": "number",
  "isActive": "boolean",
  "tags": ["array", "of", "strings"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Group Member
```json
{
  "id": "string",
  "name": "string",
  "role": "admin|member",
  "joinedAt": "2024-01-15T10:30:00.000Z"
}
```

### Group Question
```json
{
  "id": "string",
  "title": "string",
  "body": "string",
  "author": {
    "id": "string",
    "name": "string",
    "reputation": 150
  },
  "tags": ["array", "of", "tags"],
  "votes": 15,
  "answers": 3,
  "createdAt": "2024-01-15T10:30:00.000Z"
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
- `201` - Created
- `400` - Bad Request (missing fields, already member, not member)
- `403` - Forbidden (not a member, last admin leaving)
- `404` - Group not found
- `500` - Server error

---

## Usage Examples

### Creating a Group
```javascript
const response = await fetch('/api/groups', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_jwt_token'
  },
  body: JSON.stringify({
    name: 'JavaScript Developers',
    description: 'A community for JavaScript enthusiasts',
    tags: ['javascript', 'programming', 'web-development']
  })
});

const result = await response.json();
console.log(result);
```

### Joining a Group
```javascript
const response = await fetch('/api/groups/60d5ecb74bbb4c001f8b4567/join', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  }
});

const result = await response.json();
console.log(result); // { success: true, message: "Joined group successfully" }
```

### Posting a Question in Group
```javascript
const response = await fetch('/api/groups/60d5ecb74bbb4c001f8b4567/questions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_jwt_token'
  },
  body: JSON.stringify({
    title: 'How to optimize React performance?',
    body: 'I\'m experiencing performance issues in my React app...',
    tags: ['react', 'performance', 'optimization']
  })
});

const result = await response.json();
console.log(result);
```

### Getting Group Questions
```javascript
const response = await fetch('/api/groups/60d5ecb74bbb4c001f8b4567/questions?page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  }
});

const data = await response.json();
console.log('Questions:', data.data.questions);
console.log('Pagination:', data.data.pagination);
```

---

## Notes

- All groups are public and can be discovered through search
- Group creators automatically become admins
- Admins cannot leave if they are the last admin in the group
- Only group members can view group details and questions
- Only group members can post questions within the group
- Groups support tagging for better discoverability
- Group questions are separate from general questions but follow the same structure</content>
<parameter name="filePath">d:\SEM 5\AIML308_Mobile Application Development\PRACTICALS\backend\docs\api\groups.md