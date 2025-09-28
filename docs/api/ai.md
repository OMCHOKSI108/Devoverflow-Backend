# AI API

The AI API provides various artificial intelligence-powered features to enhance the DevOverflow platform. These features leverage Google's Gemini AI to provide intelligent assistance for programming questions, content generation, and visual diagram creation.

## AI Service Status

### Get AI Status

Retrieves the current status and configuration of the AI service.

**Endpoint:** `GET /api/ai/status`

**Authentication:** Not required

**Response:**
```json
{
    "success": true,
    "status": "AI operational",
    "model": "gemini-1.5-flash",
    "configured": true,
    "primaryKey": true,
    "backupKey": false,
    "currentKey": "primary"
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error

## Answer Assistance

### Get Answer Suggestion

Generates an AI-powered answer suggestion for a programming question.

**Endpoint:** `POST /api/ai/answer-suggestion`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
    "questionTitle": "How to implement user authentication in Express.js?",
    "questionBody": "I'm building a web app with Express.js and need to implement user authentication. What are the best practices?",
    "tags": ["javascript", "express", "authentication"]
}
```

**Required Fields:**
- `questionTitle`: Title of the question (string, required)
- `questionBody`: Body/content of the question (string, required)

**Optional Fields:**
- `tags`: Array of tag strings for context

**Response:**
```json
{
    "success": true,
    "data": {
        "suggestion": "Here's a comprehensive guide to implementing user authentication in Express.js...",
        "confidence": "high",
        "model": "gemini-1.5-flash"
    }
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing required fields
- `401`: Unauthorized
- `503`: AI service not configured
- `500`: Server error

### Get Tag Suggestions

Generates AI-powered tag suggestions for a programming question.

**Endpoint:** `POST /api/ai/tag-suggestions`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
    "questionTitle": "How to implement user authentication in Express.js?",
    "questionBody": "I'm building a web app with Express.js and need to implement user authentication."
}
```

**Required Fields:**
- `questionTitle`: Title of the question (string, required)
- `questionBody`: Body/content of the question (string, required)

**Response:**
```json
{
    "success": true,
    "data": {
        "suggestedTags": ["javascript", "express", "authentication", "jwt", "security"],
        "model": "gemini-1.5-flash"
    }
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing required fields
- `401`: Unauthorized
- `503`: AI service not configured
- `500`: Server error

### Get Question Improvements

Provides AI-powered suggestions for improving a programming question.

**Endpoint:** `POST /api/ai/question-improvements`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
    "questionTitle": "How to implement user authentication in Express.js?",
    "questionBody": "I'm building a web app with Express.js and need to implement user authentication.",
    "tags": ["javascript", "express"]
}
```

**Required Fields:**
- `questionTitle`: Title of the question (string, required)
- `questionBody`: Body/content of the question (string, required)

**Optional Fields:**
- `tags`: Array of current tag strings

**Response:**
```json
{
    "success": true,
    "data": {
        "improvements": "Your question is clear, but consider adding: 1. Specific requirements... 2. Code examples... 3. Expected behavior...",
        "model": "gemini-1.5-flash"
    }
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing required fields
- `401`: Unauthorized
- `503`: AI service not configured
- `500`: Server error

### Get Similar Questions

Generates AI-powered suggestions for similar question titles.

**Endpoint:** `POST /api/ai/similar-questions`

**Authentication:** Not required

**Request Body:**
```json
{
    "questionTitle": "How to implement user authentication in Express.js?",
    "questionBody": "I'm building a web app with Express.js and need to implement user authentication."
}
```

**Required Fields:**
- `questionTitle`: Title of the question (string, required)

**Optional Fields:**
- `questionBody`: Body/content of the question for better context

**Response:**
```json
{
    "success": true,
    "data": {
        "similarQuestions": [
            "Best practices for JWT authentication in Express.js",
            "How to handle user sessions in Express applications",
            "Implementing OAuth2 with Express.js and Passport",
            "Secure password hashing in Node.js applications",
            "Building authentication middleware for Express APIs"
        ],
        "model": "gemini-1.5-flash"
    }
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing required fields
- `503`: AI service not configured
- `500`: Server error

## Chatbot

### AI Chatbot

Provides general AI-powered programming assistance through a chatbot interface.

**Endpoint:** `POST /api/ai/chatbot`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
    "message": "How do I debug a memory leak in Node.js?",
    "context": "I'm working on a Node.js application with Express.js"
}
```

**Required Fields:**
- `message`: User's message/question (string, required)

**Optional Fields:**
- `context`: Additional context for the conversation

**Response:**
```json
{
    "success": true,
    "data": {
        "response": "To debug memory leaks in Node.js, you can use several tools and techniques...",
        "timestamp": "2024-01-01T12:00:00.000Z",
        "model": "gemini-1.5-flash"
    }
}
```

**Status Codes:**
- `200`: Success
- `400`: Missing message
- `401`: Unauthorized
- `503`: AI service not configured
- `500`: Server error

## Flowchart Generation

### Create Flowchart

Generates a Mermaid flowchart diagram from a text description and optionally renders it to PNG/SVG.

**Endpoint:** `POST /api/ai/flowchart`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
    "prompt": "Create a flowchart showing the user authentication process: user logs in, system validates credentials, generates JWT token, returns success or error",
    "render": true,
    "output": "png"
}
```

**Required Fields:**
- `prompt`: Description of the flowchart to generate (string, required)

**Optional Fields:**
- `render`: Whether to render the diagram (boolean, default: true)
- `output`: Output format - "png" or "svg" (string, default: "png")

**Response:**
```json
{
    "success": true,
    "data": {
        "id": "flow_a1b2c3d4e5f6",
        "mermaid": "graph LR\n    A[User Login] --> B{Validate Credentials}\n    B -->|Valid| C[Generate JWT]\n    B -->|Invalid| D[Return Error]\n    C --> E[Return Success]",
        "markdown": "```mermaid\ngraph LR\n    A[User Login] --> B{Validate Credentials}\n    B -->|Valid| C[Generate JWT]\n    B -->|Invalid| D[Return Error]\n    C --> E[Return Success]\n```",
        "render": {
            "status": "done",
            "pngUrl": "https://api.devoverflow.com/uploads/flows/flow_a1b2c3d4e5f6.png",
            "svgUrl": null
        }
    }
}
```

**Status Codes:**
- `201`: Flowchart created successfully
- `400`: Missing prompt
- `401`: Unauthorized
- `503`: AI service not configured
- `500`: Server error or invalid Mermaid output

### Get Flowchart

Retrieves metadata for a specific flowchart.

**Endpoint:** `GET /api/ai/flowchart/:id`

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `id`: Flowchart ID

**Response:**
```json
{
    "success": true,
    "data": {
        "_id": "flow_object_id",
        "id": "flow_a1b2c3d4e5f6",
        "userId": "user_id",
        "prompt": "Create a flowchart showing the user authentication process...",
        "mermaid": "graph LR\n    A[User Login] --> B{Validate Credentials}...",
        "pngUrl": "https://api.devoverflow.com/uploads/flows/flow_a1b2c3d4e5f6.png",
        "svgUrl": null,
        "status": "done",
        "createdAt": "2024-01-01T12:00:00.000Z"
    }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `404`: Flowchart not found
- `500`: Server error

### Get Flowchart Render Status

Retrieves the rendering status and URLs for a specific flowchart.

**Endpoint:** `GET /api/ai/flowchart/:id/render`

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `id`: Flowchart ID

**Response:**
```json
{
    "success": true,
    "data": {
        "status": "done",
        "pngUrl": "https://api.devoverflow.com/uploads/flows/flow_a1b2c3d4e5f6.png",
        "svgUrl": null
    }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `404`: Flowchart not found
- `500`: Server error

## Data Models

### Flow Model

```javascript
{
    _id: ObjectId,
    id: String (unique identifier),
    userId: ObjectId (ref: 'User'),
    prompt: String,
    mermaid: String (Mermaid diagram code),
    pngUrl: String (optional),
    svgUrl: String (optional),
    status: String (enum: 'pending', 'done', 'failed'),
    createdAt: Date
}
```

## Error Handling

All AI endpoints follow the standard error response format:

```json
{
    "success": false,
    "message": "Error description"
}
```

Common error scenarios:
- **400 Bad Request**: Missing required fields or invalid input
- **401 Unauthorized**: Missing or invalid authentication token
- **404 Not Found**: Flowchart does not exist
- **503 Service Unavailable**: AI service not configured or unavailable
- **500 Server Error**: Internal server error or AI generation failure

## Rate Limiting

AI endpoints are subject to rate limiting to manage API usage costs. Users should implement appropriate retry logic with exponential backoff for failed requests.

## AI Configuration

The AI service requires proper configuration with API keys:
- Primary: `GEMINI_API_KEY` (Google Gemini)
- Backup: `GROQ_API_KEY` (optional fallback)

If neither key is configured, AI features will return 503 Service Unavailable errors.