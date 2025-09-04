import { useState, useEffect } from 'react'
import axios from 'axios'
import { HelpCircle, Search, Eye, Edit, Trash2, Filter } from 'lucide-react'
import './Questions.css'

const Questions = ({ token }) => {
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selectedQuestion, setSelectedQuestion] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [debounceTimer, setDebounceTimer] = useState(null)

    useEffect(() => {
        fetchQuestions()
    }, [searchTerm, filterStatus, currentPage])

    const fetchQuestions = async () => {
        try {
            setLoading(true)
            setError('')
            const params = new URLSearchParams({
                page: currentPage,
                limit: 20
            })
            if (searchTerm) params.append('search', searchTerm)
            if (filterStatus !== 'all') params.append('status', filterStatus)

            const response = await axios.get(`http://localhost:3000/api/questions?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                setQuestions(response.data.data.questions || [])
                setTotalPages(response.data.data.pagination?.totalPages || 1)
            } else {
                setQuestions([])
                setError('Failed to load questions')
            }
        } catch (error) {
            console.error('Error fetching questions:', error)
            setError(error.response?.data?.message || 'Failed to load questions')

            // Fallback to sample data for demo
            const sampleQuestions = [
                {
                    _id: '1',
                    title: 'How to implement JWT authentication in Node.js?',
                    content: 'I need help implementing JWT authentication in my Node.js application...',
                    author: { username: 'john_doe', email: 'john@example.com' },
                    tags: ['nodejs', 'jwt', 'authentication'],
                    votes: 15,
                    answers: 8,
                    status: 'open',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    _id: '2',
                    title: 'React useEffect hook not working as expected',
                    content: 'My useEffect is running on every render instead of just once...',
                    author: { username: 'jane_smith', email: 'jane@example.com' },
                    tags: ['react', 'hooks', 'useeffect'],
                    votes: 7,
                    answers: 3,
                    status: 'open',
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    updatedAt: new Date(Date.now() - 86400000).toISOString()
                }
            ]
            setQuestions(sampleQuestions)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (questionId) => {
        if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) return

        try {
            const response = await axios.delete(`http://localhost:3000/api/questions/${questionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                alert('Question deleted successfully')
                fetchQuestions()
            } else {
                alert('Failed to delete question')
            }
        } catch (error) {
            console.error('Error deleting question:', error)
            alert(error.response?.data?.message || 'Error deleting question')
        }
    }

    const handleEdit = (question) => {
        setEditingQuestion(question)
        setShowModal(true)
    }

    const handleSaveEdit = async () => {
        try {
            const response = await axios.put(`http://localhost:3000/api/admin/questions/${editingQuestion._id}`, {
                title: editingQuestion.title,
                content: editingQuestion.content,
                tags: editingQuestion.tags,
                status: editingQuestion.status
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                alert('Question updated successfully')
                setShowModal(false)
                setEditingQuestion(null)
                fetchQuestions()
            } else {
                alert('Failed to update question')
            }
        } catch (error) {
            console.error('Error updating question:', error)
            alert(error.response?.data?.message || 'Error updating question')
        }
    }

    const handleStatusChange = async (questionId, newStatus) => {
        try {
            const response = await axios.put(`http://localhost:3000/api/admin/questions/${questionId}`, {
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                alert(`Question ${newStatus === 'open' ? 'opened' : 'closed'} successfully`)
                fetchQuestions()
            } else {
                alert('Failed to update question status')
            }
        } catch (error) {
            console.error('Error updating question status:', error)
            alert('Error updating question status')
        }
    }

    const handleSearchChange = (value) => {
        setSearchTerm(value)
        setCurrentPage(1) // Reset to first page when searching

        // Clear existing timer
        if (debounceTimer) {
            clearTimeout(debounceTimer)
        }

        // Set new timer for debounced search
        const timer = setTimeout(() => {
            // Search will trigger via useEffect
        }, 500)

        setDebounceTimer(timer)
    }

    const handleFilterChange = (value) => {
        setFilterStatus(value)
        setCurrentPage(1) // Reset to first page when filtering
    }

    const renderQuestionsTable = () => (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Tags</th>
                        <th>Votes</th>
                        <th>Answers</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {questions.map(question => (
                        <tr key={question._id}>
                            <td>
                                <div className="question-title">
                                    <HelpCircle size={16} />
                                    <div>
                                        <div className="title">{question.title}</div>
                                        <div className="content-preview">
                                            {question.content?.substring(0, 100)}...
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="user-info">
                                    <div>
                                        <div className="username">{question.author?.username}</div>
                                        <div className="email">{question.author?.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="tags">
                                    {question.tags?.slice(0, 3).map(tag => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                    {question.tags?.length > 3 && (
                                        <span className="tag">+{question.tags.length - 3}</span>
                                    )}
                                </div>
                            </td>
                            <td>{question.votes || 0}</td>
                            <td>{question.answers || 0}</td>
                            <td>
                                <span className={`status ${question.status}`}>
                                    {question.status}
                                </span>
                            </td>
                            <td>{new Date(question.createdAt).toLocaleDateString()}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleView(question)}
                                        title="View Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleEdit(question)}
                                        title="Edit Question"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className="btn-icon btn-danger"
                                        onClick={() => handleDelete(question._id)}
                                        title="Delete Question"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        className="btn-icon btn-warning"
                                        onClick={() => handleStatusChange(question._id, question.status === 'open' ? 'closed' : 'open')}
                                        title={question.status === 'open' ? 'Close Question' : 'Open Question'}
                                    >
                                        {question.status === 'open' ? '🔒' : '🔓'}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

    return (
        <div className="questions-management">
            <div className="header">
                <h2>Questions Management</h2>
                <div className="actions">
                    <div className="filter-section">
                        <Filter size={20} />
                        <select
                            value={filterStatus}
                            onChange={(e) => handleFilterChange(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                            <option value="answered">Answered</option>
                        </select>
                    </div>
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Loading questions...</p>
                </div>
            ) : (
                <>
                    {renderQuestionsTable()}

                    <div className="stats-section">
                        <div className="stat-card">
                            <h4>Total Questions</h4>
                            <span className="stat-number">{questions.length}</span>
                        </div>
                        <div className="stat-card">
                            <h4>Open Questions</h4>
                            <span className="stat-number">
                                {questions.filter(q => q.status === 'open').length}
                            </span>
                        </div>
                        <div className="stat-card">
                            <h4>Answered Questions</h4>
                            <span className="stat-number">
                                {questions.filter(q => q.answers > 0).length}
                            </span>
                        </div>
                        <div className="stat-card">
                            <h4>Average Votes</h4>
                            <span className="stat-number">
                                {questions.length > 0
                                    ? Math.round(questions.reduce((sum, q) => sum + (q.votes || 0), 0) / questions.length * 10) / 10
                                    : 0
                                }
                            </span>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                Previous
                            </button>

                            <div className="pagination-info">
                                <span>Page {currentPage} of {totalPages}</span>
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={fetchQuestions} className="retry-btn">
                        Retry
                    </button>
                </div>
            )}

            {showModal && (selectedQuestion || editingQuestion) && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingQuestion ? 'Edit Question' : 'Question Details'}</h3>
                            <button onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {editingQuestion ? (
                                <div className="edit-form">
                                    <div className="form-group">
                                        <label>Title:</label>
                                        <input
                                            type="text"
                                            value={editingQuestion.title}
                                            onChange={(e) => setEditingQuestion({
                                                ...editingQuestion,
                                                title: e.target.value
                                            })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Content:</label>
                                        <textarea
                                            value={editingQuestion.content}
                                            onChange={(e) => setEditingQuestion({
                                                ...editingQuestion,
                                                content: e.target.value
                                            })}
                                            rows={6}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tags (comma-separated):</label>
                                        <input
                                            type="text"
                                            value={editingQuestion.tags?.join(', ')}
                                            onChange={(e) => setEditingQuestion({
                                                ...editingQuestion,
                                                tags: e.target.value.split(',').map(tag => tag.trim())
                                            })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Status:</label>
                                        <select
                                            value={editingQuestion.status || 'open'}
                                            onChange={(e) => setEditingQuestion({
                                                ...editingQuestion,
                                                status: e.target.value
                                            })}
                                        >
                                            <option value="open">Open</option>
                                            <option value="closed">Closed</option>
                                            <option value="answered">Answered</option>
                                        </select>
                                    </div>
                                    <div className="modal-actions">
                                        <button onClick={handleSaveEdit} className="btn-primary">
                                            Save Changes
                                        </button>
                                        <button onClick={() => setShowModal(false)} className="btn-secondary">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="question-details">
                                    <div className="detail-row">
                                        <strong>Title:</strong> {selectedQuestion.title}
                                    </div>
                                    <div className="detail-row">
                                        <strong>Content:</strong>
                                        <div className="content-full">{selectedQuestion.content}</div>
                                    </div>
                                    <div className="detail-row">
                                        <strong>Author:</strong> {selectedQuestion.author?.username} ({selectedQuestion.author?.email})
                                    </div>
                                    <div className="detail-row">
                                        <strong>Tags:</strong> {selectedQuestion.tags?.join(', ')}
                                    </div>
                                    <div className="detail-row">
                                        <strong>Votes:</strong> {selectedQuestion.votes || 0}
                                    </div>
                                    <div className="detail-row">
                                        <strong>Answers:</strong> {selectedQuestion.answers || 0}
                                    </div>
                                    <div className="detail-row">
                                        <strong>Status:</strong> {selectedQuestion.status}
                                    </div>
                                    <div className="detail-row">
                                        <strong>Created:</strong> {new Date(selectedQuestion.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="detail-row">
                                        <strong>Updated:</strong> {new Date(selectedQuestion.updatedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Questions
