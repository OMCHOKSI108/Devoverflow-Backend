import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, UserCheck, UserX, Shield, ShieldOff, Trash2, Edit, X } from 'lucide-react'
import './Users.css'

const Users = ({ token }) => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [showUpdateModal, setShowUpdateModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [updateForm, setUpdateForm] = useState({
        username: '',
        email: '',
        bio: ''
    })

    useEffect(() => {
        fetchUsers()
    }, [currentPage, searchTerm])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: currentPage,
                limit: 20
            })

            if (searchTerm) {
                params.append('search', searchTerm)
            }

            const response = await axios.get(`http://localhost:3000/api/admin/users?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.data.success) {
                setUsers(response.data.data.users)
                setTotalPages(response.data.data.pagination.totalPages)
            }
        } catch (err) {
            setError('Failed to load users')
            console.error('Users error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleUserAction = async (userId, action) => {
        try {
            const response = await axios.put(`http://localhost:3000/api/admin/users/${userId}`, {
                action
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.data.success) {
                // Refresh users list
                fetchUsers()
            }
        } catch (err) {
            console.error('User action error:', err)
            alert('Failed to perform action')
        }
    }

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return
        }

        try {
            const response = await axios.delete(`http://localhost:3000/api/admin/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.data.success) {
                alert('User deleted successfully')
                fetchUsers()
            }
        } catch (err) {
            console.error('Delete user error:', err)
            alert('Failed to delete user')
        }
    }

    const handleUpdateUser = (user) => {
        setSelectedUser(user)
        setUpdateForm({
            username: user.username,
            email: user.email,
            bio: user.bio || ''
        })
        setShowUpdateModal(true)
    }

    const handleUpdateSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.put(`http://localhost:3000/api/admin/users/${selectedUser._id}/details`, {
                username: updateForm.username,
                email: updateForm.email,
                bio: updateForm.bio
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.data.success) {
                alert('User updated successfully')
                setShowUpdateModal(false)
                setSelectedUser(null)
                fetchUsers()
            }
        } catch (err) {
            console.error('Update user error:', err)
            alert('Failed to update user')
        }
    }

    const UserCard = ({ user }) => (
        <div className="user-card">
            <div className="user-info">
                <div className="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                    <h4>{user.username}</h4>
                    <p>{user.email}</p>
                    <div className="user-meta">
                        <span className={`status ${user.isVerified ? 'verified' : 'unverified'}`}>
                            {user.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                        <span className={`role ${user.isAdmin ? 'admin' : 'user'}`}>
                            {user.isAdmin ? 'Admin' : 'User'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="user-actions">
                {!user.isVerified && (
                    <button
                        className="action-btn verify"
                        onClick={() => handleUserAction(user._id, 'verify')}
                    >
                        <UserCheck size={16} />
                        Verify
                    </button>
                )}

                {user.isAdmin ? (
                    <button
                        className="action-btn remove-admin"
                        onClick={() => handleUserAction(user._id, 'remove_admin')}
                    >
                        <ShieldOff size={16} />
                        Remove Admin
                    </button>
                ) : (
                    <button
                        className="action-btn make-admin"
                        onClick={() => handleUserAction(user._id, 'make_admin')}
                    >
                        <Shield size={16} />
                        Make Admin
                    </button>
                )}

                <button
                    className="action-btn suspend"
                    onClick={() => handleUserAction(user._id, 'suspend')}
                >
                    <UserX size={16} />
                    Suspend
                </button>

                <button
                    className="action-btn edit"
                    onClick={() => handleUpdateUser(user)}
                >
                    <Edit size={16} />
                    Edit
                </button>

                <button
                    className="action-btn delete"
                    onClick={() => handleDeleteUser(user._id)}
                >
                    <Trash2 size={16} />
                    Delete
                </button>
            </div>
        </div>
    )

    return (
        <div className="users">
            <div className="users-header">
                <h2>User Management</h2>
                <p>Manage user accounts, permissions, and verification status.</p>
            </div>

            {/* Search */}
            <div className="search-section">
                <div className="search-input">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search users by username or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Users List */}
            {loading ? (
                <div className="loading">Loading users...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <>
                    <div className="users-grid">
                        {users.map((user) => (
                            <UserCard key={user._id} user={user} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            >
                                Previous
                            </button>

                            <span>Page {currentPage} of {totalPages}</span>

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Update User Modal */}
            {showUpdateModal && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Update User Details</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowUpdateModal(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateSubmit} className="modal-body">
                            <div className="form-group">
                                <label>Username:</label>
                                <input
                                    type="text"
                                    value={updateForm.username}
                                    onChange={(e) => setUpdateForm({ ...updateForm, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={updateForm.email}
                                    onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Bio:</label>
                                <textarea
                                    value={updateForm.bio}
                                    onChange={(e) => setUpdateForm({ ...updateForm, bio: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowUpdateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary">
                                    Update User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Users
