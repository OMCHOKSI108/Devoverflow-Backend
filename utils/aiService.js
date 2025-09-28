import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with primary key
let genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let currentApiKey = 'primary';

// Model candidates (order matters). Can be overridden with GEMINI_MODEL env var.
const modelCandidates = process.env.GEMINI_MODEL
    ? [process.env.GEMINI_MODEL]
    : [
        'gemini-2.5-flash',
        'gemini-1.5-flash',
        'gemini-1.5',
        'gemini-1.0',
        'text-bison-001'
    ];

// Cache the working model once discovered to avoid repeated 404s
let activeModel = process.env.GEMINI_MODEL || null;

/**
 * Switch to backup API key if primary fails
 */
const switchToBackupKey = () => {
    if (currentApiKey === 'primary' && process.env.GEMINI_API_KEY2) {
        console.log('Switching to backup Gemini API key...');
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY2);
        currentApiKey = 'backup';
        return true;
    }
    return false;
};

/**
 * Reset to primary API key
 */
const resetToPrimaryKey = () => {
    if (currentApiKey === 'backup') {
        console.log('Resetting to primary Gemini API key...');
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        currentApiKey = 'primary';
    }
};

/**
 * Generate AI response for chat messages with conversation context
 * @param {string} message - The user's message
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @returns {string} - AI response
 */
export const generateAIResponse = async (message, conversationHistory = []) => {
    let attempts = 0;
    const maxAttempts = 2; // Try primary, then backup

    // Quick mock mode for local testing when Gemini keys are not available
    if (process.env.AI_MOCK && process.env.AI_MOCK.toLowerCase() === 'true') {
        // Simple deterministic mock reply that references conversation if available
        const nameEntry = conversationHistory.find(m => /name is/i.test(m.content));
        const remembered = nameEntry ? nameEntry.content.replace(/.*name is\s*/i, '').trim() : null;
        if (remembered) return `Your name is ${remembered}. (mock)`;
        if (/hello|hi/i.test(message)) return `Hello! I'm a mock AI assistant. (mock)`;
        if (/reverse a string/i.test(message)) return `function reverse(s){return s.split('').reverse().join('');} (mock)`;
        return `I am in mock mode and can't call Gemini. Your message was: "${message}"`;
    }

    while (attempts < maxAttempts) {
        try {
            if (!genAI) {
                throw new Error('AI service not configured');
            }
            // Try candidate models (or cached activeModel) until one works
            const modelsToTry = activeModel ? [activeModel, ...modelCandidates.filter(m => m !== activeModel)] : modelCandidates;

            // Build conversation context
            let contextPrompt = `
You are a helpful AI assistant for a programming Q&A platform called DevOverflow.
You have memory of the conversation and can reference previous messages.
Respond to the user's message in a friendly, helpful, and technically accurate way.

CONVERSATION HISTORY:
`;

            // Add conversation history (last 10 messages to avoid token limits)
            const recentHistory = conversationHistory.slice(-10);
            recentHistory.forEach(msg => {
                contextPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
            });

            contextPrompt += `
CURRENT USER MESSAGE: ${message}

Guidelines:
- Remember and reference information from previous messages in this conversation
- Be concise but comprehensive
- Use proper code formatting when discussing code
- Be encouraging and supportive
- If discussing programming concepts, provide clear explanations
- Stay on topic and relevant to programming/development questions
- If the user asks something unrelated to programming, politely redirect to programming topics
- If asked about user's personal information you previously discussed, recall and reference it

Response:
`;

            let aiResponse = null;
            let lastError = null;

            for (const candidateModel of modelsToTry) {
                try {
                    const model = genAI.getGenerativeModel({ model: candidateModel });
                    const result = await model.generateContent(contextPrompt);
                    const response = await result.response;
                    aiResponse = response.text();
                    // Cache the working model
                    activeModel = candidateModel;
                    break;
                } catch (err) {
                    lastError = err;
                    // If model is not found (404), try next candidate
                    if (err && err.status === 404) {
                        console.warn(`Model ${candidateModel} not found, trying next candidate...`);
                        continue;
                    }
                    // For other errors, rethrow to outer catch to trigger key fallback logic
                    throw err;
                }
            }

            if (aiResponse === null) {
                // None of the candidates worked; surface last error to outer catch
                throw lastError || new Error('No working Gemini model found');
            }

            // Reset to primary key on success
            if (currentApiKey === 'backup') {
                resetToPrimaryKey();
            }

            return aiResponse.trim();

        } catch (error) {
            console.error(`AI response generation error (attempt ${attempts + 1}):`, error);

            // Try backup key if primary fails
            if (attempts === 0 && switchToBackupKey()) {
                attempts++;
                continue;
            }

            attempts++;

            if (attempts >= maxAttempts) {
                return 'I apologize, but I\'m having trouble generating a response right now. Please try again later.';
            }
        }
    }
};

/**
 * Generate AI response for single messages (backward compatibility)
 * @param {string} message - The user's message
 * @returns {string} - AI response
 */
export const generateSimpleAIResponse = async (message) => {
    return await generateAIResponse(message, []);
};

/**
 * Generate text content using Gemini with model and key fallbacks.
 * Reusable for controller endpoints that need to generate arbitrary content.
 * Returns the response object from the SDK (so caller can call .text()).
 */
export const generateContent = async (prompt) => {
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
        try {
            if (!genAI) throw new Error('AI service not configured');

            const modelsToTry = activeModel ? [activeModel, ...modelCandidates.filter(m => m !== activeModel)] : modelCandidates;

            let lastError = null;
            let response = null;

            for (const candidateModel of modelsToTry) {
                try {
                    const model = genAI.getGenerativeModel({ model: candidateModel });
                    const result = await model.generateContent(prompt);
                    response = await result.response;
                    // cache working model
                    activeModel = candidateModel;
                    break;
                } catch (err) {
                    lastError = err;
                    if (err && err.status === 404) {
                        console.warn(`Model ${candidateModel} not found, trying next candidate...`);
                        continue;
                    }
                    throw err;
                }
            }

            if (!response) throw lastError || new Error('No working Gemini model found');

            if (currentApiKey === 'backup') resetToPrimaryKey();

            return response;
        } catch (error) {
            console.error(`generateContent error (attempt ${attempts + 1}):`, error?.message || error);
            if (attempts === 0 && switchToBackupKey()) {
                attempts++;
                continue;
            }
            attempts++;
            if (attempts >= maxAttempts) {
                throw error;
            }
        }
    }
};

/**
 * Check if AI service is configured
 * @returns {boolean} - Whether AI service is available
 */
export const isAIConfigured = () => {
    return !!(process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY2);
};

/**
 * Get current AI service status
 * @returns {object} - Status information
 */
export const getAIStatus = () => {
    const primaryConfigured = !!process.env.GEMINI_API_KEY;
    const backupConfigured = !!process.env.GEMINI_API_KEY2;

    return {
        primaryKey: primaryConfigured,
        backupKey: backupConfigured,
        currentKey: currentApiKey,
        // Report which model will likely be used (either cached activeModel or first candidate)
        model: activeModel || modelCandidates[0],
        configured: primaryConfigured || backupConfigured || (process.env.AI_MOCK && process.env.AI_MOCK.toLowerCase() === 'true')
    };
};