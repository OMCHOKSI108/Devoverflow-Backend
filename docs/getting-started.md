# Getting Started

This guide will help you set up the DevOverflow backend API for development and testing.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **MongoDB**: Local installation or MongoDB Atlas account
- **Git**: For version control
- **Postman**: For API testing (optional)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/OMCHOKSI108/Devoverflow-Backend.git
cd Devoverflow-Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/devoverflow
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devoverflow

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# Admin User Configuration
ADMIN_NAME=DevOverflow Admin
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@devoverflow.com
ADMIN_PASSWORD=admin123
ADMIN_LOCATION=Your City

# Google Gemini AI API Keys
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_KEY2=your_backup_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Database Setup

#### Option A: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Update `MONGODB_URI` in `.env`

#### Option B: MongoDB Atlas

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get the connection string and update `MONGODB_URI`

### 5. AI Configuration

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API keys for Gemini AI
3. Add the keys to your `.env` file

### 6. Email Configuration

For email functionality, configure Gmail SMTP:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in `EMAIL_PASS`

## Running the Application

### Development Mode

```bash
npm run dev
```

This starts the server with nodemon for automatic restarts on file changes.

### Production Mode

```bash
npm start
```

### Admin Panel

To run the admin panel:

```bash
npm run admin:install
npm run admin
```

## Testing the API

### Using Postman

1. Import the collection: `POSTMAN/FINAL_ALL_API.json`
2. Import the environment: `POSTMAN/DevOverflow_Environment.postman_environment.json`
3. Set the `base_url` variable to `http://localhost:3000`
4. Register a new user or login to get a JWT token
5. Set the `jwt_token` variable with your token

### Manual Testing

Use curl or any HTTP client:

```bash
# Test server health
curl http://localhost:3000/

# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## Database Seeding

To populate the database with sample data:

```bash
node seedDatabase.js
```

This will create sample users, questions, answers, and comments.

## Development Workflow

1. **Branching**: Create feature branches for new development
2. **Testing**: Test all changes thoroughly
3. **Documentation**: Update this documentation for any API changes
4. **Commits**: Use descriptive commit messages

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the PORT in `.env` or kill the process using the port
2. **Database connection failed**: Check MongoDB is running and URI is correct
3. **AI endpoints failing**: Verify Gemini API keys are valid
4. **Email not sending**: Check Gmail credentials and app password

### Debug Mode

Set `NODE_ENV=development` for detailed error logging.

### Logs

Check console output for error messages and stack traces.

## Next Steps

- Explore the [API Reference](api/users.md) to understand available endpoints
- Review [Authentication](authentication.md) for security implementation
- Check [Data Models](data-models.md) for database schema information