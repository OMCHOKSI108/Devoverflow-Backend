# Upload API

The Upload API provides secure file upload functionality for the DevOverflow platform. It supports various file types including images and documents, with automatic optimization and cloud storage integration.

## File Upload

### Upload File

Uploads a file to the server with automatic processing and storage.

**Endpoint:** `POST /api/upload`

**Authentication:** Required (Bearer token)

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file`: File to upload (form-data field)

**Supported File Types:**
- Images: `jpg`, `jpeg`, `png`, `gif`
- Documents: `pdf`, `doc`, `docx`

**File Size Limit:** 5MB per file

**Request Example (using curl):**
```bash
curl -X POST \
  http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.jpg"
```

**Response (Production - Cloudinary):**
```json
{
    "success": true,
    "message": "File uploaded successfully",
    "data": {
        "filename": "qa-app-uploads/file-1234567890.jpg",
        "filePath": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/qa-app-uploads/file-1234567890.jpg",
        "fileSize": 245760,
        "mimeType": "image/jpeg",
        "uploadedAt": "2024-01-01T12:00:00.000Z"
    }
}
```

**Response (Development - Local Storage):**
```json
{
    "success": true,
    "message": "File uploaded successfully",
    "data": {
        "filename": "file-1234567890.jpg",
        "filePath": "/uploads/file-1234567890.jpg",
        "fileSize": 245760,
        "mimeType": "image/jpeg",
        "uploadedAt": "2024-01-01T12:00:00.000Z"
    }
}
```

**Status Codes:**
- `200`: File uploaded successfully
- `400`: Invalid file type, file too large, or no file provided
- `401`: Unauthorized
- `500`: Server error

## Storage Configuration

### Production Environment (Cloudinary)

In production, files are automatically uploaded to Cloudinary with the following features:

- **Automatic Optimization:** Images are resized and compressed for web delivery
- **CDN Delivery:** Fast global content delivery
- **Secure Storage:** Files stored in dedicated folder (`qa-app-uploads`)
- **Format Support:** Automatic format optimization and WebP conversion when beneficial

**Cloudinary Configuration Required:**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Development Environment (Local Storage)

In development, files are stored locally in the `uploads/` directory:

- **Local Access:** Files accessible via `/uploads/filename` route
- **No External Dependencies:** Works without cloud service configuration
- **Automatic Cleanup:** Files persist until manually deleted

## File Processing

### Image Optimization

Uploaded images are automatically processed with the following transformations:

- **Resize:** Maximum dimensions of 1000x1000 pixels (maintains aspect ratio)
- **Compression:** Automatic quality optimization (`auto:good`)
- **Format:** Original format preserved unless WebP provides better compression

### Security Features

- **File Type Validation:** Strict whitelist of allowed MIME types and extensions
- **Size Limits:** 5MB maximum file size to prevent abuse
- **Path Sanitization:** Safe filename generation to prevent path traversal attacks
- **Content Verification:** File content validated against declared MIME type

## Error Handling

All upload endpoints follow the standard error response format:

```json
{
    "success": false,
    "message": "Error description"
}
```

Common error scenarios:
- **400 Bad Request**: Invalid file type, file too large, or malformed request
- **401 Unauthorized**: Missing or invalid authentication token
- **500 Server Error**: Storage service unavailable or internal error

### Specific Error Messages

- `"Only images and documents are allowed!"`: File type not in allowed list
- `"File too large"`: File exceeds 5MB limit
- `"No file was uploaded."`: Missing file in request
- `"Cloudinary configuration error"`: Missing cloud storage credentials

## Usage Examples

### JavaScript (Frontend)

```javascript
const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    const result = await response.json();

    if (result.success) {
        console.log('File uploaded:', result.data.filePath);
        // Use result.data.filePath in your application
    }
};
```

### React Hook Example

```javascript
import { useState } from 'react';

const useFileUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const uploadFile = async (file) => {
        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message);
            }

            return result.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setUploading(false);
        }
    };

    return { uploadFile, uploading, error };
};
```

## Rate Limiting

Upload endpoints are subject to rate limiting to prevent abuse. Users should implement appropriate retry logic with exponential backoff for failed requests.

## Best Practices

### Client-Side Validation

Always validate files on the client side before uploading:

```javascript
const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type');
    }

    if (file.size > maxSize) {
        throw new Error('File too large');
    }

    return true;
};
```

### Progress Tracking

For large files, implement upload progress tracking:

```javascript
const uploadWithProgress = (file, onProgress) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                onProgress(percentComplete);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error('Upload failed'));
            }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));

        const formData = new FormData();
        formData.append('file', file);

        xhr.open('POST', '/api/upload');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
    });
};
```

### Error Handling

Implement comprehensive error handling for upload failures:

```javascript
const handleUpload = async (file) => {
    try {
        const result = await uploadFile(file);

        // Handle success
        updateUI(result.data.filePath);

    } catch (error) {
        // Handle different error types
        if (error.message.includes('File too large')) {
            showError('Please select a smaller file (max 5MB)');
        } else if (error.message.includes('Invalid file type')) {
            showError('Please select an image or document file');
        } else {
            showError('Upload failed. Please try again.');
        }
    }
};
```

## Storage Cleanup

The API includes utilities for file cleanup (admin functionality). Files can be deleted programmatically when no longer needed to manage storage costs and maintain data privacy.