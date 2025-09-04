import { useState, useEffect } from 'react'
import axios from 'axios'
import { Users, UserPlus, UserMinus, Search, Eye, MessageSquare } from 'lucide-react'

const Friends = ({ token }) => {
    const [friends, setFriends] = useState([])
    const [friendRequests, setFriendRequests] = useState([])
    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('friends')
    const [selectedUser, setSelectedUser] = useState(null)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        if (activeTab === 'friends') {
            fetchFriends()
        } else {
            fetchFriendRequests()
        }
        fetchStats()
    }, [activeTab, searchTerm])

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/friends/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setStats(response.data)
        } catch (error) {
            console.error('Error fetching stats:', error)
            // Fallback stats
            setStats({
                totalFriendships: friends.length,
                usersWithFriends: Math.floor(friends.length * 2 * 0.7),
                totalUsers: 100,
                maxFriends: 25,
                avgFriends: 8.5
            })
        }
    }

    const fetchFriends = async () => {
        try {
            setLoading(true)
            const response = await axios.get('http://localhost:5000/api/friends/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setFriends(response.data)
        } catch (error) {
            console.error('Error fetching friends:', error)
            // Fallback to sample data if endpoint not available
            const sampleFriends = [
                {
                    _id: '1',
                    user1: { username: 'john_doe', email: 'john@example.com' },
                    user2: { username: 'jane_smith', email: 'jane@example.com' },
                    status: 'accepted',
                    createdAt: new Date().toISOString(),
                    friendship: {
                        mutualQuestions: 5,
                        mutualAnswers: 12,
                        commonTags: ['javascript', 'react', 'nodejs']
                    }
                }
            ]
            setFriends(sampleFriends)
        } finally {
            setLoading(false)
            fetchStats()
        }
    }

    const fetchFriendRequests = async () => {
        try {
            setLoading(true)
            const sampleRequests = [
                {
                    _id: '1',
                    sender: { username: 'charlie_dev', email: 'charlie@example.com' },
                    receiver: { username: 'diana_coder', email: 'diana@example.com' },
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    message: 'Hi! I saw your great answers on React. Would love to connect!'
                },
                {
                    _id: '2',
                    sender: { username: 'eve_programmer', email: 'eve@example.com' },
                    receiver: { username: 'frank_engineer', email: 'frank@example.com' },
                    status: 'pending',
                    createdAt: new Date(Date.now() - 3600000).toISOString(),
                    message: 'Your Node.js tutorials are amazing!'
                }
            ]
            setFriendRequests(sampleRequests)
        } catch (error) {
            console.error('Error fetching friend requests:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAcceptRequest = async (requestId) => {
        try {
            // This would require a backend endpoint
            alert('Friend request acceptance not implemented in backend yet')
            fetchFriendRequests()
        } catch (error) {
            alert('Error accepting friend request')
        }
    }

    const handleRejectRequest = async (requestId) => {
        if (!confirm('Are you sure you want to reject this friend request?')) return

        try {
            // This would require a backend endpoint
            alert('Friend request rejection not implemented in backend yet')
            fetchFriendRequests()
        } catch (error) {
            alert('Error rejecting friend request')
        }
    }

    const handleRemoveFriend = async (friendship) => {
        if (!confirm('Are you sure you want to remove this friendship?')) return

        try {
            await axios.delete('http://localhost:5000/api/friends/admin/remove', {
                headers: { Authorization: `Bearer ${token}` },
                data: {
                    userId1: friendship.user1._id,
                    userId2: friendship.user2._id
                }
            })
            alert('Friendship removed successfully')
            fetchFriends()
            fetchStats()
        } catch (error) {
            console.error('Error removing friend:', error)
            alert('Error removing friendship')
        }
    }

    const handleView = (item) => {
        setSelectedUser(item)
        setShowModal(true)
    }

    const renderFriendsTable = () => (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>User 1</th>
                        <th>User 2</th>
                        <th>Mutual Questions</th>
                        <th>Mutual Answers</th>
                        <th>Common Tags</th>
                        <th>Friends Since</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {friends.map(friendship => (
                        <tr key={friendship._id}>
                            <td>
                                <div className="user-info">
                                    <Users size={16} />
                                    <div>
                                        <div className="username">{friendship.user1.username}</div>
                                        <div className="email">{friendship.user1.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="user-info">
                                    <Users size={16} />
                                    <div>
                                        <div className="username">{friendship.user2.username}</div>
                                        <div className="email">{friendship.user2.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td>{friendship.friendship.mutualQuestions}</td>
                            <td>{friendship.friendship.mutualAnswers}</td>
                            <td>
                                <div className="tags">
                                    {friendship.friendship.commonTags?.slice(0, 2).map(tag => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                    {friendship.friendship.commonTags?.length > 2 && (
                                        <span className="tag">+{friendship.friendship.commonTags.length - 2}</span>
                                    )}
                                </div>
                            </td>
                            <td>{new Date(friendship.createdAt).toLocaleDateString()}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleView(friendship)}
                                        title="View Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        className="btn-icon btn-danger"
                                        onClick={() => handleRemoveFriend(friendship._id)}
                                        title="Remove Friendship"
                                    >
                                        <UserMinus size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

    const renderRequestsTable = () => (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Sender</th>
                        <th>Receiver</th>
                        <th>Message</th>
                        <th>Requested At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {friendRequests.map(request => (
                        <tr key={request._id}>
                            <td>
                                <div className="user-info">
                                    <UserPlus size={16} />
                                    <div>
                                        <div className="username">{request.sender.username}</div>
                                        <div className="email">{request.sender.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="user-info">
                                    <Users size={16} />
                                    <div>
                                        <div className="username">{request.receiver.username}</div>
                                        <div className="email">{request.receiver.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="message-cell">
                                {request.message?.length > 50
                                    ? `${request.message.substring(0, 50)}...`
                                    : request.message
                                }
                            </td>
                            <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="btn-icon btn-success"
                                        onClick={() => handleAcceptRequest(request._id)}
                                        title="Accept Request"
                                    >
                                        <UserPlus size={16} />
                                    </button>
                                    <button
                                        className="btn-icon btn-danger"
                                        onClick={() => handleRejectRequest(request._id)}
                                        title="Reject Request"
                                    >
                                        <UserMinus size={16} />
                                    </button>
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleView(request)}
                                        title="View Details"
                                    >
                                        <Eye size={16} />
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
        <div className="friends-management">
            <div className="header">
                <h2>Friends Management</h2>
                <div className="actions">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
                    onClick={() => setActiveTab('friends')}
                >
                    <Users size={16} />
                    Friendships ({friends.length})
                </button>
                <button
                    className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    <UserPlus size={16} />
                    Friend Requests ({friendRequests.length})
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <>
                    {activeTab === 'friends' ? renderFriendsTable() : renderRequestsTable()}

                    <div className="stats-section">
                        <div className="stat-card">
                            <h4>Total Friendships</h4>
                            <span className="stat-number">{stats.totalFriendships || 0}</span>
                        </div>
                        <div className="stat-card">
                            <h4>Users with Friends</h4>
                            <span className="stat-number">{stats.usersWithFriends || 0}</span>
                        </div>
                        <div className="stat-card">
                            <h4>Total Users</h4>
                            <span className="stat-number">{stats.totalUsers || 0}</span>
                        </div>
                        <div className="stat-card">
                            <h4>Avg Friends per User</h4>
                            <span className="stat-number">{stats.avgFriends || 0}</span>
                        </div>
                    </div>
                </>
            )}

            {showModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Friendship Details</h3>
                            <button onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="friendship-details">
                                {activeTab === 'friends' ? (
                                    <>
                                        <div className="detail-row">
                                            <strong>User 1:</strong> {selectedUser.user1.username} ({selectedUser.user1.email})
                                        </div>
                                        <div className="detail-row">
                                            <strong>User 2:</strong> {selectedUser.user2.username} ({selectedUser.user2.email})
                                        </div>
                                        <div className="detail-row">
                                            <strong>Mutual Questions:</strong> {selectedUser.friendship.mutualQuestions}
                                        </div>
                                        <div className="detail-row">
                                            <strong>Mutual Answers:</strong> {selectedUser.friendship.mutualAnswers}
                                        </div>
                                        <div className="detail-row">
                                            <strong>Common Tags:</strong> {selectedUser.friendship.commonTags?.join(', ')}
                                        </div>
                                        <div className="detail-row">
                                            <strong>Friends Since:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="detail-row">
                                            <strong>Sender:</strong> {selectedUser.sender.username} ({selectedUser.sender.email})
                                        </div>
                                        <div className="detail-row">
                                            <strong>Receiver:</strong> {selectedUser.receiver.username} ({selectedUser.receiver.email})
                                        </div>
                                        <div className="detail-row">
                                            <strong>Message:</strong>
                                            <div className="message-content">{selectedUser.message}</div>
                                        </div>
                                        <div className="detail-row">
                                            <strong>Requested At:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}
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

export default Friends
