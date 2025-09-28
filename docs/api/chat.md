# Chat API

The Chat API provides real-time conversational AI capabilities, allowing users to have interactive chat sessions with AI assistants. The system maintains conversation history and context across multiple messages within each session.

## Chat Sessions

### Get Chat Sessions

Retrieves a paginated list of the authenticated user's active chat sessions.

**Endpoint:** `GET /api/chat/sessions`

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
    "success": true,
    "data": {
        "sessions": [
            {
                "_id": "session_id",
                "title": "React Hooks Discussion",
                "lastMessage": "React hooks are functions that let you use state and other React features...",
                "messageCount": 12,
                "createdAt": "2024-01-01T00:00:00.000Z",
                "updatedAt": "2024-01-01T00:00:00.000Z"
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 3,
            "totalSessions": 25,
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

### Create Chat Session

Creates a new chat session with an optional initial message.

**Endpoint:** `POST /api/chat/sessions`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
    "title": "JavaScript Best Practices",
    "initialMessage": "Can you explain JavaScript closures?"
}
```

**Required Fields:**
- `title`: Session title (string, required)

**Optional Fields:**
- `initialMessage`: First message to send (string, optional)

**Response:**
```json
{
    "success": true,
    "data": {
        "session": {
            "id": "session_id",
            "title": "JavaScript Best Practices",
            "lastMessage": "JavaScript closures are functions that have access to variables from their outer scope...",
            "messageCount": 2,
            "createdAt": "2024-01-01T00:00:00.000Z"
        },
        "messages": [
            {
                "id": "message_id_1",
                "role": "user",
                "content": "Can you explain JavaScript closures?",
                "timestamp": "2024-01-01T00:00:00.000Z"
            },
            {
                "id": "message_id_2",
                "role": "assistant",
                "content": "JavaScript closures are functions that have access to variables from their outer scope...",
                "timestamp": "2024-01-01T00:00:00.000Z"
            }
        ]
    }
}
```

**Status Codes:**
- `201`: Session created successfully
- `400`: Missing title
- `401`: Unauthorized
- `500`: Server error

### Delete Chat Session

Soft deletes a chat session (marks as inactive).

**Endpoint:** `DELETE /api/chat/sessions/:sessionId`

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `sessionId`: ID of the chat session to delete

**Response:**
```json
{
    "success": true,
    "message": "Chat session deleted successfully"
}
```

**Status Codes:**
- `200`: Session deleted successfully
- `401`: Unauthorized
- `404`: Session not found
- `500`: Server error

## Chat Messages

### Get Chat Messages

Retrieves all messages for a specific chat session.

**Endpoint:** `GET /api/chat/sessions/:sessionId/messages`

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `sessionId`: ID of the chat session

**Response:**
```json
{
    "success": true,
    "data": {
        "sessionId": "session_id",
        "messages": [
            {
                "_id": "message_id_1",
                "role": "user",
                "content": "How do I use async/await in JavaScript?",
                "timestamp": "2024-01-01T00:00:00.000Z"
            },
            {
                "_id": "message_id_2",
                "role": "assistant",
                "content": "Async/await is a way to handle asynchronous operations in JavaScript...",
                "timestamp": "2024-01-01T00:00:00.000Z"
            }
        ]
    }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `404`: Session not found
- `500`: Server error

### Send Chat Message

Sends a message to the AI assistant in an existing chat session.

**Endpoint:** `POST /api/chat/sessions/:sessionId/messages`

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `sessionId`: ID of the chat session

**Request Body:**
```json
{
    "message": "Can you show me an example of error handling in Node.js?"
}
```

**Required Fields:**
- `message`: Message content (string, required)

**Response:**
```json
{
    "success": true,
    "data": {
        "message": {
            "id": "user_message_id",
            "role": "user",
            "content": "Can you show me an example of error handling in Node.js?",
            "timestamp": "2024-01-01T00:00:00.000Z"
        },
        "aiResponse": {
            "id": "ai_message_id",
            "role": "assistant",
            "content": "Here's an example of error handling in Node.js using try-catch blocks...",
            "timestamp": "2024-01-01T00:00:00.000Z"
        }
    }
}
```

**Status Codes:**
- `200`: Message sent successfully
- `400`: Missing message
- `401`: Unauthorized
- `404`: Session not found
- `500`: Server error

## Data Models

### ChatSession Model

```javascript
{
    _id: ObjectId,
    user: ObjectId (ref: 'User'),
    title: String (required),
    lastMessage: String,
    messageCount: Number (default: 0),
    isActive: Boolean (default: true),
    createdAt: Date,
    updatedAt: Date
}
```

### ChatMessage Model

```javascript
{
    _id: ObjectId,
    session: ObjectId (ref: 'ChatSession'),
    role: String (enum: ['user', 'assistant']),
    content: String (required),
    timestamp: Date (default: Date.now)
}
```

## Features

### Conversation Context
- Maintains conversation history within each session
- Uses last 20 messages for AI context
- Preserves chronological order of messages

### Session Management
- Soft deletion (sessions marked inactive, not permanently deleted)
- Automatic message counting
- Last message preview for session lists

### AI Integration
- Powered by Google Gemini AI
- Context-aware responses based on conversation history
- Intelligent programming assistance

## Error Handling

All chat endpoints follow the standard error response format:

```json
{
    "success": false,
    "message": "Error description"
}
```

Common error scenarios:
- **400 Bad Request**: Missing required fields or invalid message
- **401 Unauthorized**: Missing or invalid authentication token
- **404 Not Found**: Chat session does not exist
- **500 Server Error**: AI service unavailable or internal error

## Rate Limiting

Chat endpoints are subject to rate limiting to manage AI API usage costs. Users should implement appropriate retry logic with exponential backoff for failed requests.

## Usage Examples

### Creating a New Chat Session

```javascript
const createChatSession = async (title, initialMessage = null) => {
    const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            title,
            initialMessage
        })
    });

    const result = await response.json();
    return result;
};
```

### Sending Messages in a Session

```javascript
const sendMessage = async (sessionId, message) => {
    const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            message
        })
    });

    const result = await response.json();
    return result;
};
```

### Loading Chat History

```javascript
const loadChatHistory = async (sessionId) => {
    const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const result = await response.json();
    return result.data.messages;
};
```