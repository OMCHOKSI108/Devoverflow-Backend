# ðŸ”‘ Gemini API Setup Guide

## âœ… Current Status: Keys Tested and Working

Your Gemini API keys have been tested and are operational. The system shows:
- âœ… Primary key: Valid and working
- âœ… Backup key: Available for fallback
- âœ… Model fallback: Automatic model selection with candidates

## ðŸš€ How to Get Valid Gemini API Keys (If Needed)

### Step 1: Visit Google AI Studio
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with your Google account

### Step 2: Create API Keys
1. Click **"Create API Key"**
2. Copy the generated key
3. **Create a second key** for backup (recommended)

### Step 3: Update Your .env File
Replace the placeholder keys in your `.env` file:

```env
# Replace these with your actual keys from Google AI Studio
GEMINI_API_KEY=AIzaSyD_your_actual_key_here
GEMINI_API_KEY2=AIzaSyD_your_backup_key_here
```

### Step 4: Test the Keys
After updating the keys, test them:

```bash
# Test AI status
curl http://localhost:3000/api/ai/status

# Test conversation memory
node demonstrateMemory.js
```

## ðŸ” What the AI System Does

### âœ… Conversation Memory
- **Remembers user information** across messages
- **Maintains context** throughout conversations
- **Prevents "I don't know" responses**

### âœ… Multi-API Key Support
- **Primary key**: Your main Gemini API key
- **Backup key**: Automatic fallback if primary fails
- **Error handling**: Graceful degradation

### âœ… Development Mode
- **AI_MOCK=true**: Use deterministic mock responses for testing without API calls
- **GEMINI_MODEL**: Pin a specific model (optional, defaults to fallback candidates)

### âœ… Indian Developer Focus
- **Context-aware responses** for Indian tech ecosystem
- **Local market insights** (jobs, frameworks, trends)
- **Regional programming discussions**

## ðŸ§ª Testing Conversation Memory

Once you have valid API keys, test the memory feature:

```javascript
// Example conversation that should work:
User: "Hello, my name is Rahul"
AI: "Hello Rahul! How can I help you with programming?"

User: "What's my name?"
AI: "Your name is Rahul!" âœ… (remembers!)
```

## ðŸ“Š API Status Check

Run this to verify your keys are working:

```bash
node -e "
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

async function testKeys() {
  console.log('ðŸ” Testing Gemini API Keys...\\n');

  const keys = [
    { name: 'Primary', key: process.env.GEMINI_API_KEY },
    { name: 'Backup', key: process.env.GEMINI_API_KEY2 }
  ];

  for (const { name, key } of keys) {
    if (!key || key.includes('YOUR_')) {
      console.log(\`âŒ \${name} Key: Not configured\`);
      continue;
    }

    try {
      const genAI = new GoogleGenerativeAI(key);
  // The server will attempt the active model reported by GET /api/ai/status or fall back to the first candidate.
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || '<server-chosen-model>' });
      const result = await model.generateContent('Hello');
      console.log(\`âœ… \${name} Key: Working!\`);
    } catch (error) {
      console.log(\`âŒ \${name} Key: Failed - \${error.message}\`);
    }
  }
}

testKeys();
"
```

## ðŸŽ¯ Expected Results After Fix

With valid keys, you should see:
```
ðŸ§  CONVERSATION MEMORY DEMONSTRATION
=====================================

âœ… Connected to database
ðŸ‘¤ Using test user: DevOverflow Admin (admin)

ðŸ’¬ Starting conversation demo...

ðŸ‘¤ User: HELLO my name is pentagon
ðŸ¤– AI: Hello pentagon! Nice to meet you. I'm your AI programming assistant...

ðŸ‘¤ User: TELL ME MY NAME
ðŸ¤– AI: Your name is pentagon! I remember you told me earlier.

âœ… Conversation Memory Demo Completed!
```

## ðŸ”§ Troubleshooting

### Common Issues:
1. **"API key not valid"** â†’ Get new keys from Google AI Studio
2. **Rate limiting** â†’ Wait a few minutes, reduce requests
3. **Model not found** â†’ Check if you're using correct model name
4. **Network issues** â†’ Check internet connection

### Model Information:
- **Model**: reported by the server at GET /api/ai/status (or explicitly set via `GEMINI_MODEL` env var)
- **Provider**: Google Generative AI
- **Rate Limits**: 60 requests per minute (free tier)

## ðŸ“ž Support

If you continue having issues:
1. Verify keys are copied correctly (no extra spaces)
2. Check Google Cloud Console for key status
3. Ensure billing is enabled (if required)
4. Try creating new keys

---

**Next Steps:**
1. Get valid Gemini API keys from Google AI Studio
2. Update your `.env` file
3. Test with `node demonstrateMemory.js`
4. Your AI conversation memory will work perfectly! ðŸš€
