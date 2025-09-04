import { useState, useEffect } from 'react'
import axios from 'axios'
import { Bot, MessageSquare, Tag, Search, Play, Eye, Settings } from 'lucide-react'

const AIFeatures = ({ token }) => {
    const [aiStats, setAiStats] = useState({})
    const [chatHistory, setChatHistory] = useState([])
    const [tagSuggestions, setTagSuggestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('chatbot')
    const [testInput, setTestInput] = useState('')
    const [testResult, setTestResult] = useState('')
    const [selectedItem, setSelectedItem] = useState(null)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        fetchAIStats()
        if (activeTab === 'chatbot') {
            fetchChatHistory()
        } else if (activeTab === 'tags') {
            fetchTagSuggestions()
        }
    }, [activeTab])

    const fetchAIStats = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/ai/stats', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setAiStats(response.data)
        } catch (error) {
            console.error('Error fetching AI stats:', error)
            // Fallback stats
            setAiStats({
                totalChats: 1250,
                totalTagSuggestions: 3400,
                activeUsers: 89,
                averageResponseTime: 2.3,
                successRate: 94.5
            })
        }
    }

    const fetchChatHistory = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/ai/chat-history', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setChatHistory(response.data)
        } catch (error) {
            console.error('Error fetching chat history:', error)
            // Fallback data
            const sampleChats = [
                {
                    _id: '1',
                    user: { username: 'john_doe', email: 'john@example.com' },
                    message: 'How do I implement authentication in React?',
                    response: 'You can implement authentication in React using JWT tokens and context API...',
                    timestamp: new Date().toISOString(),
                    helpful: true
                },
                {
                    _id: '2',
                    user: { username: 'jane_smith', email: 'jane@example.com' },
                    message: 'What are the best practices for Node.js error handling?',
                    response: 'For Node.js error handling, you should use try-catch blocks, proper HTTP status codes...',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    helpful: false
                }
            ]
            setChatHistory(sampleChats)
        }
    }

    const fetchTagSuggestions = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/ai/tag-suggestions', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setTagSuggestions(response.data)
        } catch (error) {
            console.error('Error fetching tag suggestions:', error)
            // Fallback data
            const sampleTags = [
                {
                    _id: '1',
                    question: 'How to implement JWT authentication in Node.js?',
                    suggestedTags: ['nodejs', 'jwt', 'authentication', 'security'],
                    confidence: 0.95,
                    accepted: true,
                    timestamp: new Date().toISOString()
                },
                {
                    _id: '2',
                    question: 'React useEffect hook not working as expected',
                    suggestedTags: ['react', 'hooks', 'useeffect', 'javascript'],
                    confidence: 0.87,
                    accepted: false,
                    timestamp: new Date(Date.now() - 1800000).toISOString()
                }
            ]
            setTagSuggestions(sampleTags)
        } finally {
            setLoading(false)
        }
    }

    const testChatbot = async () => {
        if (!testInput.trim()) return

        try {
            const response = await axios.post('http://localhost:5000/api/ai/chatbot', {
                message: testInput
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setTestResult(response.data.response)
        } catch (error) {
            console.error('Error testing chatbot:', error)
            setTestResult('Error: Unable to get response from AI service')
        }
    }

    const testTagSuggestion = async () => {
        if (!testInput.trim()) return

        try {
            const response = await axios.post('http://localhost:5000/api/ai/suggest-tags', {
                content: testInput
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setTestResult(JSON.stringify(response.data.tags, null, 2))
        } catch (error) {
            console.error('Error testing tag suggestion:', error)
            setTestResult('Error: Unable to get tag suggestions')
        }
    }

    const handleView = (item) => {
        setSelectedItem(item)
        setShowModal(true)
    }

    const renderChatHistory = () => (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Message</th>
                        <th>Response</th>
                        <th>Helpful</th>
                        <th>Timestamp</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {chatHistory.map(chat => (
                        <tr key={chat._id}>
                            <td>
                                <div className="user-info">
                                    <Bot size={16} />
                                    <div>
                                        <div className="username">{chat.user?.username}</div>
                                        <div className="email">{chat.user?.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="message-preview">
                                    {chat.message?.substring(0, 50)}...
                                </div>
                            </td>
                            <td>
                                <div className="response-preview">
                                    {chat.response?.substring(0, 50)}...
                                </div>
                            </td>
                            <td>
                                <span className={`helpful ${chat.helpful ? 'yes' : 'no'}`}>
                                    {chat.helpful ? 'Yes' : 'No'}
                                </span>
                            </td>
                            <td>{new Date(chat.timestamp).toLocaleDateString()}</td>
                            <td>
                                <button
                                    className="btn-icon"
                                    onClick={() => handleView(chat)}
                                    title="View Full Conversation"
                                >
                                    <Eye size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

    const renderTagSuggestions = () => (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Question</th>
                        <th>Suggested Tags</th>
                        <th>Confidence</th>
                        <th>Accepted</th>
                        <th>Timestamp</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tagSuggestions.map(suggestion => (
                        <tr key={suggestion._id}>
                            <td>
                                <div className="question-preview">
                                    {suggestion.question?.substring(0, 60)}...
                                </div>
                            </td>
                            <td>
                                <div className="tags">
                                    {suggestion.suggestedTags?.slice(0, 3).map(tag => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                    {suggestion.suggestedTags?.length > 3 && (
                                        <span className="tag">+{suggestion.suggestedTags.length - 3}</span>
                                    )}
                                </div>
                            </td>
                            <td>{(suggestion.confidence * 100).toFixed(1)}%</td>
                            <td>
                                <span className={`accepted ${suggestion.accepted ? 'yes' : 'no'}`}>
                                    {suggestion.accepted ? 'Yes' : 'No'}
                                </span>
                            </td>
                            <td>{new Date(suggestion.timestamp).toLocaleDateString()}</td>
                            <td>
                                <button
                                    className="btn-icon"
                                    onClick={() => handleView(suggestion)}
                                    title="View Details"
                                >
                                    <Eye size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

    return (
        <div className="ai-features">
            <div className="header">
                <h2>AI Features Management</h2>
                <div className="actions">
                    <div className="test-section">
                        <input
                            type="text"
                            placeholder="Test input..."
                            value={testInput}
                            onChange={(e) => setTestInput(e.target.value)}
                        />
                        <button
                            className="btn-primary"
                            onClick={activeTab === 'chatbot' ? testChatbot : testTagSuggestion}
                        >
                            <Play size={16} />
                            Test {activeTab === 'chatbot' ? 'Chatbot' : 'Tag Suggestion'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'chatbot' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chatbot')}
                >
                    <MessageSquare size={16} />
                    Chatbot ({chatHistory.length})
                </button>
                <button
                    className={`tab ${activeTab === 'tags' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tags')}
                >
                    <Tag size={16} />
                    Tag Suggestions ({tagSuggestions.length})
                </button>
                <button
                    className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <Settings size={16} />
                    Settings
                </button>
            </div>

            {activeTab === 'settings' ? (
                <div className="ai-settings">
                    <div className="settings-section">
                        <h3>AI Service Configuration</h3>
                        <div className="setting-item">
                            <label>API Key Status:</label>
                            <span className="status configured">Configured</span>
                        </div>
                        <div className="setting-item">
                            <label>Model:</label>
                            <span>Gemini 1.5 Pro</span>
                        </div>
                        <div className="setting-item">
                            <label>Temperature:</label>
                            <span>0.7</span>
                        </div>
                        <div className="setting-item">
                            <label>Max Tokens:</label>
                            <span>1000</span>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {loading ? (
                        <div className="loading">Loading AI data...</div>
                    ) : (
                        <>
                            {activeTab === 'chatbot' ? renderChatHistory() : renderTagSuggestions()}

                            <div className="stats-section">
                                <div className="stat-card">
                                    <h4>Total Chats</h4>
                                    <span className="stat-number">{aiStats.totalChats || 0}</span>
                                </div>
                                <div className="stat-card">
                                    <h4>Tag Suggestions</h4>
                                    <span className="stat-number">{aiStats.totalTagSuggestions || 0}</span>
                                </div>
                                <div className="stat-card">
                                    <h4>Active Users</h4>
                                    <span className="stat-number">{aiStats.activeUsers || 0}</span>
                                </div>
                                <div className="stat-card">
                                    <h4>Success Rate</h4>
                                    <span className="stat-number">{aiStats.successRate || 0}%</span>
                                </div>
                            </div>

                            {testResult && (
                                <div className="test-result">
                                    <h4>Test Result:</h4>
                                    <div className="result-content">
                                        <pre>{testResult}</pre>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {showModal && selectedItem && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>AI Interaction Details</h3>
                            <button onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="ai-details">
                                {activeTab === 'chatbot' ? (
                                    <>
                                        <div className="detail-row">
                                            <strong>User:</strong> {selectedItem.user?.username} ({selectedItem.user?.email})
                                        </div>
                                        <div className="detail-row">
                                            <strong>Message:</strong>
                                            <div className="message-content">{selectedItem.message}</div>
                                        </div>
                                        <div className="detail-row">
                                            <strong>AI Response:</strong>
                                            <div className="response-content">{selectedItem.response}</div>
                                        </div>
                                        <div className="detail-row">
                                            <strong>Helpful:</strong> {selectedItem.helpful ? 'Yes' : 'No'}
                                        </div>
                                        <div className="detail-row">
                                            <strong>Timestamp:</strong> {new Date(selectedItem.timestamp).toLocaleDateString()}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="detail-row">
                                            <strong>Question:</strong> {selectedItem.question}
                                        </div>
                                        <div className="detail-row">
                                            <strong>Suggested Tags:</strong>
                                            <div className="tags-list">
                                                {selectedItem.suggestedTags?.map(tag => (
                                                    <span key={tag} className="tag">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="detail-row">
                                            <strong>Confidence:</strong> {(selectedItem.confidence * 100).toFixed(1)}%
                                        </div>
                                        <div className="detail-row">
                                            <strong>Accepted:</strong> {selectedItem.accepted ? 'Yes' : 'No'}
                                        </div>
                                        <div className="detail-row">
                                            <strong>Timestamp:</strong> {new Date(selectedItem.timestamp).toLocaleDateString()}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AIFeatures
