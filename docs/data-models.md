# Data Models

This section provides detailed information about the data models and database schema used in the DevOverflow backend API.

## Overview

The DevOverflow backend uses MongoDB as the primary database with Mongoose ODM for data modeling. All models include automatic timestamp fields (`createdAt`, `updatedAt`) and follow consistent naming conventions.

## User Model

The User model represents registered users of the platform.

```javascript
{
    _id: ObjectId,
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profile: {
        fullName: String,
        bio: String,
        location: String,
        website: String,
        avatar: String
    },
    reputation: {
        type: Number,
        default: 10,
        min: 0
    },
    badges: [{
        type: String,
        enum: ['helpful', 'expert', 'mentor', 'pioneer', 'scholar']
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerifiedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    following: [{
        type: ObjectId,
        ref: 'User'
    }],
    followers: [{
        type: ObjectId,
        ref: 'User'
    }],
    bookmarks: [{
        type: ObjectId,
        ref: 'Question'
    }],
    lastLoginAt: Date,
    createdAt: Date,
    updatedAt: Date
}
```

### User Fields Description

- **username**: Unique username (3-30 characters)
- **email**: Unique email address (automatically lowercased)
- **password**: Hashed password (minimum 6 characters)
- **profile**: User profile information
  - `fullName`: Display name
  - `bio`: User biography
  - `location`: Geographic location
  - `website`: Personal website URL
  - `avatar`: Profile picture URL
- **reputation**: User reputation score (default: 10, minimum: 0)
- **badges**: Achievement badges earned by the user
- **isVerified**: Email verification status
- **isAdmin**: Administrative privileges
- **following/followers**: Social connections
- **bookmarks**: Array of bookmarked question IDs

## Question Model

The Question model represents user-submitted questions.

```javascript
{
    _id: ObjectId,
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    user: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    votes: {
        upvotes: [{
            type: ObjectId,
            ref: 'User'
        }],
        downvotes: [{
            type: ObjectId,
            ref: 'User'
        }],
        score: {
            type: Number,
            default: 0
        }
    },
    answers: [{
        type: ObjectId,
        ref: 'Answer'
    }],
    comments: [{
        type: ObjectId,
        ref: 'Comment'
    }],
    views: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'duplicate'],
        default: 'open'
    },
    acceptedAnswer: {
        type: ObjectId,
        ref: 'Answer'
    },
    createdAt: Date,
    updatedAt: Date
}
```

### Question Fields Description

- **title**: Question title (maximum 200 characters)
- **content**: Full question content
- **tags**: Array of topic tags
- **user**: Reference to the user who asked the question
- **votes**: Voting system with upvotes, downvotes, and calculated score
- **answers**: Array of answer IDs
- **comments**: Array of comment IDs
- **views**: Number of times the question has been viewed
- **status**: Question status (open, closed, duplicate)
- **acceptedAnswer**: ID of the accepted answer (if any)

## Answer Model

The Answer model represents responses to questions.

```javascript
{
    _id: ObjectId,
    content: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    question: {
        type: ObjectId,
        ref: 'Question',
        required: true
    },
    votes: {
        upvotes: [{
            type: ObjectId,
            ref: 'User'
        }],
        downvotes: [{
            type: ObjectId,
            ref: 'User'
        }],
        score: {
            type: Number,
            default: 0
        }
    },
    comments: [{
        type: ObjectId,
        ref: 'Comment'
    }],
    isAccepted: {
        type: Boolean,
        default: false
    },
    createdAt: Date,
    updatedAt: Date
}
```

### Answer Fields Description

- **content**: Answer content
- **user**: Reference to the user who provided the answer
- **question**: Reference to the question being answered
- **votes**: Voting system with upvotes, downvotes, and calculated score
- **comments**: Array of comment IDs
- **isAccepted**: Whether this answer was accepted by the question author

## Comment Model

The Comment model represents comments on questions and answers.

```javascript
{
    _id: ObjectId,
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    user: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    contentType: {
        type: String,
        enum: ['question', 'answer'],
        required: true
    },
    contentId: {
        type: ObjectId,
        required: true,
        refPath: 'contentType'
    },
    isAdminComment: {
        type: Boolean,
        default: false
    },
    createdAt: Date,
    updatedAt: Date
}
```

### Comment Fields Description

- **content**: Comment text (maximum 1000 characters)
- **user**: Reference to the user who made the comment
- **contentType**: Type of content being commented on ('question' or 'answer')
- **contentId**: ID of the content being commented on
- **isAdminComment**: Whether this comment was made by an admin

## Report Model

The Report model handles user reports of inappropriate content.

```javascript
{
    _id: ObjectId,
    reporter: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    contentId: {
        type: ObjectId,
        required: true,
        refPath: 'contentType'
    },
    contentType: {
        type: String,
        enum: ['question', 'answer'],
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'resolved'],
        default: 'pending'
    },
    resolvedBy: {
        type: ObjectId,
        ref: 'User'
    },
    resolvedAt: Date,
    createdAt: Date,
    updatedAt: Date
}
```

### Report Fields Description

- **reporter**: User who submitted the report
- **contentId/contentType**: Content being reported
- **reason**: Reason for the report
- **status**: Report status (pending or resolved)
- **resolvedBy**: Admin who resolved the report
- **resolvedAt**: When the report was resolved

## Bookmark Model

The Bookmark model represents external bookmarks saved by users.

```javascript
{
    _id: ObjectId,
    user: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    excerpt: {
        type: String,
        required: true,
        trim: true
    },
    link: {
        type: String,
        required: true,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    createdAt: Date,
    updatedAt: Date
}
```

### Bookmark Fields Description

- **user**: User who created the bookmark
- **title**: Bookmark title
- **excerpt**: Brief description
- **link**: URL being bookmarked
- **tags**: Array of tags for organization
- **isPublic**: Whether the bookmark is publicly visible

## Flow Model

The Flow model represents flowchart diagrams generated by the AI service.

```javascript
{
    _id: ObjectId,
    id: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    prompt: {
        type: String,
        required: true
    },
    mermaid: String,
    pngUrl: String,
    svgUrl: String,
    status: {
        type: String,
        enum: ['pending', 'done', 'failed'],
        default: 'pending'
    },
    createdAt: Date
}
```

### Flow Fields Description

- **id**: Unique identifier for the flowchart
- **userId**: User who created the flowchart
- **prompt**: Text prompt used to generate the diagram
- **mermaid**: Mermaid diagram code
- **pngUrl/svgUrl**: Rendered diagram URLs
- **status**: Generation status

## Database Indexes

The following indexes are created for optimal query performance:

```javascript
// User indexes
User.collection.createIndex({ username: 1 }, { unique: true });
User.collection.createIndex({ email: 1 }, { unique: true });
User.collection.createIndex({ "profile.fullName": 1 });

// Question indexes
Question.collection.createIndex({ user: 1, createdAt: -1 });
Question.collection.createIndex({ tags: 1 });
Question.collection.createIndex({ status: 1, createdAt: -1 });
Question.collection.createIndex({ "votes.score": -1 });

// Answer indexes
Answer.collection.createIndex({ question: 1, createdAt: -1 });
Answer.collection.createIndex({ user: 1, createdAt: -1 });
Answer.collection.createIndex({ "votes.score": -1 });

// Comment indexes
Comment.collection.createIndex({ contentId: 1, contentType: 1, createdAt: -1 });
Comment.collection.createIndex({ user: 1, createdAt: -1 });

// Report indexes
Report.collection.createIndex({ status: 1, createdAt: -1 });
Report.collection.createIndex({ reporter: 1, contentId: 1, contentType: 1 });

// Bookmark indexes
Bookmark.collection.createIndex({ user: 1, createdAt: -1 });
Bookmark.collection.createIndex({ user: 1, tags: 1 });

// Flow indexes
Flow.collection.createIndex({ userId: 1, createdAt: -1 });
Flow.collection.createIndex({ id: 1 }, { unique: true });
```

## Data Relationships

### User Relationships

```
User
├── Questions (1:many)
├── Answers (1:many)
├── Comments (1:many)
├── Reports (1:many)
├── Bookmarks (1:many)
├── Following (many:many)
├── Followers (many:many)
└── Flows (1:many)
```

### Question Relationships

```
Question
├── User (many:1)
├── Answers (1:many)
├── Comments (1:many)
├── Votes (many:many)
└── Accepted Answer (1:1)
```

### Answer Relationships

```
Answer
├── User (many:1)
├── Question (many:1)
├── Comments (1:many)
└── Votes (many:many)
```

### Comment Relationships

```
Comment
├── User (many:1)
└── Content (many:1) - Question or Answer
```

## Validation Rules

### Common Validation Patterns

- **String Trimming**: All string fields are automatically trimmed
- **Email Validation**: Email fields use regex validation
- **URL Validation**: URL fields are validated for proper format
- **Length Limits**: Various fields have maximum length restrictions
- **Required Fields**: Critical fields are marked as required
- **Unique Constraints**: Username and email must be unique
- **Reference Validation**: ObjectId references are validated

### Custom Validators

```javascript
// Email validator
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// URL validator
const urlRegex = /^https?:\/\/.+/;

// Username validator (alphanumeric, underscore, dash)
const usernameRegex = /^[a-zA-Z0-9_-]+$/;
```

## Data Migration

When schema changes are made, the following migration strategy is used:

1. **Backward Compatibility**: New fields have sensible defaults
2. **Data Transformation**: Existing data is transformed as needed
3. **Gradual Rollout**: Changes are deployed with feature flags
4. **Rollback Plan**: Ability to revert schema changes if needed

## Performance Considerations

### Query Optimization

- **Selective Field Selection**: Use `select()` to retrieve only needed fields
- **Population Strategy**: Populate related documents judiciously
- **Pagination**: Implement cursor-based pagination for large datasets
- **Indexing**: Strategic indexes for common query patterns

### Caching Strategy

- **Redis Caching**: Frequently accessed data cached in Redis
- **TTL Settings**: Appropriate cache expiration times
- **Cache Invalidation**: Proper cache invalidation on data updates

### Aggregation Pipelines

Complex analytics use MongoDB aggregation pipelines for efficient data processing:

```javascript
// Example: User reputation aggregation
{
    $group: {
        _id: "$user",
        totalReputation: { $sum: "$reputation" },
        questionCount: { $sum: 1 }
    }
}
```