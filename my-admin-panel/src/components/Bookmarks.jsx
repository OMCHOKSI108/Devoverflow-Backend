import { useState, useEffect } from 'react'
import axios from 'axios'
import { Bookmark, Search, Trash2, Eye, User } from 'lucide-react'

const Bookmarks = ({ token }) => {
    const [bookmarks, setBookmarks] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [page, setPage] = useState(1)
    const [selectedBookmark, setSelectedBookmark] = useState(null)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        fetchBookmarks()
    }, [page, searchTerm])

    const fetchBookmarks = async () => {
        try {
            setLoading(true)
            // This would require getting bookmarks from all users or a specific user
            // For admin purposes, we'll show a sample structure
            const sampleBookmarks = [
                {
                    _id: '1',
                    user: { username: 'john_doe', email: 'john@example.com' },
                    question: {
                        _id: 'q1',
                        title: 'How to implement JWT authentication?',
                        tags: ['jwt', 'authentication', 'nodejs'],
                        votes: 15,
                        answersCount: 3
                    },
                    createdAt: new Date().toISOString()
                },
                {
                    _id: '2',
                    user: { username: 'jane_smith', email: 'jane@example.com' },
                    question: {
                        _id: 'q2',
                        title: 'React state management best practices',
                        tags: ['react', 'state-management', 'redux'],
                        votes: 8,
                        answersCount: 5
                    },
                    createdAt: new Date(Date.now() - 86400000).toISOString()
                }
            ]
            setBookmarks(sampleBookmarks)
        } catch (error) {
            console.error('Error fetching bookmarks:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (bookmarkId) => {
        if (!confirm('Are you sure you want to remove this bookmark?')) return

        try {
            // This would require a backend endpoint
            alert('Bookmark deletion not implemented in backend yet')
            fetchBookmarks()
        } catch (error) {
            alert('Error removing bookmark')
        }
    }

    const handleView = (bookmark) => {
        setSelectedBookmark(bookmark)
        setShowModal(true)
    }

    return (
        <div className="bookmarks-management">
            <div className="header">
                <h2>Bookmarks Management</h2>
                <div className="actions">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search bookmarks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Question</th>
                            <th>Tags</th>
                            <th>Votes</th>
                            <th>Answers</th>
                            <th>Bookmarked At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookmarks.map(bookmark => (
                            <tr key={bookmark._id}>
                                <td>
                                    <div className="user-info">
                                        <User size={16} />
                                        <div>
                                            <div className="username">{bookmark.user.username}</div>
                                            <div className="email">{bookmark.user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="title-cell">{bookmark.question.title}</td>
                                <td>
                                    <div className="tags">
                                        {bookmark.question.tags?.slice(0, 2).map(tag => (
                                            <span key={tag} className="tag">{tag}</span>
                                        ))}
                                        {bookmark.question.tags?.length > 2 && <span className="tag">+{bookmark.question.tags.length - 2}</span>}
                                    </div>
                                </td>
                                <td>{bookmark.question.votes || 0}</td>
                                <td>{bookmark.question.answersCount || 0}</td>
                                <td>{new Date(bookmark.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleView(bookmark)}
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => handleDelete(bookmark._id)}
                                            title="Remove Bookmark"
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

            <div className="pagination">
                <button
                    className="btn-secondary"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                >
                    Previous
                </button>
                <span>Page {page}</span>
                <button
                    className="btn-secondary"
                    onClick={() => setPage(page + 1)}
                    disabled={bookmarks.length < 20}
                >
                    Next
                </button>
            </div>

            {showModal && selectedBookmark && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Bookmark Details</h3>
                            <button onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="bookmark-details">
                                <div className="detail-row">
                                    <strong>User:</strong> {selectedBookmark.user.username} ({selectedBookmark.user.email})
                                </div>
                                <div className="detail-row">
                                    <strong>Question:</strong> {selectedBookmark.question.title}
                                </div>
                                <div className="detail-row">
                                    <strong>Tags:</strong> {selectedBookmark.question.tags?.join(', ')}
                                </div>
                                <div className="detail-row">
                                    <strong>Votes:</strong> {selectedBookmark.question.votes || 0}
                                </div>
                                <div className="detail-row">
                                    <strong>Answers:</strong> {selectedBookmark.question.answersCount || 0}
                                </div>
                                <div className="detail-row">
                                    <strong>Bookmarked At:</strong> {new Date(selectedBookmark.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Bookmarks
