import { LogOut, Bell, Search } from 'lucide-react'
import './Header.css'

const Header = ({ onLogout }) => {
    return (
        <header className="header">
            <div className="header-left">
                <h1>Dashboard</h1>
            </div>

            <div className="header-right">
                <div className="header-actions">
                    <button className="icon-button">
                        <Search size={20} />
                    </button>
                    <button className="icon-button">
                        <Bell size={20} />
                    </button>
                    <button className="icon-button logout" onClick={onLogout}>
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
