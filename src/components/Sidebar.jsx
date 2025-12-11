import React from 'react';
import {
  Home,
  LayoutDashboard,
  FolderOpen,
  Share2,
  Star,
  Trash2,
  Settings,
  LogOut,
  Play,
  ChevronDown
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;

  return (
    <div className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">
          <Play fill="white" size={16} />
        </div>
        <span className="logo-text">Playbutton</span>
      </div>

      <nav className="nav-menu">
        <div
          className={`nav-item ${currentPath === '/dashboard' ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          <Home size={20} />
          <span>Home</span>
        </div>
        <div className="nav-item">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </div>
        <div
          className={`nav-item ${currentPath === '/files' ? 'active' : ''}`}
          onClick={() => navigate('/files')}
        >
          <FolderOpen size={20} />
          <span>All Files</span>
          <ChevronDown size={16} className="chevron" />
        </div>
        <div className="nav-item">
          <Share2 size={20} />
          <span>Shared with me</span>
        </div>
        <div className="nav-item">
          <Star size={20} />
          <span>Starred</span>
        </div>
        <div className="nav-item">
          <Trash2 size={20} />
          <span>Trash</span>
        </div>
      </nav>

      <div className="bottom-menu">
        <div className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </div>
        <div className="nav-item" onClick={logout}>
          <LogOut size={20} />
          <span>Logout</span>
        </div>

        {user && (
          <div className="user-profile">
            <img
              src={user.picture || "https://i.pravatar.cc/150?u=michael"}
              alt="User"
              className="user-avatar"
            />
            <div className="user-info">
              <p className="user-email" title={user.email}>{user.email}</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .sidebar {
          width: 250px;
          height: 100%;
          background-color: #F3F4F6;
          display: flex;
          flex-direction: column;
          padding: 24px;
          border-right: 1px solid var(--border-color);
        }

        /* ... existing styles ... */
        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background-color: var(--primary-color);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .logo-text {
          font-weight: 700;
          font-size: 18px;
          color: var(--text-primary);
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .nav-item:hover {
          background-color: rgba(0, 0, 0, 0.05);
          color: var(--text-primary);
        }

        .nav-item.active {
          background-color: #E0E7FF; /* Light indigo */
          color: var(--primary-color);
        }

        .chevron {
          margin-left: auto;
        }

        .bottom-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: auto;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--border-color);
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          justify-content: center;
        }

        .user-email {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
