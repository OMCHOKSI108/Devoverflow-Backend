import { useState, useEffect } from 'react'
import axios from 'axios'
import { Flag, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react'
import './Reports.css'

const Reports = ({ token }) => {
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchReports()
    }, [currentPage, statusFilter])

    const fetchReports = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: currentPage,
                limit: 20
            })

            if (statusFilter !== 'all') {
                params.append('status', statusFilter)
            }

            const response = await axios.get(`http://localhost:3000/api/admin/reports?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.data.success) {
                setReports(response.data.data.reports)
                setTotalPages(response.data.data.pagination.totalPages)
            }
        } catch (err) {
            setError('Failed to load reports')
            console.error('Reports error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleReportAction = async (reportId, action) => {
        try {
            const response = await axios.put(`http://localhost:3000/api/admin/reports/${reportId}/resolve`, {
                action
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.data.success) {
                // Refresh reports list
                fetchReports()
            }
        } catch (err) {
            console.error('Report action error:', err)
            alert('Failed to perform action')
        }
    }

    const handleDeleteContent = async (contentType, contentId) => {
        if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
            return
        }

        try {
            const response = await axios.delete(`http://localhost:3000/api/admin/content/${contentType}/${contentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.data.success) {
                alert('Content deleted successfully')
                fetchReports()
            }
        } catch (err) {
            console.error('Delete content error:', err)
            alert('Failed to delete content')
        }
    }

    const ReportCard = ({ report }) => (
        <div className="report-card">
            <div className="report-header">
                <div className="report-type">
                    <Flag size={16} />
                    <span>{report.contentType} Report</span>
                </div>
                <div className={`report-status ${report.status}`}>
                    {report.status}
                </div>
            </div>

            <div className="report-content">
                <div className="reporter-info">
                    <strong>Reported by:</strong> {report.reporter.username} ({report.reporter.email})
                </div>
                <div className="reason">
                    <strong>Reason:</strong> {report.reason}
                </div>
                <div className="reported-content">
                    <strong>Content:</strong>
                    {report.contentId.title ? (
                        <div className="content-preview">
                            <h5>{report.contentId.title}</h5>
                            <p>{report.contentId.body?.substring(0, 100)}...</p>
                        </div>
                    ) : (
                        <div className="content-preview">
                            <p>{report.contentId.body?.substring(0, 100)}...</p>
                        </div>
                    )}
                </div>
                <div className="report-date">
                    <strong>Reported on:</strong> {new Date(report.createdAt).toLocaleDateString()}
                </div>
            </div>

            {report.status === 'pending' && (
                <div className="report-actions">
                    <button
                        className="action-btn resolve"
                        onClick={() => handleReportAction(report._id, 'resolve')}
                    >
                        <CheckCircle size={16} />
                        Resolve
                    </button>

                    <button
                        className="action-btn dismiss"
                        onClick={() => handleReportAction(report._id, 'dismiss')}
                    >
                        <XCircle size={16} />
                        Dismiss
                    </button>

                    <button
                        className="action-btn delete"
                        onClick={() => handleDeleteContent(report.contentType, report.contentId._id)}
                    >
                        <Trash2 size={16} />
                        Delete Content
                    </button>
                </div>
            )}

            {report.status === 'resolved' && (
                <div className="report-resolved">
                    <CheckCircle size={16} />
                    <span>Resolved on {new Date(report.updatedAt).toLocaleDateString()}</span>
                </div>
            )}
        </div>
    )

    return (
        <div className="reports">
            <div className="reports-header">
                <h2>Content Reports</h2>
                <p>Review and manage user reports about inappropriate content.</p>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-group">
                    <label>Status:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Reports</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            </div>

            {/* Reports List */}
            {loading ? (
                <div className="loading">Loading reports...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <>
                    <div className="reports-grid">
                        {reports.map((report) => (
                            <ReportCard key={report._id} report={report} />
                        ))}
                    </div>

                    {reports.length === 0 && (
                        <div className="no-reports">
                            <Flag size={48} />
                            <h3>No reports found</h3>
                            <p>All content appears to be in good standing.</p>
                        </div>
                    )}

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
        </div>
    )
}

export default Reports
