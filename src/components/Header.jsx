import React from 'react';
import { Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <h1 className="page-title">Home</h1>

      <div className="header-actions">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search in Drive" />
        </div>

        <button className="upload-btn" onClick={() => navigate('/upload')}>
          Upload <Plus size={16} />
        </button>
      </div>

      <style>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 32px;
          background-color: var(--white);
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #1F2937;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 32px;
          flex: 1;
          justify-content: flex-end;
        }

        .search-bar {
          display: flex;
          align-items: center;
          background-color: #F3F4F6;
          padding: 10px 16px;
          border-radius: 12px;
          width: 400px;
          gap: 10px;
        }

        .search-icon {
          color: #9CA3AF;
        }

        .search-bar input {
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
          color: var(--text-primary);
          font-size: 14px;
        }

        .search-bar input::placeholder {
          color: #9CA3AF;
        }

        .upload-btn {
          background-color: #3B82F6; /* Bright blue */
          color: white;
          padding: 10px 24px;
          border-radius: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background-color 0.2s;
        }

        .upload-btn:hover {
          background-color: #2563EB;
        }
      `}</style>
    </header>
  );
};

export default Header;
