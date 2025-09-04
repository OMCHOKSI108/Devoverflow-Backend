import { useState, useEffect } from 'react'
import axios from 'axios'
import { MessageSquare, Search, Eye, Edit, Trash2, CheckCircle, Filter } from 'lucide-react'

const Answers = ({ token }) => {
    const [answers, setAnswers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [editingAnswer, setEditingAnswer] = useState(null)

    useEffect(() => {
        fetchAnswers()
    }, [searchTerm, filterStatus])

    const fetchAnswers = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (searchTerm) params.append('search', searchTerm)
            if (filterStatus !== 'all') params.append('status', filterStatus)

            // This would need a backend endpoint for admin to get all answers
            const response = await axios.get(`http://localhost:3000/api/admin/answers?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setAnswers(response.data.data?.answers || response.data.answers || [])
        } catch (error) {
            console.error('Error fetching answers:', error)
            // Fallback to sample data
            const sampleAnswers = [
                {
                    _id: '1',
                    content: 'You can implement JWT authentication by installing the jsonwebtoken package...',
                    author: { username: 'john_doe', email: 'john@example.com' },
                    question: {
                        _id: 'q1',
                        title: 'How to implement JWT authentication in Node.js?'
                    },
                    votes: 12,
                    isAccepted: true,
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    _id: '2',
                    content: 'The useEffect hook runs on every render when you don\'t provide dependencies...',
                    author: { username: 'jane_smith', email: 'jane@example.com' },
                    question: {
                        _id: 'q2',
                        title: 'React useEffect hook not working as expected'
                    },
                    votes: 8,
                    isAccepted: false,
                    status: 'active',
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    updatedAt: new Date(Date.now() - 86400000).toISOString()
                }
            ]
            setAnswers(sampleAnswers)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (answerId) => {
        if (!confirm('Are you sure you want to delete this answer?')) return

        try {
            await axios.delete(`http://localhost:5000/api/answers/${answerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            alert('Answer deleted successfully')
            fetchAnswers()
        } catch (error) {
            console.error('Error deleting answer:', error)
            alert('Error deleting answer')
        }
    }

    const handleAccept = async (answerId) => {
        try {
            const response = await axios.put(`http://localhost:3000/api/admin/answers/${answerId}`, {
                isAccepted: true
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                alert('Answer accepted successfully')
                fetchAnswers()
            } else {
                alert('Failed to accept answer')
            }
        } catch (error) {
            console.error('Error accepting answer:', error)
            alert(error.response?.data?.message || 'Error accepting answer')
        }
    }

    const handleEdit = (answer) => {
        setEditingAnswer(answer)
        setShowModal(true)
    }

    const handleSaveEdit = async () => {
        try {
            const response = await axios.put(`http://localhost:3000/api/admin/answers/${editingAnswer._id}`, {
                content: editingAnswer.content,
                isAccepted: editingAnswer.isAccepted
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                alert('Answer updated successfully')
                setShowModal(false)
                setEditingAnswer(null)
                fetchAnswers()
            } else {
                alert('Failed to update answer')
            }
        } catch (error) {
            console.error('Error updating answer:', error)
            alert(error.response?.data?.message || 'Error updating answer')
        }
    }

    const handleView = (answer) => {
        setSelectedAnswer(answer)
        setShowModal(true)
    }

    const renderAnswersTable = () => (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Content</th>
                        <th>Author</th>
                        <th>Question</th>
                        <th>Votes</th>
                        <th>Accepted</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {answers.map(answer => (
                        <tr key={answer._id}>
                            <td>
                                <div className="answer-content">
                                    <MessageSquare size={16} />
                                    <div>
                                        <div className="content-preview">
                                            {answer.content?.substring(0, 100)}...
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="user-info">
                                    <div>
                                        <div className="username">{answer.author?.username}</div>
                                        <div className="email">{answer.author?.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="question-info">
                                    <div className="question-title">
                                        {answer.question?.title?.substring(0, 50)}...
                                    </div>
                                    <div className="question-id">ID: {answer.question?._id}</div>
                                </div>
                            </td>
                            <td>{answer.votes || 0}</td>
                            <td>
                                {answer.isAccepted ? (
                                    <CheckCircle size={16} className="accepted-icon" />
                                ) : (
                                    <span className="not-accepted">-</span>
                                )}
                            </td>
                            <td>
                                <span className={`status ${answer.status}`}>
                                    {answer.status}
                                </span>
                            </td>
                            <td>{new Date(answer.createdAt).toLocaleDateString()}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleView(answer)}
                                        title="View Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleEdit(answer)}
                                        title="Edit Answer"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    {!answer.isAccepted && (
                                        <button
                                            className="btn-icon btn-success"
                                            onClick={() => handleAccept(answer._id)}
                                            title="Accept Answer"
                                        >
                                            <CheckCircle size={16} />
                                        </button>
                                    )}
                                    <button
                                        className="btn-icon btn-danger"
                                        onClick={() => handleDelete(answer._id)}
                                        title="Delete Answer"
                                    >
                                        <Trash2 size={16} />
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
        <div className="answers-management">
            <div className="header">
                <h2>Answers Management</h2>
                <div className="actions">
                    <div className="filter-section">
                        <Filter size={20} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="deleted">Deleted</option>
                            <option value="accepted">Accepted</option>
                        </select>
                    </div>
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search answers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading answers...</div>
            ) : (
                <>
                    {renderAnswersTable()}

                    <div className="stats-section">
                        <div className="stat-card">
                            <h4>Total Answers</h4>
                            <span className="stat-number">{answers.length}</span>
                        </div>
                        <div className="stat-card">
                            <h4>Accepted Answers</h4>
                            <span className="stat-number">
                                {answers.filter(a => a.isAccepted).length}
                            </span>
                        </div>
                        <div className="stat-card">
                            <h4>Average Votes</h4>
                            <span className="stat-number">
                                {answers.length > 0
                                    ? Math.round(answers.reduce((sum, a) => sum + (a.votes || 0), 0) / answers.length * 10) / 10
                                    : 0
                                }
                            </span>
                        </div>
                        <div className="stat-card">
                            <h4>Acceptance Rate</h4>
                            <span className="stat-number">
                                {answers.length > 0
                                    ? Math.round((answers.filter(a => a.isAccepted).length / answers.length) * 100)
                                    : 0
                                }%
                            </span>
                        </div>
                    </div>
                </>
            )}

            {showModal && (selectedAnswer || editingAnswer) && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingAnswer ? 'Edit Answer' : 'Answer Details'}</h3>
                            <button onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {editingAnswer ? (
                                <div className="edit-form">
                                    <div className="form-group">
                                        <label>Content:</label>
                                        <textarea
                                            value={editingAnswer.content}
                                            onChange={(e) => setEditingAnswer({
                                                ...editingAnswer,
                                                content: e.target.value
                                            })}
                                            rows={8}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={editingAnswer.isAccepted || false}
                                                onChange={(e) => setEditingAnswer({
                                                    ...editingAnswer,
                                                    isAccepted: e.target.checked
                                                })}
                                            />
                                            Mark as Accepted Answer
                                        </label>
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
                                <div className="answer-details">
                                    <div className="detail-row">
                                        <strong>Content:</strong>
                                        <div className="content-full">{selectedAnswer.content}</div>
                                    </div>
                                    <div className="detail-row">
                                        <strong>Author:</strong> {selectedAnswer.author?.username} ({selectedAnswer.author?.email})
                                    </div>
                                    <div className="detail-row">
                                        <strong>Question:</strong> {selectedAnswer.question?.title}
                                    </div>
                                    <div className="detail-row">
                                        <strong>Votes:</strong> {selectedAnswer.votes || 0}
                                    </div>
                                    <div className="detail-row">
                                        <strong>Accepted:</strong> {selectedAnswer.isAccepted ? 'Yes' : 'No'}
                                    </div>
                                    <div className="detail-row">
                                        <strong>Status:</strong> {selectedAnswer.status}
                                    </div>
                                    <div className="detail-row">
                                        <strong>Created:</strong> {new Date(selectedAnswer.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="detail-row">
                                        <strong>Updated:</strong> {new Date(selectedAnswer.updatedAt).toLocaleDateString()}
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

export default Answers
