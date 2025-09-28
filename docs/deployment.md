# Deployment Guide

This guide provides comprehensive instructions for deploying the DevOverflow backend API to various hosting platforms and environments.

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Environment variables configured
- SSL certificate for production
- Domain name (optional)

## Environment Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/devoverflow
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devoverflow

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
JWT_REFRESH_EXPIRE=7d

# Email Configuration (for notifications)
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com

# Google Gemini AI (Optional)
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379

# CORS Configuration
CLIENT_URL=https://yourfrontend.com

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
```

### Security Considerations

- **Never commit `.env` files** to version control
- Use strong, unique secrets for JWT and API keys
- Rotate secrets regularly
- Use environment-specific configurations
- Enable HTTPS in production

## Local Development Setup

### Using Docker

1. **Create Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/flows

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

2. **Create docker-compose.yml**:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - mongo
    volumes:
      - uploads:/app/uploads

  mongo:
    image: mongo:7-jammy
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=devoverflow
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
  uploads:
```

3. **Build and run**:
```bash
docker-compose up -d
```

### Manual Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Start MongoDB**:
```bash
# Using local MongoDB
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7-jammy
```

3. **Start the application**:
```bash
npm start
```

## Production Deployment

### Heroku Deployment

1. **Create Heroku app**:
```bash
heroku create your-app-name
```

2. **Add MongoDB add-on**:
```bash
heroku addons:create mongolab:sandbox
```

3. **Set environment variables**:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret_here
heroku config:set MONGODB_URI=$(heroku config:get MONGODB_URI)
# Add other required environment variables
```

4. **Deploy**:
```bash
git push heroku main
```

5. **Scale the application**:
```bash
heroku ps:scale web=1
```

### Railway Deployment

1. **Connect GitHub repository** to Railway
2. **Add MongoDB database** from Railway dashboard
3. **Configure environment variables** in Railway dashboard
4. **Deploy automatically** on git push

### Render Deployment

1. **Create new Web Service** from Render dashboard
2. **Connect GitHub repository**
3. **Configure build settings**:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Add environment variables**
5. **Add MongoDB instance** or use MongoDB Atlas
6. **Deploy**

### DigitalOcean App Platform

1. **Create new app** from DigitalOcean dashboard
2. **Connect GitHub repository**
3. **Configure app settings**:
   - Resource type: Web Service
   - Build command: `npm install`
   - Run command: `npm start`
4. **Add environment variables**
5. **Add database** (MongoDB or use MongoDB Atlas)
6. **Deploy**

### AWS EC2 Deployment

1. **Launch EC2 instance**:
```bash
# Using AWS CLI
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --count 1 \
  --instance-type t3.micro \
  --key-name your-key-pair \
  --security-groups your-security-group
```

2. **Connect to instance**:
```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

3. **Install Node.js and MongoDB**:
```bash
# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install MongoDB
sudo yum install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

4. **Clone and setup application**:
```bash
git clone https://github.com/yourusername/devoverflow-backend.git
cd devoverflow-backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

5. **Install PM2 for process management**:
```bash
npm install -g pm2
pm2 start app.js --name "devoverflow-api"
pm2 startup
pm2 save
```

6. **Configure Nginx**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Production Deployment

1. **Create production Dockerfile**:
```dockerfile
FROM node:18-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

FROM base AS production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Create uploads directory with proper permissions
RUN mkdir -p uploads/flows && chown -R nextjs:nodejs uploads/

USER nextjs

EXPOSE 5000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
```

2. **Create docker-compose.prod.yml**:
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - mongo
    volumes:
      - uploads:/app/uploads
    restart: unless-stopped

  mongo:
    image: mongo:7-jammy
    environment:
      - MONGO_INITDB_DATABASE=devoverflow
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=secure_password
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    ports:
      - "127.0.0.1:27017:27017"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mongodb_data:
  mongodb_config:
  uploads:
```

3. **Deploy with Docker Compose**:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Database Setup

### MongoDB Atlas (Cloud)

1. **Create cluster** on MongoDB Atlas
2. **Create database user** with read/write permissions
3. **Whitelist IP addresses** (or allow access from anywhere for development)
4. **Get connection string** and update `MONGODB_URI`

### Local MongoDB

1. **Install MongoDB**:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mongodb

# macOS with Homebrew
brew install mongodb-community

# Windows - download from mongodb.com
```

2. **Start MongoDB**:
```bash
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS
```

3. **Create database**:
```bash
mongo devoverflow
```

## SSL/TLS Configuration

### Using Let's Encrypt (Certbot)

1. **Install Certbot**:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. **Obtain certificate**:
```bash
sudo certbot --nginx -d yourdomain.com
```

3. **Auto-renewal**:
```bash
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Manual SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $https;
    }
}
```

## Monitoring and Logging

### Application Monitoring

1. **PM2 Monitoring**:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

2. **Health Check Endpoint**:
```javascript
// Add to app.js
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
```

### Database Monitoring

1. **MongoDB Monitoring**:
```javascript
// Connection monitoring
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});
```

2. **Performance Monitoring**:
```javascript
// Add response time logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });
    next();
});
```

## Backup and Recovery

### Database Backup

1. **Automated MongoDB Backup**:
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db devoverflow --out /backups/devoverflow_$DATE

# Compress backup
tar -czf /backups/devoverflow_$DATE.tar.gz -C /backups devoverflow_$DATE
rm -rf /backups/devoverflow_$DATE
```

2. **Schedule backups**:
```bash
# Add to crontab: 0 2 * * * /path/to/backup-script.sh
```

### File Backup

```bash
# Backup uploads directory
rsync -avz uploads/ /backup/uploads/
```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer Configuration**:
```nginx
upstream backend {
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}
```

2. **Session Management**:
- Use Redis for session storage
- Implement JWT with shared secret
- Configure sticky sessions if needed

### Database Scaling

1. **Read Replicas**:
```javascript
// Configure read preference
const connection = mongoose.createConnection(uri, {
    readPreference: 'secondaryPreferred'
});
```

2. **Sharding**:
- Implement MongoDB sharding for large datasets
- Use compound shard keys for optimal distribution

### Caching Strategy

1. **Redis Implementation**:
```javascript
import redis from 'redis';

const client = redis.createClient(process.env.REDIS_URL);

export const cache = (key, ttl = 3600) => {
    return (req, res, next) => {
        client.get(key, (err, data) => {
            if (data) {
                res.json(JSON.parse(data));
            } else {
                next();
            }
        });
    };
};
```

## Troubleshooting

### Common Deployment Issues

#### Port Already in Use

```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

#### MongoDB Connection Issues

```bash
# Test connection
mongosh "mongodb://localhost:27017/devoverflow"

# Check MongoDB status
sudo systemctl status mongod
```

#### Memory Issues

```bash
# Monitor memory usage
pm2 monit

# Restart application
pm2 restart devoverflow-api
```

#### SSL Certificate Issues

```bash
# Check certificate
openssl s_client -connect yourdomain.com:443

# Renew certificate
sudo certbot renew
```

## Performance Optimization

### Application Level

1. **Enable Gzip Compression**:
```javascript
import compression from 'compression';
app.use(compression());
```

2. **Implement Caching**:
```javascript
import apicache from 'apicache';
app.use(apicache.middleware('5 minutes'));
```

3. **Database Query Optimization**:
```javascript
// Use indexes
Question.collection.createIndex({ createdAt: -1 });
Question.collection.createIndex({ tags: 1 });

// Use lean queries for read-only operations
const questions = await Question.find().lean();
```

### Infrastructure Level

1. **Use CDN** for static assets
2. **Implement Redis** for caching
3. **Use load balancer** for multiple instances
4. **Monitor performance** with APM tools

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database credentials protected
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation enabled
- [ ] Authentication required for sensitive endpoints
- [ ] Security headers configured
- [ ] Regular security updates applied
- [ ] Backup strategy implemented
- [ ] Monitoring and logging enabled