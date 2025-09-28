# Error Handling

This section provides comprehensive information about error handling patterns, status codes, and troubleshooting guidance for the DevOverflow backend API.

## Error Response Format

All API endpoints follow a consistent error response format:

```json
{
    "success": false,
    "message": "Error description",
    "error": {
        "code": "ERROR_CODE",
        "details": "Additional error information",
        "field": "field_name"
    }
}
```

### Error Fields

- **success**: Always `false` for error responses
- **message**: Human-readable error description
- **error**: Optional detailed error information
  - `code`: Machine-readable error code
  - `details`: Additional technical details
  - `field`: Specific field that caused the error (for validation errors)

## HTTP Status Codes

### 2xx Success Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Request successful, no content returned

### 4xx Client Error Codes

- **400 Bad Request**: Invalid request data or parameters
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions for the requested action
- **404 Not Found**: Requested resource does not exist
- **409 Conflict**: Request conflicts with current state (e.g., duplicate data)
- **413 Payload Too Large**: Request body exceeds size limits
- **415 Unsupported Media Type**: Invalid content type
- **422 Unprocessable Entity**: Validation failed
- **429 Too Many Requests**: Rate limit exceeded

### 5xx Server Error Codes

- **500 Internal Server Error**: Unexpected server error
- **502 Bad Gateway**: Invalid response from upstream service
- **503 Service Unavailable**: Service temporarily unavailable
- **504 Gateway Timeout**: Request timeout

## Common Error Scenarios

### Authentication Errors

#### Invalid Token
```json
{
    "success": false,
    "message": "Invalid authentication token",
    "error": {
        "code": "INVALID_TOKEN"
    }
}
```

#### Expired Token
```json
{
    "success": false,
    "message": "Authentication token has expired",
    "error": {
        "code": "TOKEN_EXPIRED"
    }
}
```

#### Missing Token
```json
{
    "success": false,
    "message": "Authentication token required",
    "error": {
        "code": "MISSING_TOKEN"
    }
}
```

### Validation Errors

#### Required Field Missing
```json
{
    "success": false,
    "message": "Title is required",
    "error": {
        "code": "VALIDATION_ERROR",
        "field": "title"
    }
}
```

#### Invalid Format
```json
{
    "success": false,
    "message": "Invalid email format",
    "error": {
        "code": "INVALID_FORMAT",
        "field": "email",
        "details": "Email must be in valid format"
    }
}
```

#### Length Validation
```json
{
    "success": false,
    "message": "Username must be between 3 and 30 characters",
    "error": {
        "code": "LENGTH_ERROR",
        "field": "username",
        "details": "Current length: 2, Required: 3-30"
    }
}
```

### Resource Errors

#### Not Found
```json
{
    "success": false,
    "message": "Question not found",
    "error": {
        "code": "NOT_FOUND",
        "details": "No question exists with ID: 507f1f77bcf86cd799439011"
    }
}
```

#### Already Exists
```json
{
    "success": false,
    "message": "Username already exists",
    "error": {
        "code": "DUPLICATE_ERROR",
        "field": "username"
    }
}
```

#### Permission Denied
```json
{
    "success": false,
    "message": "You do not have permission to edit this question",
    "error": {
        "code": "PERMISSION_DENIED",
        "details": "Only the author or admin can edit this question"
    }
}
```

### Rate Limiting

```json
{
    "success": false,
    "message": "Too many requests. Please try again later.",
    "error": {
        "code": "RATE_LIMIT_EXCEEDED",
        "details": "Limit: 100 requests per hour"
    }
}
```

### Service Unavailable

#### AI Service Down
```json
{
    "success": false,
    "message": "AI service is currently unavailable",
    "error": {
        "code": "SERVICE_UNAVAILABLE",
        "details": "Google Gemini API is not responding"
    }
}
```

#### Database Connection Error
```json
{
    "success": false,
    "message": "Database temporarily unavailable",
    "error": {
        "code": "DATABASE_ERROR"
    }
}
```

## Error Handling Best Practices

### Client-Side Error Handling

#### JavaScript/TypeScript Example

```javascript
const handleApiError = (error) => {
    if (!error.response) {
        // Network error
        showError('Network error. Please check your connection.');
        return;
    }

    const { status, data } = error.response;

    switch (status) {
        case 400:
            handleValidationError(data);
            break;
        case 401:
            handleAuthError(data);
            break;
        case 403:
            showError('You do not have permission to perform this action.');
            break;
        case 404:
            showError('The requested resource was not found.');
            break;
        case 429:
            showError('Too many requests. Please wait before trying again.');
            break;
        case 500:
        case 502:
        case 503:
        case 504:
            showError('Server error. Please try again later.');
            break;
        default:
            showError(data.message || 'An unexpected error occurred.');
    }
};

const handleValidationError = (data) => {
    if (data.error && data.error.field) {
        // Highlight the specific field with error
        highlightField(data.error.field, data.message);
    } else {
        showError(data.message);
    }
};

const handleAuthError = (data) => {
    // Clear stored tokens
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Redirect to login
    window.location.href = '/login';

    showError('Your session has expired. Please log in again.');
};
```

#### React Hook Example

```javascript
import { useState, useCallback } from 'react';

const useApiError = () => {
    const [error, setError] = useState(null);

    const handleError = useCallback((error) => {
        let message = 'An unexpected error occurred';

        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    message = data.message || 'Invalid request';
                    break;
                case 401:
                    message = 'Authentication required';
                    // Handle logout
                    break;
                case 403:
                    message = 'Access denied';
                    break;
                case 404:
                    message = 'Resource not found';
                    break;
                case 422:
                    message = data.message || 'Validation failed';
                    break;
                case 429:
                    message = 'Too many requests. Please wait.';
                    break;
                default:
                    message = data.message || 'Server error';
            }
        } else if (error.request) {
            message = 'Network error. Please check your connection.';
        }

        setError(message);
        return message;
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return { error, handleError, clearError };
};
```

### Retry Logic

#### Exponential Backoff

```javascript
const retryRequest = async (requestFn, maxRetries = 3) => {
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            return await requestFn();
        } catch (error) {
            attempt++;

            if (attempt >= maxRetries) {
                throw error;
            }

            // Check if error is retryable
            if (!isRetryableError(error)) {
                throw error;
            }

            // Exponential backoff: 1s, 2s, 4s...
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

const isRetryableError = (error) => {
    // Retry on network errors and 5xx server errors
    return !error.response ||
           error.response.status >= 500 ||
           error.response.status === 429;
};
```

### Error Monitoring

#### Client-Side Error Reporting

```javascript
const reportError = async (error, context) => {
    try {
        await fetch('/api/errors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                message: error.message,
                stack: error.stack,
                context: {
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                    ...context
                }
            })
        });
    } catch (reportingError) {
        // Silently fail if error reporting fails
        console.error('Failed to report error:', reportingError);
    }
};

// Global error handler
window.addEventListener('error', (event) => {
    reportError(event.error, {
        type: 'javascript_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

// Promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, {
        type: 'unhandled_promise_rejection'
    });
});
```

## Server-Side Error Handling

### Middleware Implementation

```javascript
// Error handling middleware
export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    console.error(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = createError(message, 404, 'INVALID_ID');
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field} already exists`;
        error = createError(message, 400, 'DUPLICATE_ERROR', field);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = createError(message, 400, 'VALIDATION_ERROR');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = createError(message, 401, 'INVALID_TOKEN');
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = createError(message, 401, 'TOKEN_EXPIRED');
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
        error: {
            code: error.code,
            ...(error.field && { field: error.field }),
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

const createError = (message, statusCode, code, field = null) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    if (field) error.field = field;
    return error;
};
```

### Async Error Wrapper

```javascript
// Wrap async route handlers to catch rejected promises
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage in routes
router.get('/users', asyncHandler(async (req, res) => {
    const users = await User.find();
    res.json({
        success: true,
        data: users
    });
}));
```

## Error Codes Reference

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `INVALID_FORMAT` | Invalid data format | 400 |
| `LENGTH_ERROR` | Field length validation failed | 400 |
| `MISSING_TOKEN` | Authentication token missing | 401 |
| `INVALID_TOKEN` | Authentication token invalid | 401 |
| `TOKEN_EXPIRED` | Authentication token expired | 401 |
| `PERMISSION_DENIED` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `DUPLICATE_ERROR` | Resource already exists | 409 |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded | 429 |
| `SERVICE_UNAVAILABLE` | External service unavailable | 503 |
| `DATABASE_ERROR` | Database operation failed | 500 |
| `INTERNAL_ERROR` | Unexpected internal error | 500 |

## Troubleshooting Guide

### Common Issues

#### CORS Errors

**Problem**: Browser blocks API requests due to CORS policy.

**Solution**:
- Ensure CORS middleware is properly configured
- Check `Access-Control-Allow-Origin` header
- Verify preflight OPTIONS requests are handled

#### Token Expiration

**Problem**: API requests fail with 401 after some time.

**Solution**:
- Implement token refresh logic
- Check token expiration time
- Handle token refresh failures gracefully

#### File Upload Issues

**Problem**: File uploads fail or are corrupted.

**Solution**:
- Verify `Content-Type: multipart/form-data`
- Check file size limits
- Validate file types on client and server
- Ensure proper form field names

#### Database Connection Issues

**Problem**: Requests fail with database errors.

**Solution**:
- Check MongoDB connection string
- Verify database server is running
- Check network connectivity
- Review connection pool settings

### Debugging Tools

#### API Testing

```bash
# Test with curl
curl -X GET "http://localhost:5000/api/users" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Test with verbose output
curl -v -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

#### Logging

```javascript
// Add detailed logging to requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params
    });
    next();
});
```

#### Database Debugging

```javascript
// Log all database queries
mongoose.set('debug', true);

// Check database connection
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});
```

## Performance Considerations

### Error Response Optimization

- Keep error messages concise but informative
- Include only necessary error details in production
- Use error codes for programmatic handling
- Avoid exposing sensitive information in errors

### Monitoring and Alerting

- Log all 5xx errors for investigation
- Set up alerts for increased error rates
- Monitor response times for degradation
- Track error patterns for proactive fixes

### Graceful Degradation

```javascript
// Implement fallback behavior
const getDataWithFallback = async () => {
    try {
        return await primaryDataSource();
    } catch (error) {
        console.warn('Primary data source failed, using fallback:', error.message);
        return await fallbackDataSource();
    }
};
```