import React from 'react';
import { Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const LandingPage = () => {
  const { login, user } = useAuth();

  // If user is already logged in, redirect to dashboard or admin
  if (user) {
    const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="logo-container">
          <div className="logo-icon">
            <Play fill="white" size={20} />
          </div>
          <span className="logo-text">SkyStore.ca</span>
        </div>
        <button className="nav-login-btn" onClick={login}>Login</button>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to <span className="highlight">SkyStore.ca</span></h1>
          <p className="hero-subtitle">
            Secure, fast, and reliable cloud storage for all your needs.
            Access your files from anywhere, anytime.
          </p>
          <div className="cta-group">
            <button className="primary-btn" onClick={login}>
              Login or Sign Up
            </button>
            <button className="secondary-btn">Learn More</button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card card-1">
            <div className="card-icon blue"></div>
            <div className="card-lines">
              <div className="line long"></div>
              <div className="line short"></div>
            </div>
          </div>
          <div className="visual-card card-2">
            <div className="card-icon purple"></div>
            <div className="card-lines">
              <div className="line long"></div>
              <div className="line short"></div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .landing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
          display: flex;
          flex-direction: column;
        }

        .landing-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 48px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background-color: var(--primary-color);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);
        }

        .logo-text {
          font-weight: 800;
          font-size: 24px;
          color: #111827;
          letter-spacing: -0.5px;
        }

        .nav-login-btn {
          font-weight: 600;
          color: #4B5563;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .nav-login-btn:hover {
          background-color: rgba(0,0,0,0.05);
          color: #111827;
        }

        .hero-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          padding: 0 48px;
          gap: 64px;
        }

        .hero-content {
          flex: 1;
          max-width: 600px;
        }

        .hero-title {
          font-size: 64px;
          font-weight: 800;
          line-height: 1.1;
          color: #111827;
          margin-bottom: 24px;
          letter-spacing: -1px;
        }

        .highlight {
          color: var(--primary-color);
          background: linear-gradient(120deg, rgba(79, 70, 229, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%);
          background-repeat: no-repeat;
          background-size: 100% 40%;
          background-position: 0 88%;
        }

        .hero-subtitle {
          font-size: 20px;
          color: #4B5563;
          line-height: 1.6;
          margin-bottom: 40px;
        }

        .cta-group {
          display: flex;
          gap: 16px;
        }

        .primary-btn {
          background-color: var(--primary-color);
          color: white;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 18px;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.4);
          background-color: var(--primary-hover);
        }

        .secondary-btn {
          background-color: white;
          color: #4B5563;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 18px;
          border: 1px solid #E5E7EB;
          transition: all 0.2s;
        }

        .secondary-btn:hover {
          border-color: #D1D5DB;
          color: #111827;
        }

        .hero-visual {
          flex: 1;
          height: 500px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .visual-card {
          background: white;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          position: absolute;
          width: 280px;
          height: 360px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .card-1 {
          transform: rotate(-6deg) translateX(-40px);
          z-index: 1;
        }

        .card-2 {
          transform: rotate(6deg) translateX(40px) translateY(20px);
          z-index: 2;
        }

        .card-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
        }

        .card-icon.blue {
          background-color: #E0E7FF;
        }

        .card-icon.purple {
          background-color: #F3E8FF;
        }

        .card-lines {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .line {
          height: 12px;
          border-radius: 6px;
          background-color: #F3F4F6;
        }

        .line.long {
          width: 100%;
        }

        .line.short {
          width: 60%;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
