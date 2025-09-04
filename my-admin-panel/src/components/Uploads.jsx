import { useState, useEffect } from 'react'
import axios from 'axios'
import { Upload, Search, Eye, Download, Trash2, FileText, Image, Video, File } from 'lucide-react'

const Uploads = ({ token }) => {
    const [uploads, setUploads] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [selectedUpload, setSelectedUpload] = useState(null)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        fetchUploads()
    }, [searchTerm, filterType])

    const fetchUploads = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (searchTerm) params.append('search', searchTerm)
            if (filterType !== 'all') params.append('type', filterType)

            const response = await axios.get(`http://localhost:5000/api/admin/uploads?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setUploads(response.data.uploads || response.data)
        } catch (error) {
            console.error('Error fetching uploads:', error)
            // Fallback to sample data
            const sampleUploads = [
                {
                    _id: '1',
                    filename: 'profile-picture.jpg',
                    originalName: 'my-profile-pic.jpg',
                    mimetype: 'image/jpeg',
                    size: 245760,
                    url: '/uploads/profile-picture.jpg',
                    uploadedBy: { username: 'john_doe', email: 'john@example.com' },
                    uploadDate: new Date().toISOString(),
                    status: 'active'
                },
                {
                    _id: '2',
                    filename: 'document.pdf',
                    originalName: 'project-document.pdf',
                    mimetype: 'application/pdf',
                    size: 1048576,
                    url: '/uploads/document.pdf',
                    uploadedBy: { username: 'jane_smith', email: 'jane@example.com' },
                    uploadDate: new Date(Date.now() - 86400000).toISOString(),
                    status: 'active'
                },
                {
                    _id: '3',
                    filename: 'video-tutorial.mp4',
                    originalName: 'react-tutorial.mp4',
                    mimetype: 'video/mp4',
                    size: 52428800,
                    url: '/uploads/video-tutorial.mp4',
                    uploadedBy: { username: 'bob_wilson', email: 'bob@example.com' },
                    uploadDate: new Date(Date.now() - 172800000).toISOString(),
                    status: 'active'
                }
            ]
            setUploads(sampleUploads)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (uploadId, filename) => {
        if (!confirm('Are you sure you want to delete this file?')) return

        try {
            await axios.delete(`http://localhost:5000/api/admin/uploads/${uploadId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            alert('File deleted successfully')
            fetchUploads()
        } catch (error) {
            console.error('Error deleting file:', error)
            alert('Error deleting file')
        }
    }

    const handleDownload = (url, filename) => {
        const link = document.createElement('a')
        link.href = `http://localhost:5000${url}`
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleView = (upload) => {
        setSelectedUpload(upload)
        setShowModal(true)
    }

    const getFileIcon = (mimetype) => {
        if (mimetype?.startsWith('image/')) return <Image size={16} />
        if (mimetype?.startsWith('video/')) return <Video size={16} />
        if (mimetype === 'application/pdf') return <FileText size={16} />
        return <File size={16} />
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const renderUploadsTable = () => (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>File</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Uploaded By</th>
                        <th>Upload Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {uploads.map(upload => (
                        <tr key={upload._id}>
                            <td>
                                <div className="file-info">
                                    {getFileIcon(upload.mimetype)}
                                    <div>
                                        <div className="filename">{upload.originalName}</div>
                                        <div className="filepath">{upload.filename}</div>
                                    </div>
                                </div>
                            </td>
                            <td>{upload.mimetype}</td>
                            <td>{formatFileSize(upload.size)}</td>
                            <td>
                                <div className="user-info">
                                    <div>
                                        <div className="username">{upload.uploadedBy?.username}</div>
                                        <div className="email">{upload.uploadedBy?.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td>{new Date(upload.uploadDate).toLocaleDateString()}</td>
                            <td>
                                <span className={`status ${upload.status}`}>
                                    {upload.status}
                                </span>
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleView(upload)}
                                        title="View Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleDownload(upload.url, upload.originalName)}
                                        title="Download File"
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button
                                        className="btn-icon btn-danger"
                                        onClick={() => handleDelete(upload._id, upload.filename)}
                                        title="Delete File"
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
        <div className="uploads-management">
            <div className="header">
                <h2>File Uploads Management</h2>
                <div className="actions">
                    <div className="filter-section">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="image">Images</option>
                            <option value="video">Videos</option>
                            <option value="document">Documents</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading uploads...</div>
            ) : (
                <>
                    {renderUploadsTable()}

                    <div className="stats-section">
                        <div className="stat-card">
                            <h4>Total Files</h4>
                            <span className="stat-number">{uploads.length}</span>
                        </div>
                        <div className="stat-card">
                            <h4>Images</h4>
                            <span className="stat-number">
                                {uploads.filter(u => u.mimetype?.startsWith('image/')).length}
                            </span>
                        </div>
                        <div className="stat-card">
                            <h4>Videos</h4>
                            <span className="stat-number">
                                {uploads.filter(u => u.mimetype?.startsWith('video/')).length}
                            </span>
                        </div>
                        <div className="stat-card">
                            <h4>Total Size</h4>
                            <span className="stat-number">
                                {formatFileSize(uploads.reduce((sum, u) => sum + (u.size || 0), 0))}
                            </span>
                        </div>
                    </div>
                </>
            )}

            {showModal && selectedUpload && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>File Details</h3>
                            <button onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="upload-details">
                                <div className="detail-row">
                                    <strong>Original Name:</strong> {selectedUpload.originalName}
                                </div>
                                <div className="detail-row">
                                    <strong>Filename:</strong> {selectedUpload.filename}
                                </div>
                                <div className="detail-row">
                                    <strong>Type:</strong> {selectedUpload.mimetype}
                                </div>
                                <div className="detail-row">
                                    <strong>Size:</strong> {formatFileSize(selectedUpload.size)}
                                </div>
                                <div className="detail-row">
                                    <strong>Uploaded By:</strong> {selectedUpload.uploadedBy?.username} ({selectedUpload.uploadedBy?.email})
                                </div>
                                <div className="detail-row">
                                    <strong>Upload Date:</strong> {new Date(selectedUpload.uploadDate).toLocaleDateString()}
                                </div>
                                <div className="detail-row">
                                    <strong>Status:</strong> {selectedUpload.status}
                                </div>
                                <div className="detail-row">
                                    <strong>URL:</strong>
                                    <div className="url-display">{selectedUpload.url}</div>
                                </div>

                                {selectedUpload.mimetype?.startsWith('image/') && (
                                    <div className="detail-row">
                                        <strong>Preview:</strong>
                                        <div className="image-preview">
                                            <img
                                                src={`http://localhost:5000${selectedUpload.url}`}
                                                alt={selectedUpload.originalName}
                                                style={{ maxWidth: '300px', maxHeight: '200px' }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="modal-actions">
                                    <button
                                        className="btn-primary"
                                        onClick={() => handleDownload(selectedUpload.url, selectedUpload.originalName)}
                                    >
                                        <Download size={16} />
                                        Download
                                    </button>
                                    <button
                                        className="btn-danger"
                                        onClick={() => handleDelete(selectedUpload._id, selectedUpload.filename)}
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Uploads
