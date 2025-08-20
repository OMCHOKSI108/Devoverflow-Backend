# Password Reset Testing Guide

## Prerequisites
- Postman or similar API testing tool
- Access to the email account for testing
- MongoDB database connection

## Test Cases

### 1. Request Password Reset

#### Valid Email Test
```http
POST /api/auth/forgot-password
{
    "email": "test@example.com"
}
```
Expected: Success response and email received

#### Rate Limit Test
- Send 4 requests within 1 hour
- Expected: 4th request should be blocked

#### Invalid Email Format
```http
POST /api/auth/forgot-password
{
    "email": "invalid-email"
}
```
Expected: Validation error

### 2. Reset Password

#### Valid Reset
1. Request reset for valid email
2. Get token from email
3. Submit new password:
```http
POST /api/auth/reset-password
{
    "token": "token_from_email",
    "newPassword": "NewSecure123!"
}
```
Expected: Success and able to login with new password

#### Invalid Token Test
```http
POST /api/auth/reset-password
{
    "token": "invalid_token",
    "newPassword": "NewSecure123!"
}
```
Expected: Invalid token error

#### Weak Password Test
```http
POST /api/auth/reset-password
{
    "token": "valid_token",
    "newPassword": "weak"
}
```
Expected: Password validation error

#### Expired Token Test
1. Request reset
2. Wait over 1 hour
3. Try to use token
Expected: Token expired error

## Validation Checklist
- [ ] Reset email received promptly
- [ ] Reset link in email works
- [ ] Rate limiting functions
- [ ] Password requirements enforced
- [ ] Token expiration works
- [ ] Success/error messages clear
- [ ] No user enumeration possible
- [ ] Email notifications working
