import ChatSession from '../models/ChatSession.js';
import ChatMessage from '../models/ChatMessage.js';
import { generateAIResponse } from '../utils/aiService.js';
import { markdownToHtml } from '../utils/markdown.js';

// @desc    Get user's chat sessions
// @route   GET /api/chat/sessions
// @access  Private
export const getChatSessions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const sessions = await ChatSession.find({
            user: req.user.id,
            isActive: true
        })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('title lastMessage messageCount createdAt updatedAt');

        const totalSessions = await ChatSession.countDocuments({
            user: req.user.id,
            isActive: true
        });
        const totalPages = Math.ceil(totalSessions / limit);

        res.status(200).json({
            success: true,
            data: {
                sessions,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalSessions,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get chat sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get messages for a chat session
// @route   GET /api/chat/sessions/:sessionId/messages
// @access  Private
export const getChatMessages = async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Verify session ownership
        const session = await ChatSession.findOne({
            _id: sessionId,
            user: req.user.id,
            isActive: true
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Chat session not found'
            });
        }

        const messages = await ChatMessage.find({ session: sessionId })
            .sort({ timestamp: 1 })
            .select('role content timestamp');

        res.status(200).json({
            success: true,
            data: {
                sessionId,
                messages
            }
        });

    } catch (error) {
        console.error('Get chat messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Create new chat session
// @route   POST /api/chat/sessions
// @access  Private
export const createChatSession = async (req, res) => {
    try {
        const { title, initialMessage } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        // Create session
        const session = await ChatSession.create({
            user: req.user.id,
            title: title.trim(),
            lastMessage: initialMessage || '',
            messageCount: initialMessage ? 1 : 0
        });

        let messages = [];

        // If initial message provided, save it and get AI response
        if (initialMessage) {
            // Save user message
            const userMessage = await ChatMessage.create({
                session: session._id,
                role: 'user',
                content: initialMessage.trim()
            });

            // Get AI response
            const aiResponse = await generateAIResponse(initialMessage);
            const aiHtml = markdownToHtml(aiResponse);

            // Save AI response (store raw markdown/text)
            const aiMessage = await ChatMessage.create({
                session: session._id,
                role: 'assistant',
                content: aiResponse
            });

            // Update session
            await ChatSession.findByIdAndUpdate(session._id, {
                lastMessage: aiResponse,
                messageCount: 2
            });

            messages = [userMessage, aiMessage];
        }

        res.status(201).json({
            success: true,
            data: {
                session: {
                    id: session._id,
                    title: session.title,
                    lastMessage: session.lastMessage,
                    messageCount: session.messageCount,
                    createdAt: session.createdAt
                },
                messages: messages.map(msg => ({
                    id: msg._id,
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp
                }))
            }
        });

    } catch (error) {
        console.error('Create chat session error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Send message to AI in existing session
// @route   POST /api/chat/sessions/:sessionId/messages
// @access  Private
export const sendChatMessage = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Verify session ownership
        const session = await ChatSession.findOne({
            _id: sessionId,
            user: req.user.id,
            isActive: true
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Chat session not found'
            });
        }

        // Save user message
        const userMessage = await ChatMessage.create({
            session: sessionId,
            role: 'user',
            content: message.trim()
        });

        // Get conversation history for context (last 20 messages)
        const conversationHistory = await ChatMessage.find({ session: sessionId })
            .sort({ timestamp: -1 })
            .limit(20)
            .select('role content timestamp')
            .lean();

        // Reverse to get chronological order
        conversationHistory.reverse();

        // Get AI response with conversation context
        const aiResponse = await generateAIResponse(message, conversationHistory);

        // Save AI response (store raw markdown/text)
        const aiMessage = await ChatMessage.create({
            session: sessionId,
            role: 'assistant',
            content: aiResponse
        });

        // Update session
        await ChatSession.findByIdAndUpdate(sessionId, {
            lastMessage: aiResponse,
            messageCount: session.messageCount + 2,
            updatedAt: new Date()
        });

        const aiHtml = markdownToHtml(aiResponse);

        res.status(200).json({
            success: true,
            data: {
                message: {
                    id: userMessage._id,
                    role: 'user',
                    content: userMessage.content,
                    timestamp: userMessage.timestamp
                },
                aiResponse: {
                    id: aiMessage._id,
                    role: 'assistant',
                    content: aiMessage.content,
                    html: aiHtml,
                    timestamp: aiMessage.timestamp
                }
            }
        });

    } catch (error) {
        console.error('Send chat message error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete chat session
// @route   DELETE /api/chat/sessions/:sessionId
// @access  Private
export const deleteChatSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Verify session ownership and soft delete
        const session = await ChatSession.findOneAndUpdate(
            {
                _id: sessionId,
                user: req.user.id,
                isActive: true
            },
            { isActive: false },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Chat session not found'
            });
        }

        // Optionally delete messages (or keep for audit)
        // await ChatMessage.deleteMany({ session: sessionId });

        res.status(200).json({
            success: true,
            message: 'Chat session deleted successfully'
        });

    } catch (error) {
        console.error('Delete chat session error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};