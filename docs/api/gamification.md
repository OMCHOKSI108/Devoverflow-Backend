# Gamification API

The Gamification API provides reputation, badges, privileges, and leaderboard functionality to encourage user engagement and recognize contributions within the DevOverflow platform.

## Base URL
```
/api/gamification
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### Get User Reputation
Retrieve the current user's reputation points, level, and progress information.

**Endpoint:** `GET /api/gamification/reputation`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "reputation": 250,
    "level": 3,
    "nextLevelPoints": 300,
    "progressToNextLevel": 50
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### Get Reputation History
Retrieve paginated history of reputation changes for the current user.

**Endpoint:** `GET /api/gamification/reputation/history`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of history items per page (default: 20)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "points": 10,
        "reason": "answer_accepted",
        "timestamp": "2024-01-15T10:30:00.000Z",
        "total": 250,
        "relatedEntity": {
          "title": "How to optimize React performance?",
          "body": "I'm experiencing performance issues..."
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalHistory": 45,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### Get User Badges
Retrieve all badges earned by the current user.

**Endpoint:** `GET /api/gamification/badges`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "badges": [
      {
        "id": "first_question",
        "name": "Curious Mind",
        "description": "Asked your first question",
        "icon": "❓",
        "color": "#3498db",
        "requirement": 1,
        "unlockedAt": "2024-01-10T08:15:00.000Z"
      },
      {
        "id": "reputation_100",
        "name": "Rising Star",
        "description": "Reached 100 reputation",
        "icon": "⭐",
        "color": "#f39c12",
        "requirement": 100,
        "unlockedAt": "2024-01-12T14:20:00.000Z"
      }
    ]
  }
}
```

---

### Get User Privileges
Retrieve all privileges available to the current user based on their reputation.

**Endpoint:** `GET /api/gamification/privileges`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "privileges": [
      {
        "id": "vote_up",
        "name": "Vote Up",
        "description": "Can upvote questions and answers",
        "icon": "👍",
        "requirement": 1
      },
      {
        "id": "comment",
        "name": "Comment",
        "description": "Can comment on questions and answers",
        "icon": "💬",
        "requirement": 10
      },
      {
        "id": "edit",
        "name": "Edit",
        "description": "Can edit own questions and answers",
        "icon": "✏️",
        "requirement": 50
      }
    ]
  }
}
```

---

### Get Leaderboard
Retrieve the reputation leaderboard with optional time period filtering.

**Endpoint:** `GET /api/gamification/leaderboard`

**Query Parameters:**
- `limit` (optional): Maximum number of users to return (default: 50)
- `period` (optional): Time period filter - 'all_time', 'monthly', 'weekly' (default: 'all_time')

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user": {
          "id": "string",
          "name": "John Doe",
          "reputation": 1250,
          "badges": ["first_question", "reputation_100", "reputation_500"],
          "avatar": "https://example.com/avatar.jpg"
        }
      },
      {
        "rank": 2,
        "user": {
          "id": "string",
          "name": "Jane Smith",
          "reputation": 980,
          "badges": ["first_question", "reputation_100"],
          "avatar": "https://example.com/avatar2.jpg"
        }
      }
    ],
    "period": "all_time"
  }
}
```

---

## Data Models

### Reputation Info
```json
{
  "reputation": "number",           // Current reputation points
  "level": "number",                // Current level (calculated from reputation)
  "nextLevelPoints": "number",      // Points needed for next level
  "progressToNextLevel": "number"   // Points earned in current level
}
```

### Reputation History Item
```json
{
  "points": "number",               // Points gained/lost (+/-)
  "reason": "string",               // Reason for reputation change
  "timestamp": "Date",              // When the change occurred
  "total": "number",                // Total reputation after change
  "relatedEntity": {                // Related question/answer/comment
    "title": "string",
    "body": "string"
  }
}
```

### Badge
```json
{
  "id": "string",                   // Unique badge identifier
  "name": "string",                 // Display name
  "description": "string",          // Badge description
  "icon": "string",                 // Emoji or icon representation
  "color": "string",                // Hex color code
  "requirement": "number",          // Reputation required
  "unlockedAt": "Date|null"         // When user earned this badge
}
```

### Privilege
```json
{
  "id": "string",                   // Unique privilege identifier
  "name": "string",                 // Display name
  "description": "string",          // Privilege description
  "icon": "string",                 // Emoji or icon representation
  "requirement": "number"           // Reputation required
}
```

### Leaderboard Entry
```json
{
  "rank": "number",                 // User's rank on leaderboard
  "user": {
    "id": "string",
    "name": "string",               // User's display name
    "reputation": "number",
    "badges": ["array", "of", "badge", "ids"],
    "avatar": "string"              // Profile picture URL
  }
}
```

---

## Reputation System

### Level Calculation
- **Formula**: `level = floor(reputation / 100) + 1`
- **Level 1**: 0-99 points
- **Level 2**: 100-199 points
- **Level 3**: 200-299 points
- etc.

### Reputation Reasons
- `question_asked`: +5 points for asking a question
- `answer_accepted`: +15 points when answer is accepted
- `answer_upvoted`: +10 points when answer receives upvote
- `question_upvoted`: +5 points when question receives upvote
- `answer_downvoted`: -2 points when answer receives downvote
- `question_downvoted`: -2 points when question receives downvote
- `badge_earned`: Variable points for earning badges
- `moderation_penalty`: Negative points for violations
- `admin_adjustment`: Manual adjustment by administrators

### Available Badges
| Badge ID | Name | Description | Points Required | Icon |
|----------|------|-------------|----------------|------|
| `first_question` | Curious Mind | Asked your first question | 1 | ❓ |
| `first_answer` | Helper | Provided your first answer | 5 | 💡 |
| `accepted_answer` | Accepted | Had an answer accepted | 10 | ✅ |
| `reputation_100` | Rising Star | Reached 100 reputation | 100 | ⭐ |
| `reputation_500` | Expert | Reached 500 reputation | 500 | 🏆 |

### Available Privileges
| Privilege ID | Name | Description | Points Required | Icon |
|--------------|------|-------------|----------------|------|
| `vote_up` | Vote Up | Can upvote questions and answers | 1 | 👍 |
| `comment` | Comment | Can comment on questions and answers | 10 | 💬 |
| `edit` | Edit | Can edit own questions and answers | 50 | ✏️ |
| `moderate` | Moderate | Can flag inappropriate content | 100 | 🚩 |

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
- `404` - User not found
- `500` - Server error

---

## Usage Examples

### Getting User Reputation
```javascript
const response = await fetch('/api/gamification/reputation', {
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  }
});

const data = await response.json();
console.log('Reputation:', data.data.reputation);
console.log('Level:', data.data.level);
console.log('Progress:', data.data.progressToNextLevel);
```

### Getting Leaderboard
```javascript
const response = await fetch('/api/gamification/leaderboard?limit=10&period=monthly', {
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  }
});

const data = await response.json();
console.log('Top users:', data.data.leaderboard);
```

### Checking User Badges
```javascript
const response = await fetch('/api/gamification/badges', {
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  }
});

const data = await response.json();
const earnedBadges = data.data.badges.filter(badge => badge.unlockedAt);
console.log('Earned badges:', earnedBadges);
```

### Getting Reputation History
```javascript
const response = await fetch('/api/gamification/reputation/history?page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  }
});

const data = await response.json();
console.log('Recent reputation changes:', data.data.history);
```

---

## Notes

- Reputation levels are calculated automatically based on total points
- Badges are awarded automatically when reputation requirements are met
- Privileges are granted based on reputation thresholds
- Leaderboard supports time-based filtering (all-time, monthly, weekly)
- Reputation history is paginated for performance
- All gamification data is tied to user authentication</content>
<parameter name="filePath">d:\SEM 5\AIML308_Mobile Application Development\PRACTICALS\backend\docs\api\gamification.md