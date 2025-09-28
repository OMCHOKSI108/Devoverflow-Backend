# 🚀 DevOverflow Backend Integration Guide for Mobile App Developers

## Welcome Mobile Developer! 👋

This guide will help you integrate your mobile app with the DevOverflow backend API. DevOverflow is a comprehensive Q&A platform with social features, gamification, and AI-powered assistance.

---

## 📋 Prerequisites

### Development Environment
- **React Native** or **Flutter** development environment
- **Node.js** (for testing API calls)
- **Git** for version control
- **API testing tool** (Postman, Insomnia, or similar)

### Required Skills
- RESTful API integration
- JWT authentication handling
- HTTP request/response management
- JSON data parsing
- Error handling and retry logic

---

## 🔗 Backend Connection Details

### Base URL
```
Production: https://your-deployed-backend-url.com
Development: http://localhost:5000 (when running locally)
```

### API Documentation
📖 **Complete API Reference**: [http://127.0.0.1:8000/Devoverflow-Backend/](http://127.0.0.1:8000/Devoverflow-Backend/)

---

## 🔐 Authentication Flow

### 1. User Registration
```javascript
// POST /api/auth/register
const registerData = {
  username: "johndoe",
  name: "John Doe",
  email: "john@example.com",
  password: "securepassword123"
};

fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(registerData)
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    // Registration successful
    console.log('User registered:', data.user);
  }
});
```

### 2. User Login
```javascript
// POST /api/auth/login
const loginData = {
  email: "john@example.com",
  password: "securepassword123"
};

fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(loginData)
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    // Store JWT token securely
    const token = data.token;
    // Use token for authenticated requests
  }
});
```

### 3. Making Authenticated Requests
```javascript
// Include JWT token in Authorization header
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

fetch('/api/questions', { headers })
.then(res => res.json())
.then(data => console.log('Questions:', data));
```

---

## 📱 Core Features Integration

### User Management
- **Profile Management**: Update user profiles, avatars, preferences
- **User Search**: Find users by username, skills, reputation
- **User Stats**: Display reputation, badges, activity metrics

### Q&A System
- **Questions**: Browse, search, ask, edit questions
- **Answers**: Post answers, accept solutions, vote on answers
- **Comments**: Add comments to questions and answers
- **Voting**: Upvote/downvote questions and answers

### Social Features
- **Friends**: Send friend requests, manage connections
- **Groups**: Join/create groups, post group-specific questions
- **Chat**: Real-time messaging between users
- **Notifications**: Receive updates on activities

### Gamification
- **Reputation System**: Track user reputation and levels
- **Badges**: Earn and display achievement badges
- **Leaderboards**: Show top contributors
- **Privileges**: Unlock features based on reputation

### AI Features
- **Smart Suggestions**: Get AI-powered question suggestions
- **Content Moderation**: AI-assisted content filtering
- **Code Analysis**: AI-powered code review and suggestions

---

## 🛠️ Mobile App Integration Steps

### Step 1: Set Up API Client
Create a centralized API client for all backend communications:

```javascript
// apiClient.js
class ApiClient {
  constructor() {
    this.baseURL = 'https://your-backend-url.com';
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Convenience methods
  async get(endpoint) {
    return this.request(endpoint);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

export default new ApiClient();
```

### Step 2: Implement Authentication
```javascript
// authService.js
import apiClient from './apiClient';

class AuthService {
  async register(userData) {
    const response = await apiClient.post('/api/auth/register', userData);
    return response;
  }

  async login(credentials) {
    const response = await apiClient.post('/api/auth/login', credentials);
    if (response.success) {
      apiClient.setToken(response.token);
      // Store token securely (AsyncStorage, SecureStore, etc.)
      await this.storeToken(response.token);
    }
    return response;
  }

  async logout() {
    apiClient.setToken(null);
    await this.removeToken();
  }

  async getCurrentUser() {
    const token = await this.getStoredToken();
    if (token) {
      apiClient.setToken(token);
      try {
        const response = await apiClient.get('/api/auth/me');
        return response.user;
      } catch (error) {
        // Token might be expired
        await this.removeToken();
        throw error;
      }
    }
    return null;
  }

  // Implement secure token storage based on your platform
  async storeToken(token) {
    // React Native: AsyncStorage.setItem('authToken', token)
    // Flutter: SharedPreferences.setString('authToken', token)
  }

  async getStoredToken() {
    // Retrieve token from secure storage
  }

  async removeToken() {
    // Remove token from storage
  }
}

export default new AuthService();
```

### Step 3: Implement Core Features
```javascript
// questionService.js
import apiClient from './apiClient';

class QuestionService {
  async getQuestions(page = 1, limit = 20, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    const response = await apiClient.get(`/api/questions?${params}`);
    return response;
  }

  async getQuestionDetails(questionId) {
    const response = await apiClient.get(`/api/questions/${questionId}`);
    return response;
  }

  async askQuestion(questionData) {
    const response = await apiClient.post('/api/questions', questionData);
    return response;
  }

  async voteQuestion(questionId, voteType) {
    const response = await apiClient.post(`/api/questions/${questionId}/vote`, {
      voteType // 'up' or 'down'
    });
    return response;
  }

  async addBookmark(questionId) {
    const response = await apiClient.post('/api/bookmarks', {
      questionId
    });
    return response;
  }
}

export default new QuestionService();
```

### Step 4: Handle Real-time Features
```javascript
// notificationService.js
import apiClient from './apiClient';

class NotificationService {
  async getNotifications(page = 1, unreadOnly = false) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      unread: unreadOnly.toString()
    });

    const response = await apiClient.get(`/api/notifications?${params}`);
    return response;
  }

  async markAsRead(notificationId) {
    const response = await apiClient.put(`/api/notifications/${notificationId}/read`);
    return response;
  }

  async markAllAsRead() {
    const response = await apiClient.put('/api/notifications/read-all');
    return response;
  }

  // Set up polling for new notifications
  startNotificationPolling(callback, interval = 30000) {
    this.pollingInterval = setInterval(async () => {
      try {
        const notifications = await this.getNotifications(1, true);
        if (notifications.data.unreadCount > 0) {
          callback(notifications.data.notifications);
        }
      } catch (error) {
        console.error('Notification polling error:', error);
      }
    }, interval);
  }

  stopNotificationPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
}

export default new NotificationService();
```

### Step 5: Implement Search
```javascript
// searchService.js
import apiClient from './apiClient';

class SearchService {
  async search(query, filters = {}) {
    const params = new URLSearchParams({
      q: query,
      ...filters
    });

    const response = await apiClient.get(`/api/search?${params}`);
    return response;
  }

  async getSuggestions(partialQuery) {
    const response = await apiClient.get(`/api/search/suggestions?q=${encodeURIComponent(partialQuery)}`);
    return response;
  }

  async getTrendingTopics() {
    const response = await apiClient.get('/api/search/trending');
    return response;
  }
}

export default new SearchService();
```

---

## 📊 Data Synchronization Strategy

### Offline-First Approach
```javascript
// syncService.js
class SyncService {
  async syncData() {
    try {
      // Sync pending actions
      await this.syncPendingActions();

      // Refresh critical data
      await this.refreshUserData();
      await this.refreshNotifications();

      // Update local cache
      await this.updateLocalCache();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  async syncPendingActions() {
    // Sync offline actions: votes, bookmarks, answers, etc.
    const pendingActions = await this.getPendingActions();

    for (const action of pendingActions) {
      try {
        await this.executePendingAction(action);
        await this.removePendingAction(action.id);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }
  }
}
```

### Caching Strategy
```javascript
// cacheService.js
class CacheService {
  async getCachedData(key) {
    // Check if data exists and is fresh
    const cached = await this.getFromStorage(key);
    if (cached && this.isDataFresh(cached.timestamp)) {
      return cached.data;
    }
    return null;
  }

  async setCachedData(key, data, ttl = 300000) { // 5 minutes default
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl
    };
    await this.saveToStorage(key, cacheEntry);
  }

  isDataFresh(timestamp, ttl = 300000) {
    return (Date.now() - timestamp) < ttl;
  }
}
```

---

## 🔧 Error Handling & Retry Logic

### Global Error Handler
```javascript
// errorHandler.js
class ErrorHandler {
  static handleApiError(error, context = '') {
    console.error(`API Error ${context}:`, error);

    // Categorize errors
    if (error.message.includes('Network request failed')) {
      return this.handleNetworkError(error);
    }

    if (error.message.includes('Unauthorized')) {
      return this.handleAuthError(error);
    }

    if (error.message.includes('Not found')) {
      return this.handleNotFoundError(error);
    }

    // Generic error handling
    return {
      type: 'GENERIC_ERROR',
      message: 'Something went wrong. Please try again.',
      originalError: error
    };
  }

  static handleNetworkError(error) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Please check your internet connection and try again.',
      retryable: true
    };
  }

  static handleAuthError(error) {
    // Clear invalid tokens
    authService.logout();
    return {
      type: 'AUTH_ERROR',
      message: 'Your session has expired. Please log in again.',
      action: 'REDIRECT_TO_LOGIN'
    };
  }
}
```

### Retry Mechanism
```javascript
// retryService.js
class RetryService {
  static async withRetry(fn, maxRetries = 3, delay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (!this.isRetryableError(error) || attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt - 1);
        await this.delay(waitTime);
      }
    }

    throw lastError;
  }

  static isRetryableError(error) {
    // Retry on network errors, 5xx server errors
    return error.message.includes('Network') ||
           error.message.includes('timeout') ||
           (error.status >= 500 && error.status < 600);
  }

  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## 📱 Platform-Specific Integration

### React Native Setup
```javascript
// Install dependencies
npm install @react-native-async-storage/async-storage
npm install @react-native-community/netinfo

// Configure API client for React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Add network connectivity checks
class ReactNativeApiClient extends ApiClient {
  async request(endpoint, options = {}) {
    const networkState = await NetInfo.fetch();

    if (!networkState.isConnected) {
      throw new Error('No internet connection');
    }

    return super.request(endpoint, options);
  }
}
```

### Flutter Setup
```dart
// pubspec.yaml
dependencies:
  http: ^1.1.0
  shared_preferences: ^2.2.2
  connectivity_plus: ^5.0.2

// API client implementation
class ApiClient {
  final String baseUrl = 'https://your-backend-url.com';
  String? _token;

  Map<String, String> get headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  Future<Map<String, dynamic>> get(String endpoint) async {
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
    );

    return _handleResponse(response);
  }

  Map<String, dynamic> _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json.decode(response.body);
    } else {
      throw Exception('API Error: ${response.statusCode}');
    }
  }
}
```

---

## 🧪 Testing Your Integration

### API Testing Checklist
- [ ] User registration and login
- [ ] JWT token storage and retrieval
- [ ] Protected endpoint access
- [ ] CRUD operations for questions/answers
- [ ] File upload functionality
- [ ] Real-time notifications
- [ ] Search functionality
- [ ] Error handling for all endpoints

### Sample Test Script
```javascript
// test-integration.js
import apiClient from './apiClient';
import authService from './authService';

async function runIntegrationTests() {
  console.log('🧪 Running DevOverflow API Integration Tests...\n');

  try {
    // Test 1: Registration
    console.log('1. Testing user registration...');
    const registerResult = await authService.register({
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpass123'
    });
    console.log('✅ Registration successful\n');

    // Test 2: Login
    console.log('2. Testing user login...');
    const loginResult = await authService.login({
      email: 'test@example.com',
      password: 'testpass123'
    });
    console.log('✅ Login successful\n');

    // Test 3: Get questions
    console.log('3. Testing questions retrieval...');
    const questions = await apiClient.get('/api/questions');
    console.log(`✅ Retrieved ${questions.data.questions.length} questions\n`);

    // Test 4: Post question
    console.log('4. Testing question creation...');
    const newQuestion = await apiClient.post('/api/questions', {
      title: 'Test question from mobile app',
      body: 'This is a test question to verify API integration',
      tags: ['test', 'api', 'integration']
    });
    console.log('✅ Question created successfully\n');

    console.log('🎉 All integration tests passed!');

  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
}

runIntegrationTests();
```

---

## 🚀 Deployment & Production

### Environment Configuration
```javascript
// config.js
const config = {
  development: {
    apiUrl: 'http://localhost:5000',
    websocketUrl: 'ws://localhost:5000'
  },
  staging: {
    apiUrl: 'https://staging-api.devoverflow.com',
    websocketUrl: 'wss://staging-api.devoverflow.com'
  },
  production: {
    apiUrl: 'https://api.devoverflow.com',
    websocketUrl: 'wss://api.devoverflow.com'
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

### Production Best Practices
- **HTTPS Only**: Always use HTTPS in production
- **Token Security**: Store tokens securely, implement token refresh
- **Rate Limiting**: Respect API rate limits
- **Error Monitoring**: Implement error tracking (Sentry, Crashlytics)
- **Analytics**: Track API usage and user behavior
- **Caching**: Implement intelligent caching strategies
- **Offline Support**: Handle network failures gracefully

---

## 📞 Support & Resources

### Getting Help
- 📖 **API Documentation**: [http://127.0.0.1:8000/Devoverflow-Backend/](http://127.0.0.1:8000/Devoverflow-Backend/)
- 🐛 **Report Issues**: Create GitHub issues for API problems
- 💬 **Community**: Join our developer Discord/Slack
- 📧 **Email Support**: Contact the backend team

### Useful Links
- **Postman Collection**: Import our API collection for testing
- **SDKs**: Check for official mobile SDKs
- **Sample Apps**: View example implementations
- **Changelog**: Stay updated with API changes

---

## 🎯 Next Steps

1. **Set up your development environment**
2. **Review the complete API documentation**
3. **Implement authentication flow**
4. **Build core features (Q&A, social)**
5. **Add advanced features (AI, gamification)**
6. **Test thoroughly with different scenarios**
7. **Prepare for production deployment**

---

**Happy coding! 🚀**

*Remember: The DevOverflow backend is designed to be developer-friendly. If you encounter any issues or need clarification, don't hesitate to reach out to the team.*</content>
<parameter name="filePath">d:\SEM 5\AIML308_Mobile Application Development\PRACTICALS\backend\docs\mobile-developer-integration-guide.md