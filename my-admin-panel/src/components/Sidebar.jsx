import { BarChart3, Users, Flag, Settings, LogOut, HelpCircle, FileText, MessageSquare, Upload, Shield, UserPlus, Bookmark } from 'lucide-react'
import './Sidebar.css'

const Sidebar = ({ currentView, setCurrentView }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'questions', label: 'Questions', icon: HelpCircle },
        { id: 'answers', label: 'Answers', icon: MessageSquare },
        { id: 'comments', label: 'Comments', icon: FileText },
        { id: 'reports', label: 'Reports', icon: Flag },
        { id: 'friends', label: 'Friends', icon: UserPlus },
        { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
        { id: 'ai-features', label: 'AI Features', icon: Settings },
        { id: 'uploads', label: 'Uploads', icon: Upload },
        { id: 'system', label: 'System', icon: BarChart3 },
        { id: 'security', label: 'Security', icon: Shield },
    ]

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>Admin Panel</h2>
                <p>DevOverflow</p>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                            onClick={() => setCurrentView(item.id)}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    )
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="avatar">A</div>
                    <div className="user-details">
                        <p className="name">Admin</p>
                        <p className="role">Administrator</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sidebar
