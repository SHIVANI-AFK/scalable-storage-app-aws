import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RecentFiles from './components/RecentFiles';
import SharedFiles from './components/SharedFiles';
import UploadPage from './pages/UploadPage';
import AllFilesPage from './pages/AllFilesPage';
import LandingPage from './pages/LandingPage';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;

  return children;
};

const DashboardLayout = ({ children }) => (
  <div className="app-container">
    <Sidebar />
    <main className="main-content">
      <Header />
      <div className="content-scrollable">
        {children}
      </div>
    </main>
    <style>{`
      .app-container {
        display: flex;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
      }

      .main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        background-color: var(--white);
        height: 100%;
        overflow: hidden;
      }

      .content-scrollable {
        flex: 1;
        overflow-y: auto;
        padding: 0 32px 32px 32px;
      }
    `}</style>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <RecentFiles />
              <SharedFiles />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/upload" element={
          <ProtectedRoute>
            <DashboardLayout>
              <UploadPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          </ProtectedRoute>
        } />

        <Route path="/files" element={
          <ProtectedRoute>
            <DashboardLayout>
              <AllFilesPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
