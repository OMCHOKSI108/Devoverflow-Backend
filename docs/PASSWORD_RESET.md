# Password Reset Documentation

## Overview
The password reset system provides a secure way for users to reset their forgotten passwords through email verification.

## API Endpoints

### 1. Request Password Reset
```http
POST /api/auth/forgot-password
Content-Type: application/json
```

#### Request Body
```json
{
    "email": "user@example.com"
}
```

#### Success Response
```json
{
    "success": true,
    "message": "If a user with this email exists, a password reset link will be sent."
}
```

#### Error Response
```json
{
    "success": false,
    "message": "Error processing password reset request"
}
```

### 2. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json
```

#### Request Body
```json
{
    "token": "reset_token_from_email",
    "newPassword": "NewSecurePassword123!"
}
```

#### Success Response
```json
{
    "success": true,
    "message": "Password has been reset successfully"
}
```

#### Error Responses
```json
{
    "success": false,
    "message": "Password reset token is invalid or has expired"
}
```
```json
{
    "success": false,
    "message": "Password must be at least 8 characters long and contain uppercase, lowercase, number and special character"
}
```

## Security Features

### 1. Rate Limiting
- 3 password reset attempts per hour per IP address
- Helps prevent brute force attacks and spam

### 2. Password Requirements
- Minimum 8 characters
- Must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%*?&)

### 3. Token Security
- Reset tokens are:
  - Cryptographically secure
  - One-time use only
  - Valid for 1 hour
  - Hashed before storage

### 4. Email Security
- Secure email notifications for:
  - Password reset requests
  - Successful password changes
- Generic responses to prevent user enumeration

## Implementation Details

### User Schema Fields
```javascript
{
    passwordResetToken: String,     // Stores hashed reset token
    passwordResetExpires: Date,     // Token expiration timestamp
    lastPasswordReset: Date         // Last successful reset timestamp
}
```

### MongoDB Indexes
```javascript
db.users.createIndex({ "email": 1 });
db.users.createIndex({ "passwordResetToken": 1 });
db.users.createIndex({ "passwordResetExpires": 1 });
```

## Flow Diagram
```
User Request → Rate Limit Check → Generate Token → Send Email → User Clicks Link → Validate Token → Update Password
```

## Error Handling

### Common Error Cases
1. Rate limit exceeded
   - Status: 429
   - Message: "Too many password reset attempts. Please try again in an hour."

2. Invalid/Expired token
   - Status: 400
   - Message: "Password reset token is invalid or has expired"

3. Weak password
   - Status: 400
   - Message: "Password must be at least 8 characters long and contain uppercase, lowercase, number and special character"

4. Server error
   - Status: 500
   - Message: "Error processing password reset request"

## Testing Guidelines

### Test Cases
1. Request reset with:
   - Valid email
   - Invalid email
   - Rate limit exceeded

2. Reset password with:
   - Valid token & strong password
   - Invalid token
   - Expired token
   - Weak password

### Example Test Requests

1. Request Password Reset:
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

2. Reset Password:
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset_token_from_email",
    "newPassword": "NewSecurePassword123!"
  }'
```

## Environment Variables Required
```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM=your_email@gmail.com

# Frontend URL (for reset link)
FRONTEND_URL=http://your-frontend-url
```

## Best Practices Implemented
1. Secure token generation using crypto
2. Token hashing before storage
3. Rate limiting to prevent abuse
4. Password strength validation
5. Secure email communications
6. No user enumeration through responses
7. Proper error handling and logging
8. MongoDB indexes for performance

## Maintenance Notes
1. Monitor failed reset attempts
2. Regular security audits
3. Update password requirements as needed
4. Maintain email deliverability
5. Monitor rate limit effectiveness
