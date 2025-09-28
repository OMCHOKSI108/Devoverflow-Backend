# Authentication

The DevOverflow API uses JSON Web Tokens (JWT) for authentication and authorization. This document explains how to authenticate requests and manage user sessions.

## Overview

Authentication is required for most API endpoints. The system supports:

- User registration and login
- JWT-based session management
- Password reset via email
- Role-based access control (User/Admin)

## Authentication Flow

1. **Register** a new user account
2. **Login** to receive a JWT token
3. **Include token** in subsequent API requests
4. **Refresh token** before expiration (30 days default)

## Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "location": "Mumbai, India"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "user",
      "location": "Mumbai, India",
      "createdAt": "2025-09-28T10:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

**Validation Rules:**
- Name: Required, 2-50 characters
- Email: Required, valid email format
- Password: Required, minimum 6 characters
- Location: Optional

### Login User

Authenticate existing user and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "user",
      "location": "Mumbai, India"
    },
    "token": "jwt_token_here"
  }
}
```

### Get Current User

Retrieve authenticated user's profile information.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "location": "Mumbai, India",
    "createdAt": "2025-09-28T10:00:00.000Z",
    "updatedAt": "2025-09-28T10:00:00.000Z"
  }
}
```

### Update Profile

Update user profile information.

**Endpoint:** `PUT /api/auth/update-profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "location": "Delhi, India"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "user_id",
    "name": "John Smith",
    "email": "john.doe@example.com",
    "location": "Delhi, India"
  }
}
```

### Change Password

Change user password.

**Endpoint:** `PUT /api/auth/change-password`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Forgot Password

Initiate password reset process.

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Reset Password

Complete password reset with token from email.

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Verify Email

Verify user email address.

**Endpoint:** `POST /api/auth/verify-email`

**Request Body:**
```json
{
  "token": "verification_token_from_email"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Resend Verification

Resend email verification link.

**Endpoint:** `POST /api/auth/resend-verification`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

## JWT Token Usage

Include the JWT token in the Authorization header for authenticated requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Token Expiration

- Default expiration: 30 days
- Configurable via `JWT_EXPIRE` environment variable
- Automatic logout on client side when expired

## Security Features

- Password hashing with bcrypt
- JWT token validation
- Rate limiting on authentication endpoints
- Email verification for account activation
- Password reset with secure tokens

## Error Responses

### Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Token Expired
```json
{
  "success": false,
  "message": "Token expired"
}
```

### Unauthorized Access
```json
{
  "success": false,
  "message": "Access denied"
}
```

## Admin Authentication

Admin users have additional privileges. Admin accounts are created automatically during first run with environment variables:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

Admin endpoints require both authentication and admin role.