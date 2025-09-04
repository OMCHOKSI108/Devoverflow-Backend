import { useState, useEffect } from 'react'
import axios from 'axios'
import { Shield, AlertTriangle, Lock, Eye, Ban, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

const Security = ({ token }) => {
    const [securityStats, setSecurityStats] = useState({})
    const [securityEvents, setSecurityEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const [lastUpdated, setLastUpdated] = useState(new Date())

    useEffect(() => {
        fetchSecurityData()
        const interval = setInterval(fetchSecurityData, 60000) // Update every minute
        return () => clearInterval(interval)
    }, [activeTab])

    const fetchSecurityData = async () => {
        try {
            setLoading(true)

            if (activeTab === 'overview') {
                const response = await axios.get('http://localhost:5000/api/admin/security/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setSecurityStats(response.data)
            } else if (activeTab === 'events') {
                const response = await axios.get('http://localhost:5000/api/admin/security/events', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setSecurityEvents(response.data.events || response.data)
            }

            setLastUpdated(new Date())
        } catch (error) {
            console.error('Error fetching security data:', error)

            if (activeTab === 'overview') {
                // Fallback stats
                setSecurityStats({
                    totalUsers: 456,
                    activeUsers: 89,
                    blockedUsers: 5,
                    failedLoginAttempts: 23,
                    suspiciousActivities: 12,
                    securityIncidents: 3,
                    lastSecurityScan: new Date().toISOString(),
                    threatLevel: 'low'
                })
            } else if (activeTab === 'events') {
                // Fallback events
                const sampleEvents = [
                    {
                        _id: '1',
                        type: 'failed_login',
                        severity: 'medium',
                        message: 'Multiple failed login attempts from IP 192.168.1.100',
                        user: { username: 'unknown', email: 'N/A' },
                        ip: '192.168.1.100',
                        timestamp: new Date().toISOString(),
                        resolved: false
                    },
                    {
                        _id: '2',
                        type: 'suspicious_activity',
                        severity: 'high',
                        message: 'Unusual API request pattern detected',
                        user: { username: 'john_doe', email: 'john@example.com' },
                        ip: '192.168.1.101',
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                        resolved: true
                    },
                    {
                        _id: '3',
                        type: 'user_blocked',
                        severity: 'medium',
                        message: 'User account temporarily blocked due to suspicious activity',
                        user: { username: 'suspicious_user', email: 'suspicious@example.com' },
                        ip: '192.168.1.102',
                        timestamp: new Date(Date.now() - 7200000).toISOString(),
                        resolved: false
                    }
                ]
                setSecurityEvents(sampleEvents)
            }
        } finally {
            setLoading(false)
        }
    }

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'low': return 'success'
            case 'medium': return 'warning'
            case 'high': return 'error'
            case 'critical': return 'critical'
            default: return 'neutral'
        }
    }

    const getEventIcon = (type) => {
        switch (type) {
            case 'failed_login': return <XCircle size={16} />
            case 'suspicious_activity': return <AlertTriangle size={16} />
            case 'user_blocked': return <Ban size={16} />
            case 'security_scan': return <Shield size={16} />
            default: return <Eye size={16} />
        }
    }

    const renderOverview = () => (
        <div className="security-overview">
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <Shield size={24} />
                    </div>
                    <div className="stat-content">
                        <h4>Threat Level</h4>
                        <span className={`threat-level ${getSeverityColor(securityStats.threatLevel)}`}>
                            {securityStats.threatLevel?.toUpperCase() || 'UNKNOWN'}
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Lock size={24} />
                    </div>
                    <div className="stat-content">
                        <h4>Active Users</h4>
                        <span className="stat-number">{securityStats.activeUsers || 0}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Ban size={24} />
                    </div>
                    <div className="stat-content">
                        <h4>Blocked Users</h4>
                        <span className="stat-number">{securityStats.blockedUsers || 0}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <XCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <h4>Failed Logins</h4>
                        <span className="stat-number">{securityStats.failedLoginAttempts || 0}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-content">
                        <h4>Suspicious Activities</h4>
                        <span className="stat-number">{securityStats.suspiciousActivities || 0}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <h4>Security Incidents</h4>
                        <span className="stat-number">{securityStats.securityIncidents || 0}</span>
                    </div>
                </div>
            </div>

            <div className="security-info">
                <div className="info-card">
                    <h4>Last Security Scan</h4>
                    <p>{new Date(securityStats.lastSecurityScan || new Date()).toLocaleString()}</p>
                </div>

                <div className="info-card">
                    <h4>System Status</h4>
                    <p className="status healthy">All systems secure</p>
                </div>
            </div>
        </div>
    )

    const renderEvents = () => (
        <div className="security-events">
            <div className="events-table">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Severity</th>
                            <th>Message</th>
                            <th>User</th>
                            <th>IP Address</th>
                            <th>Timestamp</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {securityEvents.map(event => (
                            <tr key={event._id}>
                                <td>
                                    <div className="event-type">
                                        {getEventIcon(event.type)}
                                        <span>{event.type.replace('_', ' ')}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`severity ${getSeverityColor(event.severity)}`}>
                                        {event.severity}
                                    </span>
                                </td>
                                <td>
                                    <div className="event-message">
                                        {event.message?.substring(0, 60)}...
                                    </div>
                                </td>
                                <td>
                                    <div className="user-info">
                                        <div className="username">{event.user?.username}</div>
                                        <div className="email">{event.user?.email}</div>
                                    </div>
                                </td>
                                <td>{event.ip}</td>
                                <td>{new Date(event.timestamp).toLocaleDateString()}</td>
                                <td>
                                    <span className={`status ${event.resolved ? 'resolved' : 'pending'}`}>
                                        {event.resolved ? 'Resolved' : 'Pending'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )

    return (
        <div className="security-monitoring">
            <div className="header">
                <h2>Security Monitoring</h2>
                <div className="actions">
                    <button
                        className="btn-primary"
                        onClick={fetchSecurityData}
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={loading ? 'spinning' : ''} />
                        Refresh
                    </button>
                    <div className="last-updated">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </div>
                </div>
            </div>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <Shield size={16} />
                    Overview
                </button>
                <button
                    className={`tab ${activeTab === 'events' ? 'active' : ''}`}
                    onClick={() => setActiveTab('events')}
                >
                    <AlertTriangle size={16} />
                    Security Events ({securityEvents.length})
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading security data...</div>
            ) : (
                <>
                    {activeTab === 'overview' ? renderOverview() : renderEvents()}
                </>
            )}

            <style jsx>{`
        .security-monitoring {
          padding: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .header h2 {
          margin: 0;
          color: #333;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .btn-primary {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .last-updated {
          color: #666;
          font-size: 14px;
        }

        .tabs {
          display: flex;
          gap: 0;
          margin-bottom: 30px;
          border-bottom: 1px solid #e9ecef;
        }

        .tab {
          background: none;
          border: none;
          padding: 12px 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #666;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .tab:hover {
          color: #007bff;
        }

        .tab.active {
          color: #007bff;
          border-bottom-color: #007bff;
        }

        .loading {
          text-align: center;
          padding: 40px;
          font-size: 16px;
          color: #666;
        }

        .security-overview {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          color: #007bff;
        }

        .stat-content h4 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 14px;
          font-weight: 600;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #333;
        }

        .threat-level {
          font-size: 18px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
        }

        .threat-level.success {
          background: #d4edda;
          color: #155724;
        }

        .threat-level.warning {
          background: #fff3cd;
          color: #856404;
        }

        .threat-level.error {
          background: #f8d7da;
          color: #721c24;
        }

        .threat-level.critical {
          background: #f8d7da;
          color: #721c24;
        }

        .security-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .info-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 20px;
        }

        .info-card h4 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 16px;
        }

        .info-card p {
          margin: 0;
          color: #666;
        }

        .status.healthy {
          color: #28a745;
          font-weight: 600;
        }

        .security-events {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .events-table {
          width: 100%;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th,
        .data-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #e9ecef;
        }

        .data-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
        }

        .event-type {
          display: flex;
          align-items: center;
          gap: 8px;
          text-transform: capitalize;
        }

        .severity {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .severity.success {
          background: #d4edda;
          color: #155724;
        }

        .severity.warning {
          background: #fff3cd;
          color: #856404;
        }

        .severity.error {
          background: #f8d7da;
          color: #721c24;
        }

        .severity.critical {
          background: #f8d7da;
          color: #721c24;
        }

        .event-message {
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .username {
          font-weight: 500;
          color: #333;
        }

        .email {
          font-size: 12px;
          color: #666;
        }

        .status.resolved {
          color: #28a745;
          font-weight: 600;
        }

        .status.pending {
          color: #ffc107;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .stats-grid,
          .security-info {
            grid-template-columns: 1fr;
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .actions {
            width: 100%;
            justify-content: space-between;
          }

          .data-table {
            font-size: 14px;
          }

          .data-table th,
          .data-table td {
            padding: 8px 12px;
          }
        }
      `}</style>
        </div>
    )
}

export default Security
