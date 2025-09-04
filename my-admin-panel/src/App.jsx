import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Users from './components/Users'
import Reports from './components/Reports'
import Questions from './components/Questions'
import Answers from './components/Answers'
import Comments from './components/Comments'
import Friends from './components/Friends'
import Bookmarks from './components/Bookmarks'
import AIFeatures from './components/AIFeatures'
import Uploads from './components/Uploads'
import System from './components/System'
import Security from './components/Security'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminToken, setAdminToken] = useState('')
  const [currentView, setCurrentView] = useState('dashboard')

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      setAdminToken(token)
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (token) => {
    setAdminToken(token)
    setIsAuthenticated(true)
    localStorage.setItem('adminToken', token)
  }

  const handleLogout = () => {
    setAdminToken('')
    setIsAuthenticated(false)
    localStorage.removeItem('adminToken')
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Router>
      <div className="admin-panel">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        <div className="main-content">
          <Header onLogout={handleLogout} />
          <main className="content">
            {currentView === 'dashboard' && <Dashboard token={adminToken} />}
            {currentView === 'users' && <Users token={adminToken} />}
            {currentView === 'questions' && <Questions token={adminToken} />}
            {currentView === 'answers' && <Answers token={adminToken} />}
            {currentView === 'comments' && <Comments token={adminToken} />}
            {currentView === 'reports' && <Reports token={adminToken} />}
            {currentView === 'friends' && <Friends token={adminToken} />}
            {currentView === 'bookmarks' && <Bookmarks token={adminToken} />}
            {currentView === 'ai-features' && <AIFeatures token={adminToken} />}
            {currentView === 'uploads' && <Uploads token={adminToken} />}
            {currentView === 'system' && <System token={adminToken} />}
            {currentView === 'security' && <Security token={adminToken} />}
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
