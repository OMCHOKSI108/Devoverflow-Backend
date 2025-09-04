import { useState, useEffect } from 'react'
import axios from 'axios'
import { MessageCircle, Search, Eye, Edit, Trash2, Plus } from 'lucide-react'
import './Comments.css'

function Comments({ token }) {
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedComment, setSelectedComment] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [editingComment, setEditingComment] = useState(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newComment, setNewComment] = useState({
        content: '',
        contentType: 'question',
        contentId: ''
    })
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [debounceTimer, setDebounceTimer] = useState(null)

    useEffect(() => {
        fetchComments()
    }, [searchTerm, currentPage])

    const fetchComments = async () => {
        try {
            setLoading(true)
            setError('')
            const params = new URLSearchParams({
                page: currentPage,
                limit: 20
            })
            if (searchTerm) params.append('search', searchTerm)

            const response = await axios.get(`http://localhost:3000/api/admin/comments?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                setComments(response.data.data.comments || [])
                setTotalPages(response.data.data.pagination?.totalPages || 1)
            } else {
                setComments([])
                setError('Failed to load comments')
            }
        } catch (error) {
            console.error('Error fetching comments:', error)
            setError(error.response?.data?.message || 'Failed to load comments')
            setComments([])
        } finally {
            setLoading(false)
        }
    }

    const handleSearchChange = (value) => {
        setSearchTerm(value)
        setCurrentPage(1)

        if (debounceTimer) {
            clearTimeout(debounceTimer)
        }

        const timer = setTimeout(() => {
            // Search will trigger via useEffect
        }, 500)

        setDebounceTimer(timer)
    }

    const handleDelete = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) return

        try {
            const response = await axios.delete(`http://localhost:3000/api/admin/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                alert('Comment deleted successfully')
                fetchComments()
            } else {
                alert('Failed to delete comment')
            }
        } catch (error) {
            console.error('Error deleting comment:', error)
            alert(error.response?.data?.message || 'Error deleting comment')
        }
    }

    const handleEdit = (comment) => {
        setEditingComment(comment)
        setShowModal(true)
    }

    const handleSaveEdit = async () => {
        try {
            const response = await axios.put(`http://localhost:3000/api/admin/comments/${editingComment._id}`, {
                content: editingComment.content
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                alert('Comment updated successfully')
                setShowModal(false)
                setEditingComment(null)
                fetchComments()
            } else {
                alert('Failed to update comment')
            }
        } catch (error) {
            console.error('Error updating comment:', error)
            alert(error.response?.data?.message || 'Error updating comment')
        }
    }

    const handleAddComment = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post(`http://localhost:3000/api/admin/comments`, newComment, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                alert('Comment added successfully')
                setShowAddModal(false)
                setNewComment({
                    content: '',
                    contentType: 'question',
                    contentId: ''
                })
                fetchComments()
            } else {
                alert('Failed to add comment')
            }
        } catch (error) {
            console.error('Error adding comment:', error)
            alert(error.response?.data?.message || 'Error adding comment')
        }
    }

    const handleView = (comment) => {
        setSelectedComment(comment)
        setShowModal(true)
    }

    const renderCommentsTable = () => (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Content</th>
                        <th>Author</th>
                        <th>Type</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {comments.map(comment => (
                        <tr key={comment._id}>
                            <td>
                                <div className="comment-content">
                                    <MessageCircle size={16} />
                                    <div>
                                        <div className="content-preview">
                                            {comment.content?.substring(0, 100)}...
                                        </div>
                                        {comment.isAdminComment && (
                                            <span className="admin-badge">Admin Comment</span>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="user-info">
                                    <div>
                                        <div className="username">{comment.user?.username}</div>
                                        <div className="email">{comment.user?.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span className={`content-type ${comment.contentType}`}>
                                    {comment.contentType}
                                </span>
                            </td>
                            <td>{new Date(comment.createdAt).toLocaleDateString()}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleView(comment)}
                                        title="View Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleEdit(comment)}
                                        title="Edit Comment"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className="btn-icon btn-danger"
                                        onClick={() => handleDelete(comment._id)}
                                        title="Delete Comment"
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
        <div className="comments-management">
            <div className="header">
                <h2>Comments Management</h2>
                <div className="actions">
                    <button
                        className="btn-add"
                        onClick={() => setShowAddModal(true)}
                    >
                        <Plus size={16} />
                        Add Comment
                    </button>
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search comments..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Loading comments...</p>
                </div>
            ) : error ? (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={fetchComments} className="retry-btn">
                        Retry
                    </button>
                </div>
            ) : (
                <>
                    {renderCommentsTable()}

                    <div className="stats-section">
                        <div className="stat-card">
                            <h4>Total Comments</h4>
                            <span className="stat-number">{comments.length}</span>
                        </div>
                        <div className="stat-card">
                            <h4>Admin Comments</h4>
                            <span className="stat-number">
                                {comments.filter(c => c.isAdminComment).length}
                            </span>
                        </div>
                        <div className="stat-card">
                            <h4>Question Comments</h4>
                            <span className="stat-number">
                                {comments.filter(c => c.contentType === 'question').length}
                            </span>
                        </div>
                        <div className="stat-card">
                            <h4>Answer Comments</h4>
                            <span className="stat-number">
                                {comments.filter(c => c.contentType === 'answer').length}
                            </span>
                        </div>
                    </div>

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

            {/* Add Comment Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Add Comment</h3>
                            <button onClick={() => setShowAddModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddComment} className="modal-body">
                            <div className="form-group">
                                <label>Content Type:</label>
                                <select
                                    value={newComment.contentType}
                                    onChange={(e) => setNewComment({ ...newComment, contentType: e.target.value })}
                                    required
                                >
                                    <option value="question">Question</option>
                                    <option value="answer">Answer</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Content ID:</label>
                                <input
                                    type="text"
                                    value={newComment.contentId}
                                    onChange={(e) => setNewComment({ ...newComment, contentId: e.target.value })}
                                    placeholder="Enter question/answer ID"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Comment:</label>
                                <textarea
                                    value={newComment.content}
                                    onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary">
                                    Add Comment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View/Edit Modal */}
            {showModal && (selectedComment || editingComment) && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingComment ? 'Edit Comment' : 'Comment Details'}</h3>
                            <button onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {editingComment ? (
                                <div className="edit-form">
                                    <div className="form-group">
                                        <label>Content:</label>
                                        <textarea
                                            value={editingComment.content}
                                            onChange={(e) => setEditingComment({
                                                ...editingComment,
                                                content: e.target.value
                                            })}
                                            rows={6}
                                        />
                                    </div>
                                    <div className="modal-actions">
                                        <button onClick={handleSaveEdit} className="primary">
                                            Save Changes
                                        </button>
                                        <button onClick={() => setShowModal(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="comment-details">
                                    <div className="detail-row">
                                        <strong>Content:</strong>
                                        <div className="content-full">{selectedComment.content}</div>
                                    </div>
                                    <div className="detail-row">
                                        <strong>Author:</strong> {selectedComment.user?.username}
                                        {selectedComment.user?.isAdmin && <span className="admin-badge"> (Admin)</span>}
                                    </div>
                                    <div className="detail-row">
                                        <strong>Type:</strong> {selectedComment.contentType}
                                    </div>
                                    <div className="detail-row">
                                        <strong>Created:</strong> {new Date(selectedComment.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="detail-row">
                                        <strong>Updated:</strong> {new Date(selectedComment.updatedAt).toLocaleDateString()}
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

export default Comments;
