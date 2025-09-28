import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with primary key
let genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let currentApiKey = 'primary';

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

    while (attempts < maxAttempts) {
        try {
            if (!genAI) {
                throw new Error('AI service not configured');
            }

            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

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

            const result = await model.generateContent(contextPrompt);
            const response = await result.response;
            const aiResponse = response.text();

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
        configured: primaryConfigured || backupConfigured
    };
};