import { useState, useEffect } from 'react'
import axios from 'axios'
import { Users, FileText, MessageSquare, Flag, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import './Dashboard.css'

const Dashboard = ({ token }) => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchStats()
    }, [token])

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/admin/stats', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.data.success) {
                setStats(response.data.data)
            }
        } catch (err) {
            setError('Failed to load dashboard statistics')
            console.error('Dashboard error:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="dashboard">
                <div className="loading">Loading dashboard...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="dashboard">
                <div className="error">{error}</div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="dashboard">
                <div className="error">No data available</div>
            </div>
        )
    }

    const StatCard = ({ title, value, icon: Icon, trend, trendValue }) => (
        <div className="stat-card">
            <div className="stat-header">
                <div className="stat-icon">
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`stat-trend ${trend === 'up' ? 'positive' : 'negative'}`}>
                        {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span>{trendValue}%</span>
                    </div>
                )}
            </div>
            <div className="stat-content">
                <h3>{value}</h3>
                <p>{title}</p>
            </div>
        </div>
    )

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>Dashboard Overview</h2>
                <p>Welcome back! Here's what's happening with your platform.</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatCard
                    title="Total Users"
                    value={stats.totals.users}
                    icon={Users}
                    trend="up"
                    trendValue={stats.growth.users.growthRate}
                />
                <StatCard
                    title="Questions"
                    value={stats.totals.questions}
                    icon={FileText}
                    trend="up"
                    trendValue={stats.growth.questions.growthRate}
                />
                <StatCard
                    title="Answers"
                    value={stats.totals.answers}
                    icon={MessageSquare}
                    trend="up"
                    trendValue={stats.growth.answers.growthRate}
                />
                <StatCard
                    title="Pending Reports"
                    value={stats.totals.reports}
                    icon={Flag}
                />
            </div>

            {/* Activity Overview */}
            <div className="activity-section">
                <h3>Today's Activity</h3>
                <div className="activity-grid">
                    <div className="activity-item">
                        <Activity size={20} />
                        <div>
                            <span className="activity-number">{stats.activity.today.users}</span>
                            <span className="activity-label">New Users</span>
                        </div>
                    </div>
                    <div className="activity-item">
                        <FileText size={20} />
                        <div>
                            <span className="activity-number">{stats.activity.today.questions}</span>
                            <span className="activity-label">Questions</span>
                        </div>
                    </div>
                    <div className="activity-item">
                        <MessageSquare size={20} />
                        <div>
                            <span className="activity-number">{stats.activity.today.answers}</span>
                            <span className="activity-label">Answers</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Stats */}
            <div className="user-stats-section">
                <h3>User Statistics</h3>
                <div className="user-stats-grid">
                    <div className="user-stat">
                        <span className="stat-label">Verified Users</span>
                        <span className="stat-value">{stats.userStats.verified}</span>
                        <span className="stat-percentage">({stats.userStats.verificationRate}%)</span>
                    </div>
                    <div className="user-stat">
                        <span className="stat-label">Admin Users</span>
                        <span className="stat-value">{stats.userStats.admins}</span>
                    </div>
                    <div className="user-stat">
                        <span className="stat-label">Regular Users</span>
                        <span className="stat-value">{stats.userStats.regular}</span>
                    </div>
                </div>
            </div>

            {/* Content Stats */}
            <div className="content-stats-section">
                <h3>Content Statistics</h3>
                <div className="content-stats-grid">
                    <div className="content-stat">
                        <span className="stat-label">Questions with Answers</span>
                        <span className="stat-value">{stats.contentStats.questions.answered}</span>
                        <span className="stat-percentage">({stats.contentStats.questions.answerRate}%)</span>
                    </div>
                    <div className="content-stat">
                        <span className="stat-label">Accepted Answers</span>
                        <span className="stat-value">{stats.contentStats.answers.accepted}</span>
                        <span className="stat-percentage">({stats.contentStats.answers.acceptanceRate}%)</span>
                    </div>
                    <div className="content-stat">
                        <span className="stat-label">Avg Answers/Question</span>
                        <span className="stat-value">{stats.contentStats.answers.averagePerQuestion}</span>
                    </div>
                </div>
            </div>

            {/* System Health */}
            <div className="health-section">
                <h3>System Health</h3>
                <div className="health-score">
                    <div className="health-bar">
                        <div
                            className="health-fill"
                            style={{ width: `${stats.systemHealth.healthScore}%` }}
                        ></div>
                    </div>
                    <span className="health-value">{stats.systemHealth.healthScore}/100</span>
                </div>
                <p className="health-description">
                    Platform health score based on user engagement, content quality, and moderation load.
                </p>
            </div>
        </div>
    )
}

export default Dashboard
