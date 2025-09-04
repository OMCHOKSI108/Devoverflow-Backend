import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './components/Login.css'
import './components/Sidebar.css'
import './components/Header.css'
import './components/Dashboard.css'
import './components/Users.css'
import './components/Reports.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
