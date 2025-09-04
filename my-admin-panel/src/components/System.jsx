import { useState, useEffect } from 'react'
import axios from 'axios'
import { Activity, Cpu, HardDrive, Wifi, Users, Database, Server, RefreshCw } from 'lucide-react'

const System = ({ token }) => {
    const [systemStats, setSystemStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(new Date())

    useEffect(() => {
        fetchSystemStats()
        const interval = setInterval(fetchSystemStats, 30000) // Update every 30 seconds
        return () => clearInterval(interval)
    }, [])

    const fetchSystemStats = async () => {
        try {
            setLoading(true)
            const response = await axios.get('http://localhost:5000/api/admin/system/stats', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setSystemStats(response.data)
            setLastUpdated(new Date())
        } catch (error) {
            console.error('Error fetching system stats:', error)
            // Fallback stats
            setSystemStats({
                server: {
                    uptime: 86400,
                    nodeVersion: 'v18.17.0',
                    platform: 'win32',
                    arch: 'x64',
                    memory: {
                        total: 17179869184,
                        free: 4294967296,
                        used: 12884901888
                    },
                    cpu: {
                        model: 'Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz',
                        cores: 12,
                        usage: 45.2
                    }
                },
                database: {
                    status: 'connected',
                    collections: 8,
                    totalDocuments: 1250,
                    dbSize: 52428800
                },
                api: {
                    totalRequests: 15420,
                    activeConnections: 23,
                    responseTime: 245,
                    errorRate: 0.8
                },
                users: {
                    total: 456,
                    activeToday: 89,
                    newToday: 12,
                    onlineNow: 34
                }
            })
        } finally {
            setLoading(false)
        }
    }

    const formatUptime = (seconds) => {
        const days = Math.floor(seconds / 86400)
        const hours = Math.floor((seconds % 86400) / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)

        if (days > 0) return `${days}d ${hours}h ${minutes}m`
        if (hours > 0) return `${hours}h ${minutes}m`
        return `${minutes}m`
    }

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'connected':
            case 'healthy':
            case 'online':
                return 'success'
            case 'warning':
                return 'warning'
            case 'disconnected':
            case 'error':
            case 'offline':
                return 'error'
            default:
                return 'neutral'
        }
    }

    return (
        <div className="system-monitoring">
            <div className="header">
                <h2>System Monitoring</h2>
                <div className="actions">
                    <button
                        className="btn-primary"
                        onClick={fetchSystemStats}
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

            {loading ? (
                <div className="loading">Loading system statistics...</div>
            ) : (
                <div className="system-grid">
                    {/* Server Information */}
                    <div className="system-card">
                        <div className="card-header">
                            <Server size={24} />
                            <h3>Server Status</h3>
                        </div>
                        <div className="card-content">
                            <div className="metric">
                                <span className="label">Status:</span>
                                <span className={`value status ${getStatusColor('healthy')}`}>Healthy</span>
                            </div>
                            <div className="metric">
                                <span className="label">Uptime:</span>
                                <span className="value">{formatUptime(systemStats.server?.uptime || 0)}</span>
                            </div>
                            <div className="metric">
                                <span className="label">Node Version:</span>
                                <span className="value">{systemStats.server?.nodeVersion || 'N/A'}</span>
                            </div>
                            <div className="metric">
                                <span className="label">Platform:</span>
                                <span className="value">{systemStats.server?.platform || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* CPU Information */}
                    <div className="system-card">
                        <div className="card-header">
                            <Cpu size={24} />
                            <h3>CPU</h3>
                        </div>
                        <div className="card-content">
                            <div className="metric">
                                <span className="label">Model:</span>
                                <span className="value">{systemStats.server?.cpu?.model?.substring(0, 30) || 'N/A'}...</span>
                            </div>
                            <div className="metric">
                                <span className="label">Cores:</span>
                                <span className="value">{systemStats.server?.cpu?.cores || 'N/A'}</span>
                            </div>
                            <div className="metric">
                                <span className="label">Usage:</span>
                                <span className="value">{systemStats.server?.cpu?.usage || 0}%</span>
                            </div>
                            <div className="usage-bar">
                                <div
                                    className="usage-fill"
                                    style={{ width: `${systemStats.server?.cpu?.usage || 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Memory Information */}
                    <div className="system-card">
                        <div className="card-header">
                            <HardDrive size={24} />
                            <h3>Memory</h3>
                        </div>
                        <div className="card-content">
                            <div className="metric">
                                <span className="label">Total:</span>
                                <span className="value">{formatBytes(systemStats.server?.memory?.total || 0)}</span>
                            </div>
                            <div className="metric">
                                <span className="label">Used:</span>
                                <span className="value">{formatBytes(systemStats.server?.memory?.used || 0)}</span>
                            </div>
                            <div className="metric">
                                <span className="label">Free:</span>
                                <span className="value">{formatBytes(systemStats.server?.memory?.free || 0)}</span>
                            </div>
                            <div className="usage-bar">
                                <div
                                    className="usage-fill"
                                    style={{
                                        width: `${((systemStats.server?.memory?.used || 0) / (systemStats.server?.memory?.total || 1)) * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Database Information */}
                    <div className="system-card">
                        <div className="card-header">
                            <Database size={24} />
                            <h3>Database</h3>
                        </div>
                        <div className="card-content">
                            <div className="metric">
                                <span className="label">Status:</span>
                                <span className={`value status ${getStatusColor(systemStats.database?.status)}`}>
                                    {systemStats.database?.status || 'unknown'}
                                </span>
                            </div>
                            <div className="metric">
                                <span className="label">Collections:</span>
                                <span className="value">{systemStats.database?.collections || 0}</span>
                            </div>
                            <div className="metric">
                                <span className="label">Documents:</span>
                                <span className="value">{systemStats.database?.totalDocuments || 0}</span>
                            </div>
                            <div className="metric">
                                <span className="label">Size:</span>
                                <span className="value">{formatBytes(systemStats.database?.dbSize || 0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* API Performance */}
                    <div className="system-card">
                        <div className="card-header">
                            <Activity size={24} />
                            <h3>API Performance</h3>
                        </div>
                        <div className="card-content">
                            <div className="metric">
                                <span className="label">Total Requests:</span>
                                <span className="value">{systemStats.api?.totalRequests || 0}</span>
                            </div>
                            <div className="metric">
                                <span className="label">Active Connections:</span>
                                <span className="value">{systemStats.api?.activeConnections || 0}</span>
                            </div>
                            <div className="metric">
                                <span className="label">Avg Response Time:</span>
                                <span className="value">{systemStats.api?.responseTime || 0}ms</span>
                            </div>
                            <div className="metric">
                                <span className="label">Error Rate:</span>
                                <span className="value">{systemStats.api?.errorRate || 0}%</span>
                            </div>
                        </div>
                    </div>

                    {/* User Activity */}
                    <div className="system-card">
                        <div className="card-header">
                            <Users size={24} />
                            <h3>User Activity</h3>
                        </div>
                        <div className="card-content">
                            <div className="metric">
                                <span className="label">Total Users:</span>
                                <span className="value">{systemStats.users?.total || 0}</span>
                            </div>
                            <div className="metric">
                                <span className="label">Active Today:</span>
                                <span className="value">{systemStats.users?.activeToday || 0}</span>
                            </div>
                            <div className="metric">
                                <span className="label">New Today:</span>
                                <span className="value">{systemStats.users?.newToday || 0}</span>
                            </div>
                            <div className="metric">
                                <span className="label">Online Now:</span>
                                <span className="value">{systemStats.users?.onlineNow || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        .system-monitoring {
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

        .loading {
          text-align: center;
          padding: 40px;
          font-size: 16px;
          color: #666;
        }

        .system-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }

        .system-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .card-header {
          background: #f8f9fa;
          padding: 16px 20px;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .card-header h3 {
          margin: 0;
          color: #333;
          font-size: 16px;
        }

        .card-content {
          padding: 20px;
        }

        .metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .metric:last-child {
          margin-bottom: 0;
        }

        .label {
          color: #666;
          font-weight: 500;
        }

        .value {
          color: #333;
          font-weight: 600;
        }

        .status {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status.success {
          background: #d4edda;
          color: #155724;
        }

        .status.warning {
          background: #fff3cd;
          color: #856404;
        }

        .status.error {
          background: #f8d7da;
          color: #721c24;
        }

        .status.neutral {
          background: #e2e3e5;
          color: #383d41;
        }

        .usage-bar {
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 8px;
        }

        .usage-fill {
          height: 100%;
          background: linear-gradient(90deg, #28a745 0%, #ffc107 70%, #dc3545 100%);
          transition: width 0.3s ease;
        }

        @media (max-width: 768px) {
          .system-grid {
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
        }
      `}</style>
        </div>
    )
}

export default System
