# 🚀 DevOverflow AI Endpoints - Quick Start Guide

## 📋 What You Got

1. **`AI_APIS_POSTMAN_GUIDE.txt`** - Complete testing guide with examples
2. **`DevOverflow_AI_Postman_Collection.json`** - Importable Postman collection

## ⚡ Quick Setup (3 Steps)

### Step 1: Start Your Backend
```bash
cd backend
npm start
```

### Step 2: Get JWT Token
```bash
# Login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_admin_password"}'
```

### Step 3: Import to Postman
1. Open Postman
2. Click "Import" → "File"
3. Select `DevOverflow_AI_Postman_Collection.json`
4. Set environment variables:
   - `base_url`: `http://localhost:3000/api/ai`
   - `jwt_token`: Your JWT token from Step 2

## 🧪 Testing Order

1. **AI Status** (Public) - Check if AI is configured
2. **Similar Questions** (Public) - Test basic AI functionality
3. **Answer Suggestion** (Protected) - Test authenticated AI
4. **Tag Suggestions** (Protected) - Test tag generation
5. **Chatbot** (Protected) - Test conversational AI
6. **Question Improvements** (Protected) - Test question enhancement
7. **Create Flowchart** (Protected) - Test diagram generation
8. **Get Flowchart** (Protected) - Test diagram retrieval

## 🔑 Authentication Notes

- **Public endpoints**: No auth needed
- **Protected endpoints**: Add `Authorization: Bearer YOUR_JWT_TOKEN` header
- Get token from: `POST /api/auth/login`

## 🎯 Expected Results

✅ **AI Status**: Shows Gemini API configuration status
✅ **Similar Questions**: Returns 3-5 related question titles
✅ **Answer Suggestion**: Provides detailed coding solution
✅ **Tag Suggestions**: Returns relevant tags array
✅ **Chatbot**: Conversational AI responses
✅ **Question Improvements**: Constructive feedback
✅ **Flowchart**: Mermaid diagram code + rendered images

## 🚨 Common Issues

❌ **"AI service not configured"** → Check GEMINI_API_KEY in .env
❌ **"Not authorized"** → Add JWT token to headers
❌ **Connection refused** → Make sure backend is running on port 3000

## 📚 Full Documentation

See `docs/AI_APIS_POSTMAN_GUIDE.txt` for complete examples and error handling.

---

**Happy Testing! 🎉**