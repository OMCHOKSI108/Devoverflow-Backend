# API Documentation

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

This document lists the backend API endpoints available in the project and includes example requests and notes. Example values use neutral placeholders like `alice` and `alice@example.com`.

---

## Authentication (/api/auth)

Public endpoints:

- POST /api/auth/register
    - Create a new user account.
    - Body (JSON):

```json
{
    "username": "alice",
    "email": "alice@example.com",
    "password": "SecurePassword123!"
}
```

- POST /api/auth/login
    - Authenticate and return a JWT.
    - Body (JSON):

```json
{
    "email": "alice@example.com",
    "password": "SecurePassword123!"
}
```

- GET /api/auth/verify/:token
    - Verify a user's email using the token sent by email.

- POST /api/auth/resend-verification
    - Resend verification email. Body: { "email": "alice@example.com" }

- POST /api/auth/test-email
    - Internal/test endpoint to verify email sending (development).

- POST /api/auth/register-admin and POST /api/auth/setup-admin
    - Admin creation endpoints (setup/admin flows). `setup-admin` may be temporary on some deployments.

Password reset flow:

- POST /api/auth/forgot-password
    - Request a password reset. Body: { "email": "alice@example.com" }

- POST /api/auth/reset-password
    - Reset password using token. Body: { "token": "reset_token_from_email", "newPassword": "NewSecurePassword123!" }

Protected (require Authorization header):

- GET /api/auth/me
    - Get authenticated user's profile.

- PUT /api/auth/profile
    - Update authenticated user's profile. Body example includes fields like `username`, `bio`, `avatarUrl`.

- PUT /api/auth/change-password
    - Change password for authenticated user. Body: { "currentPassword": "...", "newPassword": "..." }

---

## Users (/api/users)

Public:

- GET /api/users/leaderboard
    - Get leaderboard of top users.

- GET /api/users/search?query=alice
    - Search users by name/email/handle.

Protected:

- GET /api/users/me
    - Get current user's full profile.

- PUT /api/users/profile
    - Update current user's profile. Body: { "username": "alice", "bio": "..." }

- GET /api/users
    - Get list of users (used for search/friends discovery).

Friends / connections:

- GET /api/users/friends
    - Get current user's friends list.

- POST /api/users/friends/:userId
    - Send friend request / add friend.

- DELETE /api/users/friends/:userId
    - Remove friend.

Notifications & settings:

- GET /api/users/notifications
    - Get current user's notifications.

- PUT /api/users/notifications/read-all
    - Mark all notifications as read.

- PUT /api/users/notifications/:id/read
    - Mark a single notification as read.

- GET /api/users/settings
    - Get user settings.

- PUT /api/users/settings
    - Update user settings.

User discovery and profiles:

- GET /api/users/suggestions
    - Get suggested users to follow.

- GET /api/users/:id/reputation
    - Get a user's reputation score.

- GET /api/users/:id/summary
    - Get a short profile summary.

- GET /api/users/:id/activity
    - Get public activity feed for user.

- GET /api/users/:id/following
    - Users that :id is following.

- GET /api/users/:id/followers
    - Users that follow :id.

- GET /api/users/:id
    - Public user profile (must be last in route order to avoid conflicts).

- GET /api/users/:id/connection-status (protected)
    - Check relationship (follow/friend) status against authenticated user.

- POST /api/users/:id/follow (protected)
    - Follow a user.

- DELETE /api/users/:id/follow (protected)
    - Unfollow a user.

---

## Questions (/api/questions)

Public:

- GET /api/questions
    - List recent/popular questions. Supports pagination query params.

- GET /api/questions/search?q=error+handling
    - Search questions by title/body/tags.

- GET /api/questions/user/:userId
    - Get questions posted by a specific user.

- GET /api/questions/:id
    - Get a specific question by ID.

Protected (require authentication):

- POST /api/questions
    - Create a question. Body example:

```json
{
    "title": "How to handle async errors in Node.js?",
    "body": "I have several promises and want a clean error pattern...",
    "tags": ["nodejs","async","javascript"]
}
```

- PUT /api/questions/:id
    - Update a question the user owns.

- DELETE /api/questions/:id
    - Delete a question the user owns.

- POST /api/questions/:id/vote
    - Vote on a question (up or down). Body: { "vote": 1 } or { "vote": -1 }

Answers under questions:

- POST /api/questions/:questionId/answers (protected)
    - Add an answer to the given question. Body example:

```json
{ "body": "You can use try/catch with async/await..." }
```

---

## Answers (/api/answers)

Public:

- GET /api/answers/question/:questionId
    - Get answers for a question.

- GET /api/answers/user/:userId
    - Get answers by a specific user.

Protected:

- PUT /api/answers/:id
    - Edit your answer. Body: { "body": "..." }

- DELETE /api/answers/:id
    - Delete your answer.

- POST /api/answers/:id/vote
    - Vote on an answer. Body: { "vote": 1 }

- POST /api/answers/:id/accept
    - Accept an answer (usually allowed for question owner).

---

## Comments (/api/comments)

Public:

- GET /api/comments/question/:questionId
    - Get comments for a question.

- GET /api/comments/answer/:answerId
    - Get comments for an answer.

Protected:

- POST /api/comments/question/:questionId
    - Add a comment to a question. Body: { "body": "..." }

- POST /api/comments/answer/:answerId
    - Add a comment to an answer.

- PUT /api/comments/:id
    - Update a comment the user owns.

- DELETE /api/comments/:id
    - Delete a comment the user owns.

---

## Bookmarks (/api/bookmarks)

The bookmarks API supports two types of bookmarks:

1. **External Bookmarks**: Save external links/resources with title, excerpt, and tags
2. **Question Bookmarks**: Bookmark questions within the platform (legacy system)

All bookmark routes are protected and require authentication.

### External Bookmarks

- GET /api/bookmarks
    - Get user's external bookmarks with pagination.
    - Query params: `page` (default: 1), `limit` (default: 10)

- POST /api/bookmarks
    - Create a new external bookmark.
    - Body (JSON):

```json
{
    "title": "Useful React Tutorial",
    "excerpt": "A comprehensive guide to React hooks",
    "link": "https://example.com/react-tutorial",
    "tags": ["react", "javascript", "tutorial"],
    "isPublic": false
}
```

- DELETE /api/bookmarks/:bookmarkId
    - Remove an external bookmark by its ID.

### Question Bookmarks (Legacy)

- POST /api/bookmarks/question/:questionId
    - Add a question to user's bookmarks.

- DELETE /api/bookmarks/question/:questionId
    - Remove a question from user's bookmarks.

- GET /api/bookmarks/check/:questionId
    - Check if a specific question is bookmarked by the current user.
    - Returns: `{ "questionId": "...", "isBookmarked": true/false }`

---

## Uploads (/api/upload)

- POST /api/upload (protected)
    - Upload an image/file (multer + cloudinary or local storage). Multipart/form-data.

---

## AI (/api/ai)

Public:

- GET /api/ai/status
    - Check AI (Gemini) configuration and model status.

- POST /api/ai/similar-questions
    - Public endpoint to get similar questions from AI; body: { "questionTitle": "...", "questionBody":"..." }

Protected:

- POST /api/ai/answer-suggestion
    - Generate an answer suggestion for a question. Body: { "questionTitle":"...","questionBody":"...","tags":[...] }
    - Response includes `suggestion` (text) and `html` (sanitized HTML fallback).

- POST /api/ai/tag-suggestions
    - Suggest tags for a question. Body: { "questionTitle":"...","questionBody":"..." }

- POST /api/ai/chatbot
    - Simple chatbot endpoint. Body: { "message": "...", "context": "optional system context" }

- POST /api/ai/question-improvements
    - Suggest improvements for a question. Body: { "questionTitle": "...", "questionBody": "..." }

Flowchart endpoints (protected):

- POST /api/ai/flowchart
    - Generate Mermaid flowchart from a prompt. Body: { "prompt": "...", "render": true, "output": "png|svg" }

- GET /api/ai/flowchart/:id
    - Get flow metadata and mermaid code.

- GET /api/ai/flowchart/:id/render
    - Get render status and URLs (png/svg).

---

## Chat (/api/chat)

All chat routes require authentication.

- GET /api/chat/sessions
    - List chat sessions for the user.

- POST /api/chat/sessions
    - Create a new session. Body: { "title": "Session title", "initialMessage": "optional message" }

- GET /api/chat/sessions/:sessionId/messages
    - Get messages for a session.

- POST /api/chat/sessions/:sessionId/messages
    - Send a message in a session. Body: { "message": "..." }

- DELETE /api/chat/sessions/:sessionId
    - Delete (soft-delete) a session.

Responses for AI messages include both `content` (raw text/markdown) and `html` (sanitized HTML) for convenience.

---

## Friends (/api/friends)

Protected user routes:

- POST /api/friends/add
    - Add a friend (body includes target user id or handle depending on UI).

- POST /api/friends/remove
    - Remove a friend.

- GET /api/friends/profile/:id?
    - Get friendship profile (own or other user's profile related to friendship).

Admin routes (protected + adminOnly):

- GET /api/friends/admin/all
    - Get all friend relationships (admin).

- GET /api/friends/admin/stats
    - Get friend-related stats (admin).

- DELETE /api/friends/admin/remove
    - Admin remove a friendship.

---

## Gamification (/api/gamification)

Protected routes:

- GET /api/gamification/reputation
    - Get authenticated user's reputation details.

- GET /api/gamification/reputation/history
    - Get reputation change history.

- GET /api/gamification/badges
    - Get the user's badges.

- GET /api/gamification/privileges
    - Get unlocked privileges for the user.

- GET /api/gamification/leaderboard
    - Get gamification leaderboard.

---

## Groups (/api/groups)

Protected routes:

- GET /api/groups
    - List groups the user can see or join.

- POST /api/groups
    - Create a new group. Body: { "name": "Group name", "description": "..." }

- GET /api/groups/:groupId
    - Get group details.

- POST /api/groups/:groupId/join
    - Join a group.

- POST /api/groups/:groupId/leave
    - Leave a group.

- POST /api/groups/:groupId/questions
    - Post a question to a group.

- GET /api/groups/:groupId/questions
    - List questions in a group.

---

## Notifications (/api/notifications)

Protected routes (all under /api/notifications):

- GET /
    - Get user notifications.

- PUT /:id/read
    - Mark a notification as read.

- PUT /read-all
    - Mark all notifications as read.

- DELETE /:id
    - Delete a notification.

---

## Search (/api/search)

Protected routes (all under /api/search):

- GET /api/search
    - Advanced search for questions (query parameters control filters/sorting).

- GET /api/search/suggestions
    - Get search suggestions and popular tags.

- GET /api/search/trending
    - Get trending tags/topics.

---

## Admin (/api/admin)

Protected + admin-only routes:

- POST /api/admin/reports (protected)
    - Create a new user-generated report (any authenticated user can file a report).

- GET /api/admin/reports
    - Admin: list reports.

- PUT /api/admin/reports/:id/resolve
    - Admin: mark a report resolved.

- GET /api/admin/stats
    - Admin: site statistics.

- DELETE /api/admin/content/:type/:id
    - Admin: remove content (question/answer/comment) by id.

- User management (admin):
    - PUT /api/admin/users/:id — manage user (ban/unban, roles).
    - GET /api/admin/users — list users.
    - DELETE /api/admin/users/:id — delete user.
    - PUT /api/admin/users/:id/details — update user details.

Content moderation (admin):

- GET /api/admin/questions
- PUT /api/admin/questions/:id
- GET /api/admin/answers
- PUT /api/admin/answers/:id
- GET /api/admin/comments
- POST /api/admin/comments
- PUT /api/admin/comments/:id
- DELETE /api/admin/comments/:id

---

## Notes & Best Practices

- Rate limiting and other protections are enabled on sensitive endpoints (password reset, auth endpoints).
- Always include the `Authorization: Bearer <token>` header for protected endpoints.
- The AI endpoints return both raw `content` (which may contain Markdown) and a sanitized `html` field — prefer rendering Markdown client-side (e.g., `flutter_markdown`) or using the `html` fallback if the client cannot parse Markdown.
- Use realistic test accounts (e.g., `alice@example.com`) when trying the API; do not publish real user credentials.

If you want, I can also generate a Postman collection export from the repository's existing example collection (the project already contains Postman JSON under `POSTMAN/`).
