# Database Seeding Script

This script populates the DevOverflow database with realistic mock data featuring Indian developers, questions, answers, and social interactions.

## Overview

The seeding script creates:
- **25 Indian Users** with realistic names, locations, and tech profiles
- **15 Programming Questions** relevant to Indian developers and tech ecosystem
- **51 Answers** with varying quality and expertise levels
- **54 Comments** on questions and answers
- **Social Connections** including following, followers, and friends

## Features

### Indian Context
- Authentic Indian names (Arjun Sharma, Priya Patel, etc.)
- Major Indian cities (Mumbai, Delhi, Bangalore, Chennai, etc.)
- India-specific tech questions and discussions
- Local job market and career insights

### Technical Content
- Questions covering modern web development, mobile apps, AI/ML
- MERN stack, React Native, Flutter, Python, Java, etc.
- AWS deployment, Docker, Kubernetes, blockchain
- Indian startup ecosystem and monetization strategies

### Social Features
- User profiles with bios, locations, and tech tags
- Following/follower relationships
- Friend connections
- Reputation system with badges
- Comments and discussions

## Usage

### Prerequisites
- Node.js installed
- MongoDB connection configured
- Environment variables set (JWT_SECRET, MONGODB_URI)

### Running the Script
```bash
node seedDatabase.js
```

### What Gets Created

#### Users (25 total)
- **Admin User**: Arjun Sharma (first user)
- **Verified Users**: ~70% of users are email verified
- **Reputation Range**: 100-5100 points
- **Locations**: All major Indian cities
- **Tech Tags**: JavaScript, Python, React, Node.js, etc.

#### Questions (15 total)
- JWT Authentication in Node.js
- React Native vs Flutter for Indian market
- MongoDB optimization techniques
- ML with Python for beginners
- REST API security best practices
- Kotlin vs Java for Android
- AWS deployment strategies
- React performance optimization
- Blockchain opportunities in India
- Docker for microservices
- Data Science career paths
- Flutter vs React Native performance
- MERN stack security
- Django vs Flask for startups
- Mobile app monetization in India

#### Answers & Comments
- 2-5 answers per question
- Random voting scores
- Accepted answers on some questions
- Comments on ~50% of content
- Realistic community interactions

## Data Structure

### User Schema
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  isVerified: Boolean,
  reputation: Number,
  profile: {
    fullName: String,
    bio: String,
    location: String,
    tags: [String]
  },
  following: [ObjectId],
  followers: [ObjectId],
  friends: [ObjectId]
}
```

### Question Schema
```javascript
{
  user: ObjectId,
  title: String,
  body: String,
  tags: [String],
  votes: Number,
  answers: [ObjectId],
  comments: [ObjectId]
}
```

## Customization

To modify the mock data:

1. **Add More Users**: Extend the `indianNames` and `indianCities` arrays
2. **Add Questions**: Add to `programmingQuestions` array
3. **Modify Answers**: Update `sampleAnswers` array
4. **Change Social Connections**: Adjust the connection logic in `createSocialConnections()`

## Safety

- **Data Clearing**: Script clears all existing data before seeding
- **Unique Constraints**: Handles username and email uniqueness
- **Error Handling**: Comprehensive error handling and logging
- **Connection Management**: Properly closes database connections

## Testing

After seeding, you can test the API endpoints:

```bash
# Get all questions
GET /api/questions

# Get user profiles
GET /api/users

# Get answers for a question
GET /api/questions/:id/answers
```

## Notes

- All passwords are set to `password123` for testing
- First user (Arjun Sharma) is created as admin
- Questions are tagged with relevant technologies
- Social connections are randomly generated
- Content is focused on Indian tech ecosystem