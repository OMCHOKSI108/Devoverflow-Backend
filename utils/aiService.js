import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate AI response for chat messages
 * @param {string} message - The user's message
 * @returns {string} - AI response
 */
export const generateAIResponse = async (message) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('AI service not configured');
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        You are a helpful AI assistant for a programming Q&A platform called DevOverflow.
        Respond to the user's message in a friendly, helpful, and technically accurate way.

        User message: ${message}

        Guidelines:
        - Be concise but comprehensive
        - Use proper code formatting when discussing code
        - Be encouraging and supportive
        - If discussing programming concepts, provide clear explanations
        - Stay on topic and relevant to programming/development questions
        - If the user asks something unrelated to programming, politely redirect to programming topics

        Response:
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResponse = response.text();

        return aiResponse.trim();

    } catch (error) {
        console.error('AI response generation error:', error);
        return 'I apologize, but I\'m having trouble generating a response right now. Please try again later.';
    }
};

/**
 * Check if AI service is configured
 * @returns {boolean} - Whether AI service is available
 */
export const isAIConfigured = () => {
    return !!process.env.GEMINI_API_KEY;
};