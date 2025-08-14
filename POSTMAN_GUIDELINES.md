# Complete Postman Testing Guidelines - Mobile Q&A App API

## 🚀 Quick Start Setup

### Step 1: Postman Installation & Setup
1. Download and install Postman from https://www.postman.com/
2. Create a new workspace called "Mobile Q&A API Testing"
3. Create a new collection called "Q&A App API"

### Step 2: Environment Variables Setup
1. Click on "Environments" in Postman
2. Create a new environment called "Q&A Development"
3. Add these variables:
   ```
   baseUrl: http://localhost:3000/api
   token: (will be set after login)
   adminToken: (will be set after admin login)
   adminEmail: (will be set after admin registration)
   adminPassword: (will be set after admin registration)
   questionId: (will be set after creating questions)
   answerId: (will be set after creating answers)
   userId: (will be set after registration)
   ```

## 📋 Complete Testing Workflow - Adding 10 Sample Data Blocks

### Phase 1: User Registration (10 Users)

#### 1.1 Register User 1 (Test with Real Email)
- **Method**: POST
- **URL**: `{{baseUrl}}/auth/register`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "username": "kaustavtest",
    "email": "kaustavdas758@gmail.com",
    "password": "password123"
  }
  ```
- **Tests** (Add in Tests tab):
  ```javascript
  pm.test("User registration successful", function () {
      pm.response.to.have.status(201);
      const responseJson = pm.response.json();
      pm.environment.set("token", responseJson.data.token);
      pm.environment.set("userId", responseJson.data.user.id);
      
      // Check that user is NOT verified initially
      pm.test("User should not be verified initially", function () {
          pm.expect(responseJson.data.user.isVerified).to.eql(false);
      });
      
      // Check that email sent confirmation is true
      pm.test("Email sent confirmation", function () {
          pm.expect(responseJson.emailSent).to.eql(true);
      });
  });
  ```

#### 1.2 Register Users 2-10
Repeat the above process with these user data:

**User 2:**
```json
{
  "username": "jane_coder",
  "email": "jane@example.com",
  "password": "password123"
}
```

**User 3:**
```json
{
  "username": "bob_programmer",
  "email": "bob@example.com",
  "password": "password123"
}
```

**User 4:**
```json
{
  "username": "alice_engineer",
  "email": "alice@example.com",
  "password": "password123"
}
```

**User 5:**
```json
{
  "username": "charlie_dev",
  "email": "charlie@example.com",
  "password": "password123"
}
```

**User 6:**
```json
{
  "username": "diana_coder",
  "email": "diana@example.com",
  "password": "password123"
}
```

**User 7:**
```json
{
  "username": "eve_programmer",
  "email": "eve@example.com",
  "password": "password123"
}
```

**User 8:**
```json
{
  "username": "frank_engineer",
  "email": "frank@example.com",
  "password": "password123"
}
```

**User 9:**
```json
{
  "username": "grace_dev",
  "email": "grace@example.com",
  "password": "password123"
}
```

**User 10:**
```json
{
  "username": "admin_user",
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Phase 2: Email Verification Testing

#### 2.1 Check Email Inbox
After registration, check your email inbox (and spam folder) for the verification email from the Q&A App.

#### 2.2 Verify Email Address
- **Method**: GET
- **URL**: Copy the verification link from your email
  - Format: `http://localhost:3000/api/auth/verify/{your-verification-token}`
- **Headers**: None needed (public endpoint)
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Email verified successfully! You can now use all features of the app.",
    "user": {
      "id": "user-id",
      "username": "kaustavtest",
      "email": "kaustavdas758@gmail.com",
      "isVerified": true,
      "verifiedAt": "2025-08-02T10:30:00.000Z"
    }
  }
  ```

#### 2.3 Verify User Status After Email Verification
- **Method**: GET
- **URL**: `{{baseUrl}}/auth/me`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  ```
- **Tests**:
  ```javascript
  pm.test("User should be verified after email verification", function () {
      pm.response.to.have.status(200);
      const responseJson = pm.response.json();
      pm.expect(responseJson.data.user.isVerified).to.eql(true);
      pm.expect(responseJson.data.user.emailVerifiedAt).to.not.be.undefined;
  });
  ```

### Phase 2.5: Admin Registration & Setup (IMPORTANT for Testing Admin Features)

#### Option A: Direct Admin Registration (Recommended)

##### 2.5.1 Register Admin User
**⚠️ This creates a new admin user that needs email verification like regular users**

- **Method**: POST
- **URL**: `{{baseUrl}}/auth/register-admin`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "username": "admin_kaustav",
    "email": "admin.kaustav@gmail.com",
    "password": "admin123456",
    "adminSecret": "ADMIN_SETUP_SECRET_2025"
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Admin registration successful", function () {
      pm.response.to.have.status(201);
      const responseJson = pm.response.json();
      pm.environment.set("adminToken", responseJson.data.token);
      pm.environment.set("adminEmail", responseJson.data.user.email);
      pm.environment.set("adminPassword", "admin123456");
      
      // Check that user is admin but NOT verified initially
      pm.test("User should be admin but not verified initially", function () {
          pm.expect(responseJson.data.user.isAdmin).to.eql(true);
          pm.expect(responseJson.data.user.isVerified).to.eql(false);
      });
      
      // Check that email sent confirmation is true
      pm.test("Admin verification email sent", function () {
          pm.expect(responseJson.emailSent).to.eql(true);
      });
  });
  ```

##### 2.5.2 Verify Admin Email Address
**📧 Check your admin email inbox for verification email**

- **Method**: GET
- **URL**: Copy the verification link from admin email
  - Format: `http://localhost:3000/api/auth/verify/{admin-verification-token}`
- **Headers**: None needed (public endpoint)
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "Email verified successfully! You can now use all features of the app.",
    "user": {
      "id": "admin-user-id",
      "username": "admin_kaustav",
      "email": "admin.kaustav@gmail.com",
      "isVerified": true,
      "verifiedAt": "2025-08-02T10:30:00.000Z"
    }
  }
  ```

##### 2.5.3 Login as Admin (After Email Verification)
- **Method**: POST
- **URL**: `{{baseUrl}}/auth/login`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "email": "admin.kaustav@gmail.com",
    "password": "admin123456"
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Admin login successful after verification", function () {
      pm.response.to.have.status(200);
      const responseJson = pm.response.json();
      pm.environment.set("adminToken", responseJson.data.token);
      
      // Verify admin status and email verification
      pm.expect(responseJson.data.user.isAdmin).to.eql(true);
      pm.expect(responseJson.data.user.isVerified).to.eql(true);
  });
  ```

#### Option B: Setup Existing User as Admin (Alternative)

##### 2.5.3 Setup Existing User as Admin
**⚠️ Use this if you want to make an existing user an admin**

- **Method**: POST
- **URL**: `{{baseUrl}}/auth/setup-admin`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "email": "kaustavdas758@gmail.com",
    "adminSecret": "MAKE_ME_ADMIN_2025"
  }
  ```
- **Tests**:
  ```javascript
  pm.test("User granted admin privileges", function () {
      pm.response.to.have.status(200);
      const responseJson = pm.response.json();
      pm.expect(responseJson.data.user.isAdmin).to.eql(true);
  });
  ```

**📝 Notes about Admin Setup:**
- **Option A (register-admin)**: Creates a new admin user, requires email verification before login works
- **Option B (setup-admin)**: Converts existing user to admin, requires existing user token
- The admin registration uses secret key `ADMIN_SETUP_SECRET_2025` for security
- **Admin users must verify their email** before they can access admin features in Phase 10
- After email verification, admin users can login with email/password
- Save the admin email and password in Postman environment variables for easy reuse
- **Important**: Check your email (including spam folder) for admin verification email

### Phase 3: User Login & Token Collection

#### 3.1 Login User 1
- **Method**: POST
- **URL**: `{{baseUrl}}/auth/login`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "email": "kaustavdas758@gmail.com",
    "password": "password123"
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Login successful", function () {
      pm.response.to.have.status(200);
      const responseJson = pm.response.json();
      pm.environment.set("token", responseJson.token);
  });
  ```

*Note: Repeat login for all 10 users and save their tokens separately for creating diverse content*

### Phase 4: Creating 10 Questions

#### 4.1 Question 1 (JWT Authentication)
- **Method**: POST
- **URL**: `{{baseUrl}}/questions`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "title": "How to implement JWT authentication in Node.js?",
    "body": "I am building a REST API and need to implement secure authentication using JSON Web Tokens. Can someone guide me through the process? I want to understand the best practices for token generation, verification, and storage.",
    "tags": ["nodejs", "jwt", "authentication", "security"]
  }
  ```

#### 3.2 Question 2 (React State Management)
- **Body**:
  ```json
  {
    "title": "Best practices for React state management?",
    "body": "I have a large React application and I am struggling with state management. Should I use Redux, Context API, or something else? What are the pros and cons of each approach?",
    "tags": ["react", "state-management", "redux", "context-api"]
  }
  ```

#### 3.3 Question 3 (MongoDB Optimization)
- **Body**:
  ```json
  {
    "title": "MongoDB aggregation pipeline optimization",
    "body": "My MongoDB queries are running slow with large datasets. How can I optimize aggregation pipelines for better performance? Are there specific indexes I should create?",
    "tags": ["mongodb", "aggregation", "performance", "database"]
  }
  ```

#### 3.4 Question 4 (Express.js Error Handling)
- **Body**:
  ```json
  {
    "title": "Express.js middleware error handling",
    "body": "What is the best way to handle errors in Express.js middleware? I want to create a centralized error handling system that can handle different types of errors gracefully.",
    "tags": ["expressjs", "middleware", "error-handling", "nodejs"]
  }
  ```

#### 3.5 Question 5 (Docker Containerization)
- **Body**:
  ```json
  {
    "title": "Docker containerization for Node.js apps",
    "body": "I want to containerize my Node.js application using Docker. What are the best practices for creating efficient Docker images? How can I optimize build times and image sizes?",
    "tags": ["docker", "nodejs", "containerization", "devops"]
  }
  ```

#### 3.6 Question 6 (JavaScript Async/Await)
- **Body**:
  ```json
  {
    "title": "JavaScript async/await vs Promises",
    "body": "When should I use async/await versus traditional Promises? What are the performance implications of each approach? Are there scenarios where one is clearly better than the other?",
    "tags": ["javascript", "async-await", "promises", "asynchronous"]
  }
  ```

#### 3.7 Question 7 (TypeScript Generics)
- **Body**:
  ```json
  {
    "title": "TypeScript generic types best practices",
    "body": "I am learning TypeScript and struggling with generic types. Can someone explain when and how to use them effectively? What are some common patterns and use cases?",
    "tags": ["typescript", "generics", "types", "javascript"]
  }
  ```

#### 3.8 Question 8 (API Versioning)
- **Body**:
  ```json
  {
    "title": "REST API versioning strategies",
    "body": "What are the different approaches to API versioning? Should I use URL versioning, header versioning, or something else? What are the trade-offs of each approach?",
    "tags": ["api", "versioning", "rest", "backend"]
  }
  ```

#### 3.9 Question 9 (React Native Navigation)
- **Body**:
  ```json
  {
    "title": "React Native navigation patterns",
    "body": "I am building a React Native app and need to implement complex navigation. What are the current best practices? Should I use React Navigation 6 or are there better alternatives?",
    "tags": ["react-native", "navigation", "mobile", "routing"]
  }
  ```

#### 3.10 Question 10 (GraphQL vs REST)
- **Body**:
  ```json
  {
    "title": "GraphQL vs REST API comparison",
    "body": "I am trying to decide between GraphQL and REST for my new project. What are the pros and cons of each approach? In what scenarios would you choose one over the other?",
    "tags": ["graphql", "rest", "api", "comparison"]
  }
  ```

**Important**: After each question creation, save the returned question ID for the next phases.

### Phase 4: Creating 10 Answers

#### 4.1 Answer to Question 1 (JWT)
- **Method**: POST
- **URL**: `{{baseUrl}}/answers/{{questionId}}`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "body": "For JWT authentication in Node.js, you should use the jsonwebtoken library. Here's a basic implementation:\n\n```javascript\nconst jwt = require('jsonwebtoken');\n\n// Generate token\nconst token = jwt.sign(\n  { userId: user.id, email: user.email }, \n  process.env.JWT_SECRET, \n  { expiresIn: '7d' }\n);\n\n// Verify token\nconst decoded = jwt.verify(token, process.env.JWT_SECRET);\n```\n\nBest practices:\n1. Store the secret securely in environment variables\n2. Set appropriate expiration times\n3. Include only necessary data in the payload\n4. Use HTTPS in production\n5. Implement token refresh mechanism"
  }
  ```

#### 4.2 Answer to Question 2 (React State)
- **Body**:
  ```json
  {
    "body": "For React state management, choose based on your app complexity:\n\n**Small apps (< 5 components):**\n- useState and useContext\n- Built-in React state is sufficient\n\n**Medium apps (5-15 components):**\n- Context API with useReducer\n- Provides centralized state without external dependencies\n\n**Large apps (15+ components):**\n- Redux Toolkit (modern Redux)\n- Zustand (lightweight alternative)\n- Jotai (atomic state management)\n\n**When to use each:**\n- Redux: Complex state logic, time-travel debugging needed\n- Context: Simple global state, avoid prop drilling\n- Local state: Component-specific data\n\nStart simple and scale up as needed!"
  }
  ```

#### 4.3 Answer to Question 3 (MongoDB)
- **Body**:
  ```json
  {
    "body": "MongoDB aggregation optimization strategies:\n\n**1. Pipeline Order Matters:**\n```javascript\n// Good - filter early\n[\n  { $match: { status: 'active', category: 'tech' } },\n  { $sort: { createdAt: -1 } },\n  { $limit: 100 },\n  { $project: { title: 1, author: 1, createdAt: 1 } }\n]\n```\n\n**2. Index Strategy:**\n- Create compound indexes for $match fields\n- Index fields used in $sort\n- Use explain() to analyze query performance\n\n**3. Optimization Tips:**\n- Use $match as early as possible\n- Limit fields with $project\n- Use $limit to reduce processing\n- Consider $facet for multiple aggregations\n- Use allowDiskUse for large datasets\n\n**4. Monitor Performance:**\n```javascript\ndb.collection.aggregate(pipeline).explain('executionStats')\n```"
  }
  ```

#### 4.4 Answer to Question 4 (Express Error Handling)
- **Body**:
  ```json
  {
    "body": "Create a centralized error handling system in Express.js:\n\n**1. Custom Error Class:**\n```javascript\nclass AppError extends Error {\n  constructor(message, statusCode) {\n    super(message);\n    this.statusCode = statusCode;\n    this.isOperational = true;\n  }\n}\n```\n\n**2. Global Error Middleware:**\n```javascript\napp.use((err, req, res, next) => {\n  let { statusCode = 500, message } = err;\n  \n  // Handle different error types\n  if (err.name === 'ValidationError') {\n    statusCode = 400;\n    message = Object.values(err.errors).map(e => e.message).join(', ');\n  }\n  \n  if (err.code === 11000) {\n    statusCode = 400;\n    message = 'Duplicate field value';\n  }\n  \n  res.status(statusCode).json({\n    success: false,\n    message,\n    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })\n  });\n});\n```\n\n**3. Usage in Routes:**\n```javascript\nconst catchAsync = (fn) => (req, res, next) => {\n  Promise.resolve(fn(req, res, next)).catch(next);\n};\n\napp.get('/api/users', catchAsync(async (req, res, next) => {\n  const users = await User.find();\n  if (!users) {\n    return next(new AppError('No users found', 404));\n  }\n  res.json({ success: true, data: users });\n}));\n```"
  }
  ```

#### 4.5 Answer to Question 5 (Docker)
- **Body**:
  ```json
  {
    "body": "Docker best practices for Node.js applications:\n\n**1. Multi-stage Dockerfile:**\n```dockerfile\n# Build stage\nFROM node:18-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\n\n# Production stage\nFROM node:18-alpine AS production\nWORKDIR /app\n\n# Create non-root user\nRUN addgroup -g 1001 -S nodejs\nRUN adduser -S nodejs -u 1001\n\n# Copy dependencies and source\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY . .\n\n# Set ownership\nRUN chown -R nodejs:nodejs /app\nUSER nodejs\n\nEXPOSE 3000\nCMD [\"npm\", \"start\"]\n```\n\n**2. .dockerignore:**\n```\nnode_modules\nnpm-debug.log\n.git\n.gitignore\nREADME.md\n.env\n.nyc_output\ncoverage\n.vscode\n```\n\n**3. Optimization Tips:**\n- Use alpine images for smaller size\n- Run as non-root user for security\n- Copy package.json first for better layer caching\n- Use npm ci instead of npm install\n- Set NODE_ENV=production\n- Use health checks\n- Implement graceful shutdown"
  }
  ```

#### 4.6 Answer to Question 6 (Async/Await vs Promises)
- **Body**:
  ```json
  {
    "body": "async/await vs Promises - when to use each:\n\n**Use async/await when:**\n```javascript\n// Sequential operations - more readable\nasync function processUser(userId) {\n  try {\n    const user = await fetchUser(userId);\n    const profile = await fetchProfile(user.id);\n    const preferences = await fetchPreferences(user.id);\n    return { user, profile, preferences };\n  } catch (error) {\n    console.error('Error processing user:', error);\n    throw error;\n  }\n}\n```\n\n**Use Promises when:**\n```javascript\n// Parallel operations\nconst processUserParallel = (userId) => {\n  return Promise.all([\n    fetchUser(userId),\n    fetchProfile(userId),\n    fetchPreferences(userId)\n  ]).then(([user, profile, preferences]) => {\n    return { user, profile, preferences };\n  });\n};\n\n// Complex chaining with transformations\nfetchData()\n  .then(data => transformData(data))\n  .then(transformed => validateData(transformed))\n  .then(validated => saveData(validated))\n  .catch(handleError);\n```\n\n**Performance:** Both have similar performance. async/await is syntactic sugar over Promises.\n\n**Error Handling:**\n- async/await: Use try/catch (more familiar)\n- Promises: Use .catch() (more explicit)\n\n**Recommendation:** Use async/await for readability, Promises for parallel operations and complex chains."
  }
  ```

#### 4.7 Answer to Question 7 (TypeScript Generics)
- **Body**:
  ```json
  {
    "body": "TypeScript generics provide type safety and reusability:\n\n**1. Basic Generic Function:**\n```typescript\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n\n// Usage\nconst stringResult = identity<string>('hello'); // Type: string\nconst numberResult = identity<number>(42);      // Type: number\n```\n\n**2. Generic Interfaces:**\n```typescript\ninterface ApiResponse<T> {\n  data: T;\n  status: number;\n  message: string;\n}\n\ninterface User {\n  id: string;\n  name: string;\n}\n\n// Usage\nconst userResponse: ApiResponse<User> = {\n  data: { id: '1', name: 'John' },\n  status: 200,\n  message: 'Success'\n};\n```\n\n**3. Generic Classes:**\n```typescript\nclass Repository<T> {\n  private items: T[] = [];\n  \n  add(item: T): void {\n    this.items.push(item);\n  }\n  \n  findById(id: string): T | undefined {\n    return this.items.find(item => (item as any).id === id);\n  }\n}\n\nconst userRepo = new Repository<User>();\nconst productRepo = new Repository<Product>();\n```\n\n**4. Constraints:**\n```typescript\ninterface HasId {\n  id: string;\n}\n\nfunction updateEntity<T extends HasId>(entity: T, updates: Partial<T>): T {\n  return { ...entity, ...updates };\n}\n```\n\n**When to use:**\n- Creating reusable components/functions\n- Working with collections of different types\n- API responses with varying data types\n- Utility functions that work with multiple types"
  }
  ```

#### 4.8 Answer to Question 8 (API Versioning)
- **Body**:
  ```json
  {
    "body": "API versioning strategies comparison:\n\n**1. URL Versioning (Recommended):**\n```\nGET /api/v1/users\nGET /api/v2/users\n```\n**Pros:** Simple, cacheable, discoverable\n**Cons:** URL pollution, more routes to maintain\n\n**2. Header Versioning:**\n```\nGET /api/users\nHeaders: Accept-Version: v1\n```\n**Pros:** Clean URLs, flexible\n**Cons:** Less discoverable, caching complexity\n\n**3. Query Parameter:**\n```\nGET /api/users?version=1\n```\n**Pros:** Simple to implement\n**Cons:** Can be ignored, not RESTful\n\n**4. Media Type Versioning:**\n```\nAccept: application/vnd.api+json;version=1\n```\n**Pros:** RESTful, content negotiation\n**Cons:** Complex, less obvious\n\n**Implementation Strategy:**\n```javascript\n// Express.js URL versioning\napp.use('/api/v1', v1Routes);\napp.use('/api/v2', v2Routes);\n\n// Header versioning middleware\napp.use((req, res, next) => {\n  const version = req.headers['api-version'] || 'v1';\n  req.apiVersion = version;\n  next();\n});\n```\n\n**Best Practices:**\n- Start with URL versioning for simplicity\n- Version only when breaking changes occur\n- Maintain backward compatibility when possible\n- Document deprecation timeline\n- Use semantic versioning (v1, v2, not v1.1)\n- Consider API lifecycle management"
  }
  ```

#### 4.9 Answer to Question 9 (React Native Navigation)
- **Body**:
  ```json
  {
    "body": "React Native navigation with React Navigation 6 (current best practice):\n\n**1. Installation:**\n```bash\nnpm install @react-navigation/native\nnpm install react-native-screens react-native-safe-area-context\nnpm install @react-navigation/stack\nnpm install @react-navigation/bottom-tabs\nnpm install @react-navigation/drawer\n```\n\n**2. Basic Stack Navigation:**\n```javascript\nimport { NavigationContainer } from '@react-navigation/native';\nimport { createStackNavigator } from '@react-navigation/stack';\n\nconst Stack = createStackNavigator();\n\nfunction App() {\n  return (\n    <NavigationContainer>\n      <Stack.Navigator initialRouteName=\"Home\">\n        <Stack.Screen name=\"Home\" component={HomeScreen} />\n        <Stack.Screen name=\"Details\" component={DetailsScreen} />\n      </Stack.Navigator>\n    </NavigationContainer>\n  );\n}\n```\n\n**3. Complex Navigation Structure:**\n```javascript\n// Combine different navigators\nconst Tab = createBottomTabNavigator();\nconst Drawer = createDrawerNavigator();\n\nfunction TabNavigator() {\n  return (\n    <Tab.Navigator>\n      <Tab.Screen name=\"Home\" component={HomeStack} />\n      <Tab.Screen name=\"Profile\" component={ProfileStack} />\n    </Tab.Navigator>\n  );\n}\n\nfunction AppNavigator() {\n  return (\n    <NavigationContainer>\n      <Drawer.Navigator>\n        <Drawer.Screen name=\"Tabs\" component={TabNavigator} />\n        <Drawer.Screen name=\"Settings\" component={SettingsScreen} />\n      </Drawer.Navigator>\n    </NavigationContainer>\n  );\n}\n```\n\n**4. Navigation Best Practices:**\n- Use TypeScript for type-safe navigation\n- Implement deep linking\n- Handle authentication flows\n- Use navigation state persistence\n- Optimize performance with lazy loading\n\n**5. Performance Tips:**\n```javascript\n// Lazy load screens\nconst LazyScreen = lazy(() => import('./LazyScreen'));\n\n// Use native stack for better performance\nimport { createNativeStackNavigator } from '@react-navigation/native-stack';\n```"
  }
  ```

#### 4.10 Answer to Question 10 (GraphQL vs REST)
- **Body**:
  ```json
  {
    "body": "GraphQL vs REST - comprehensive comparison:\n\n**GraphQL Advantages:**\n✅ **Single endpoint** - one URL for all operations\n✅ **Client specifies data** - no over/under-fetching\n✅ **Strong type system** - self-documenting schema\n✅ **Real-time subscriptions** - built-in WebSocket support\n✅ **Introspection** - queryable schema\n\n```graphql\n# GraphQL query - get exactly what you need\nquery {\n  user(id: \"1\") {\n    name\n    posts(first: 5) {\n      title\n      comments(first: 3) {\n        text\n      }\n    }\n  }\n}\n```\n\n**REST Advantages:**\n✅ **Simple and familiar** - easy to understand\n✅ **Better caching** - HTTP caching works naturally\n✅ **Easier debugging** - standard HTTP tools\n✅ **Mature ecosystem** - lots of tools and libraries\n✅ **Stateless** - each request independent\n\n```javascript\n// REST - multiple requests often needed\nGET /api/users/1\nGET /api/users/1/posts?limit=5\nGET /api/posts/123/comments?limit=3\n```\n\n**When to choose GraphQL:**\n- Mobile apps (bandwidth constraints)\n- Complex data relationships\n- Multiple client types (web, mobile, IoT)\n- Rapid frontend development\n- Real-time features needed\n\n**When to choose REST:**\n- Simple CRUD operations\n- Team familiar with REST\n- Existing REST infrastructure\n- File uploads/downloads\n- Simple caching requirements\n- Microservices architecture\n\n**Hybrid Approach:**\nMany companies use both:\n- REST for simple operations\n- GraphQL for complex queries\n- REST for file operations\n- GraphQL for real-time features\n\n**Performance:**\n- GraphQL: Better for mobile (fewer requests)\n- REST: Better for simple operations (less overhead)\n\n**Learning Curve:**\n- GraphQL: Steeper learning curve\n- REST: Easier to get started\n\n**Recommendation:** Start with REST for MVP, consider GraphQL as your data needs become more complex."
  }
  ```

### Phase 5: Adding 10 Comments

#### 5.1 Comment on Question 1
- **Method**: POST
- **URL**: `{{baseUrl}}/comments/question/{{questionId}}`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "body": "Great question! JWT authentication is fundamental for modern web applications. I'd also recommend looking into refresh token strategies for better security."
  }
  ```

#### 5.2 Comment on Question 2
- **Body**:
  ```json
  {
    "body": "Thanks for this detailed explanation! The comparison between different state management solutions really helped me understand when to use each approach."
  }
  ```

#### 5.3 Comment on Answer 1
- **Method**: POST
- **URL**: `{{baseUrl}}/comments/answer/{{answerId}}`
- **Body**:
  ```json
  {
    "body": "Excellent implementation! I would also suggest adding rate limiting to prevent brute force attacks on the authentication endpoints."
  }
  ```

#### 5.4 Comment on Question 3
- **Body**:
  ```json
  {
    "body": "MongoDB performance optimization is crucial for large applications. Have you considered using MongoDB Atlas for automatic index suggestions?"
  }
  ```

#### 5.5 Comment on Question 4
- **Body**:
  ```json
  {
    "body": "Error handling is often overlooked but so important! Your centralized approach looks very clean and maintainable."
  }
  ```

#### 5.6 Comment on Question 5
- **Body**:
  ```json
  {
    "body": "Docker containerization has been a game-changer for our deployment process. Multi-stage builds really help keep image sizes down."
  }
  ```

#### 5.7 Comment on Question 6
- **Body**:
  ```json
  {
    "body": "Perfect timing! I was just working on this exact problem yesterday. The parallel vs sequential explanation is very clear."
  }
  ```

#### 5.8 Comment on Question 7
- **Body**:
  ```json
  {
    "body": "TypeScript generics were confusing at first, but this explanation with practical examples makes it much clearer. Thanks!"
  }
  ```

#### 5.9 Comment on Question 8
- **Body**:
  ```json
  {
    "body": "API versioning strategy is critical for maintaining backward compatibility. URL versioning seems like the most straightforward approach."
  }
  ```

#### 5.10 Comment on Question 9
- **Body**:
  ```json
  {
    "body": "React Navigation 6 has really improved the developer experience. The type safety additions are particularly helpful for larger apps."
  }
  ```

### Phase 6: Testing Voting System (10 Votes)

#### 6.1 Vote on Question 1
- **Method**: POST
- **URL**: `{{baseUrl}}/questions/{{questionId}}/vote`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "voteType": "up"
  }
  ```

*Repeat for all 10 questions with different vote types (up/down) using different user tokens*

#### 6.2 Vote on Answer 1
- **Method**: POST
- **URL**: `{{baseUrl}}/answers/{{answerId}}/vote`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "voteType": "up"
  }
  ```

### Phase 7: Testing Bookmark System (10 Bookmarks)

#### 7.1 Bookmark Question 1
- **Method**: POST
- **URL**: `{{baseUrl}}/bookmarks/{{questionId}}`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  ```

*Repeat for all 10 questions using different user tokens*

### Phase 8: Testing AI Features

#### 8.1 AI Answer Suggestion
- **Method**: POST
- **URL**: `{{baseUrl}}/ai/answer-suggestion`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "questionTitle": "How to optimize React performance?",
    "questionBody": "My React app is running slowly with large lists. What are the best optimization techniques?",
    "tags": ["react", "performance", "optimization"]
  }
  ```

#### 8.2 AI Tag Suggestions
- **Method**: POST
- **URL**: `{{baseUrl}}/ai/tag-suggestions`
- **Body**:
  ```json
  {
    "questionTitle": "Building scalable microservices architecture",
    "questionBody": "I need to design a microservices architecture for a large e-commerce platform. What are the key considerations?"
  }
  ```

### Phase 9: Testing File Upload

#### 9.1 Upload File
- **Method**: POST
- **URL**: `{{baseUrl}}/upload`
- **Headers**: 
  ```
  Authorization: Bearer {{token}}
  ```
- **Body**: form-data
  - Key: `file`
  - Value: Select a file (image/document)

### Phase 10: Testing Admin Features

**⚠️ Important**: Use the admin token from Phase 2.5 for all admin requests!

#### 10.1 Create Content Report
- **Method**: POST
- **URL**: `{{baseUrl}}/admin/reports`
- **Headers**: 
  ```
  Authorization: Bearer {{adminToken}}
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "contentId": "{{questionId}}",
    "contentType": "question",
    "reason": "This content appears to be spam"
  }
  ```

#### 10.2 Get Comprehensive Admin Dashboard Statistics
- **Method**: GET
- **URL**: `{{baseUrl}}/admin/stats`
- **Headers**: 
  ```
  Authorization: Bearer {{adminToken}}
  ```
- **Expected Response Structure**:
  ```json
  {
    "success": true,
    "message": "Admin dashboard statistics retrieved successfully",
    "data": {
      "totals": {
        "users": 50,
        "questions": 120,
        "answers": 340,
        "comments": 89,
        "reports": 5
      },
      "userStats": {
        "total": 50,
        "verified": 45,
        "unverified": 5,
        "admins": 2,
        "regular": 48,
        "verificationRate": 90
      },
      "contentStats": {
        "questions": {
          "total": 120,
          "answered": 95,
          "unanswered": 25,
          "answerRate": 79
        },
        "answers": {
          "total": 340,
          "accepted": 89,
          "unaccepted": 251,
          "acceptanceRate": 26,
          "averagePerQuestion": 2.83
        },
        "comments": 89
      },
      "activity": {
        "today": {
          "users": 3,
          "questions": 8,
          "answers": 15,
          "comments": 4,
          "total": 30
        },
        "thisWeek": {
          "users": 12,
          "questions": 35,
          "answers": 78,
          "comments": 23,
          "total": 148
        }
      },
      "growth": {
        "users": {
          "today": 3,
          "yesterday": 2,
          "growthRate": 50,
          "trend": "up"
        }
      },
      "topPerformers": {
        "usersByReputation": [...],
        "questionsByVotes": [...],
        "answersByVotes": [...],
        "mostActiveUsers": [...]
      },
      "insights": {
        "popularTags": [
          {"tag": "javascript", "count": 25},
          {"tag": "python", "count": 18}
        ],
        "engagementMetrics": {
          "averageAnswersPerQuestion": 2.83,
          "answerAcceptanceRate": 26,
          "userVerificationRate": 90
        }
      },
      "systemHealth": {
        "totalContentItems": 549,
        "contentEngagement": 2.83,
        "userEngagement": 90,
        "moderationLoad": 2,
        "platformActivity": 30,
        "healthScore": 85
      }
    }
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Admin stats retrieved successfully", function () {
      pm.response.to.have.status(200);
      const responseJson = pm.response.json();
      
      // Check basic structure
      pm.expect(responseJson.data.totals).to.not.be.undefined;
      pm.expect(responseJson.data.userStats).to.not.be.undefined;
      pm.expect(responseJson.data.contentStats).to.not.be.undefined;
      pm.expect(responseJson.data.activity).to.not.be.undefined;
      pm.expect(responseJson.data.systemHealth).to.not.be.undefined;
      
      // Check specific metrics
      pm.expect(responseJson.data.totals.users).to.be.a('number');
      pm.expect(responseJson.data.systemHealth.healthScore).to.be.within(0, 100);
  });
  ```

**🎯 What the Admin Dashboard Shows:**

**📊 Overview Totals:**
- Total users, questions, answers, comments, reports

**👥 User Analytics:**
- Verified vs unverified users
- Admin vs regular users
- User verification rate

**📝 Content Analytics:**
- Questions with/without answers
- Answer acceptance rates
- Average answers per question

**📈 Activity Tracking:**
- Today's activity vs yesterday's
- Weekly and monthly trends
- Growth rates and trends

**🏆 Top Performers:**
- Users by reputation
- Questions by votes
- Most active users
- Answer leaders

**🔍 Content Insights:**
- Popular tags
- Engagement metrics
- Platform health score

**⚡ Real-time Metrics:**
- Recent user registrations
- Latest questions and answers
- Moderation workload

#### 10.3 Get All Reports (Admin Only)
- **Method**: GET
- **URL**: `{{baseUrl}}/admin/reports`
- **Headers**: 
  ```
  Authorization: Bearer {{adminToken}}
  ```

**📝 Note**: 
- All admin endpoints require the `adminToken` from Phase 2.5
- Regular users will get 403 Forbidden when trying to access admin endpoints
- Admin users have full access to all admin features

## 🧪 Testing Best Practices

### 1. Organize Requests
Create folders in Postman:
- **Authentication** (Register, Login, Profile)
- **Questions** (Create, Get, Update, Delete, Vote)
- **Answers** (Create, Update, Delete, Vote, Accept)
- **Comments** (Create, Get, Update, Delete)
- **AI Features** (Suggestions, Chat)
- **Bookmarks** (Add, Remove, Get)
- **Admin** (Reports, Stats)
- **File Upload**

### 2. Use Tests for Automation
Add these tests to your requests:
```javascript
// Status code test
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Response time test
pm.test("Response time is less than 1000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(1000);
});

// Save response data
pm.test("Save response data", function () {
    const responseJson = pm.response.json();
    if (responseJson.data && responseJson.data._id) {
        pm.environment.set("questionId", responseJson.data._id);
    }
});
```

### 3. Collection Runner
1. Select your collection
2. Click "Run collection"
3. Choose environment
4. Set iterations (for bulk testing)
5. Set delay between requests
6. Run to execute all requests automatically

### 4. Monitor API Health
Set up monitoring in Postman:
1. Create a simple health check request
2. Go to "Monitors" tab
3. Create new monitor
4. Set schedule (every 5 minutes)
5. Get alerts if API goes down

## 🔧 Troubleshooting

### Common Issues:

1. **Token Expired**: Re-login and update token
2. **CORS Error**: Check server is running and CORS is configured
3. **404 Not Found**: Verify URL and server routes
4. **Validation Error**: Check request body format
5. **500 Server Error**: Check server logs and database connection

### Debug Tips:
- Use Postman Console (View → Show Postman Console)
- Check server terminal for error logs
- Verify environment variables are set correctly
- Test with different users to simulate real usage
- Use MongoDB Compass to verify data is being saved

## 🎯 Success Metrics

After completing all phases, you should have:
- ✅ 10 registered users
- ✅ 10 questions created
- ✅ 10 answers provided
- ✅ 10 comments added
- ✅ 10+ votes cast
- ✅ 10 bookmarks created
- ✅ AI features tested
- ✅ File upload working
- ✅ Admin features functional

This comprehensive testing ensures your mobile Q&A app backend is robust and ready for production use!
