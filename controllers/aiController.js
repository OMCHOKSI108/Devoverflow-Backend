import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Get AI service status
// @route   GET /api/ai/status
// @access  Public
export const getAiStatus = (req, res) => {
    try {
        const isConfigured = !!process.env.GEMINI_API_KEY;

        res.status(200).json({
            success: true,
            status: isConfigured ? 'AI operational' : 'AI not configured',
            model: 'gemini-1.5-flash',
            configured: isConfigured
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking AI status'
        });
    }
};

// @desc    Get AI answer suggestion for a question
// @route   POST /api/ai/answer-suggestion
// @access  Private
export const getAnswerSuggestion = async (req, res) => {
    try {
        const { questionTitle, questionBody, tags } = req.body;

        if (!questionTitle || !questionBody) {
            return res.status(400).json({
                success: false,
                message: 'Please provide question title and body'
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({
                success: false,
                message: 'AI service not configured'
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        You are an expert programmer and technical assistant. Please provide a helpful, accurate, and well-structured answer to the following programming question:

        Title: ${questionTitle}
        
        Question: ${questionBody}
        
        ${tags && tags.length > 0 ? `Tags: ${tags.join(', ')}` : ''}

        Please provide:
        1. A clear, step-by-step solution
        2. Code examples if applicable (with proper syntax highlighting hints)
        3. Best practices and common pitfalls to avoid
        4. Additional resources or documentation links if relevant

        Keep the answer concise but comprehensive, suitable for a Q&A platform.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiAnswer = response.text();

        res.status(200).json({
            success: true,
            data: {
                suggestion: aiAnswer,
                confidence: 'high',
                model: 'gemini-1.5-flash'
            }
        });

    } catch (error) {
        console.error('AI answer suggestion error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error generating AI answer suggestion'
        });
    }
};

// @desc    Get AI tag suggestions for a question
// @route   POST /api/ai/tag-suggestions
// @access  Private
export const getTagSuggestions = async (req, res) => {
    try {
        const { questionTitle, questionBody } = req.body;

        if (!questionTitle || !questionBody) {
            return res.status(400).json({
                success: false,
                message: 'Please provide question title and body'
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({
                success: false,
                message: 'AI service not configured'
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        Based on the following programming question, suggest 3-5 relevant tags that would help categorize this question:

        Title: ${questionTitle}
        Question: ${questionBody}

        Please provide only the tag names, separated by commas. Focus on:
        - Programming languages (javascript, python, java, etc.)
        - Frameworks and libraries (react, express, django, etc.)
        - Technologies (mongodb, sql, api, etc.)
        - General topics (debugging, performance, security, etc.)

        Example format: javascript, react, debugging, api, frontend
        
        Tags:
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResponse = response.text();

        // Parse the response to extract tags
        const suggestedTags = aiResponse
            .replace('Tags:', '')
            .trim()
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0)
            .slice(0, 5); // Limit to 5 tags

        res.status(200).json({
            success: true,
            data: {
                suggestedTags,
                model: 'gemini-1.5-flash'
            }
        });

    } catch (error) {
        console.error('AI tag suggestion error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error generating AI tag suggestions'
        });
    }
};

// @desc    AI chatbot for general programming help
// @route   POST /api/ai/chatbot
// @access  Private
export const chatbot = async (req, res) => {
    try {
        const { message, context } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a message'
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({
                success: false,
                message: 'AI service not configured'
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        let prompt = `
        You are a helpful programming assistant for a Q&A platform. Please provide a helpful, accurate response to the user's question or request.

        ${context ? `Context: ${context}` : ''}
        
        User: ${message}
        
        Please provide a clear, concise, and helpful response. If it's a coding question, include relevant code examples.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResponse = response.text();

        res.status(200).json({
            success: true,
            data: {
                response: aiResponse,
                timestamp: new Date().toISOString(),
                model: 'gemini-1.5-flash'
            }
        });

    } catch (error) {
        console.error('AI chatbot error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error processing chatbot request'
        });
    }
};

// @desc    Get AI suggestions for improving a question
// @route   POST /api/ai/question-improvements
// @access  Private
export const getQuestionImprovements = async (req, res) => {
    try {
        const { questionTitle, questionBody, tags } = req.body;

        if (!questionTitle || !questionBody) {
            return res.status(400).json({
                success: false,
                message: 'Please provide question title and body'
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({
                success: false,
                message: 'AI service not configured'
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        Please analyze the following programming question and provide suggestions for improvement:

        Title: ${questionTitle}
        Question: ${questionBody}
        ${tags && tags.length > 0 ? `Current Tags: ${tags.join(', ')}` : ''}

        Please provide feedback on:
        1. Title clarity and specificity
        2. Question structure and completeness
        3. Missing information that would help answerers
        4. Code formatting suggestions (if applicable)
        5. Tag suggestions for better categorization

        Format your response as constructive feedback that helps the user improve their question.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const improvements = response.text();

        res.status(200).json({
            success: true,
            data: {
                improvements,
                model: 'gemini-1.5-flash'
            }
        });

    } catch (error) {
        console.error('AI question improvements error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error generating question improvements'
        });
    }
};

// @desc    Get AI-powered similar questions
// @route   POST /api/ai/similar-questions
// @access  Public
export const getSimilarQuestions = async (req, res) => {
    try {
        const { questionTitle, questionBody } = req.body;

        if (!questionTitle) {
            return res.status(400).json({
                success: false,
                message: 'Please provide question title'
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({
                success: false,
                message: 'AI service not configured'
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        Based on this programming question, generate 3-5 similar question titles that someone might ask:

        Title: ${questionTitle}
        ${questionBody ? `Description: ${questionBody}` : ''}

        Please provide similar but distinct questions that are related to the same topic, technology, or problem domain.
        Format as a simple list, one question per line.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiResponse = response.text();

        // Parse the response to extract similar questions
        const similarQuestions = aiResponse
            .split('\n')
            .map(q => q.trim())
            .filter(q => q.length > 0 && !q.startsWith('Similar') && !q.startsWith('Based'))
            .slice(0, 5);

        res.status(200).json({
            success: true,
            data: {
                similarQuestions,
                model: 'gemini-1.5-flash'
            }
        });

    } catch (error) {
        console.error('AI similar questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error generating similar questions'
        });
    }
};
