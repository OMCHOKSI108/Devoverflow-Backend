# API Documentation

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### 1. Authentication Endpoints

#### User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePassword123!"
}
```

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "SecurePassword123!"
}
```

#### Password Reset Flow

##### Request Reset
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
    "email": "john@example.com"
}
```

Response:
```json
{
    "success": true,
    "message": "If a user with this email exists, a password reset link will be sent."
}
```

##### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
    "token": "reset_token_from_email",
    "newPassword": "NewSecurePassword123!"
}
```

Response:
```json
{
    "success": true,
    "message": "Password has been reset successfully"
}
```

##### Security Notes
- Rate limited to 3 attempts per hour
- Tokens expire after 1 hour
- Password must meet security requirements:
  - Minimum 8 characters
  - Contains uppercase, lowercase, number, special character

For detailed information about the password reset system, see [Password Reset Documentation](./docs/PASSWORD_RESET.md).
