import React from 'react';
import { Users, HardDrive, Activity, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { logout, user } = useAuth();

    // Dummy Data
    const stats = [
        { title: 'Total Users', value: '1,234', icon: Users, color: '#4F46E5', bg: '#EEF2FF' },
        { title: 'Storage Used', value: '450 GB', icon: HardDrive, color: '#059669', bg: '#D1FAE5' },
        { title: 'Active Sessions', value: '56', icon: Activity, color: '#D97706', bg: '#FEF3C7' },
    ];

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="header-content">
                    <h1>Admin Dashboard</h1>
                    <div className="user-info">
                        <span>{user?.email} (Admin)</span>
                        <button onClick={logout} className="logout-btn">
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="dashboard-content">
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="stat-icon" style={{ backgroundColor: stat.bg }}>
                                <stat.icon size={24} color={stat.color} />
                            </div>
                            <div className="stat-info">
                                <p className="stat-title">{stat.title}</p>
                                <p className="stat-value">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="recent-activity-section">
                    <h2>Recent System Activity</h2>
                    <div className="activity-list">
                        <div className="activity-item">
                            <span className="time">10:42 AM</span>
                            <span className="message">New user registration: john.doe@example.com</span>
                        </div>
                        <div className="activity-item">
                            <span className="time">10:30 AM</span>
                            <span className="message">Storage warning: Server 3 at 85% capacity</span>
                        </div>
                        <div className="activity-item">
                            <span className="time">09:15 AM</span>
                            <span className="message">System backup completed successfully</span>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                .admin-dashboard {
                    min-height: 100vh;
                    background-color: #F9FAFB;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }

                .admin-header {
                    background-color: white;
                    border-bottom: 1px solid #E5E7EB;
                    padding: 16px 32px;
                }

                .header-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-content h1 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #111827;
                    margin: 0;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    color: #4B5563;
                    font-weight: 500;
                }

                .logout-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: 1px solid #E5E7EB;
                    background-color: white;
                    color: #EF4444;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .logout-btn:hover {
                    background-color: #FEF2F2;
                    border-color: #FECACA;
                }

                .dashboard-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 32px;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 24px;
                    margin-bottom: 40px;
                }

                .stat-card {
                    background-color: white;
                    padding: 24px;
                    border-radius: 16px;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .stat-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .stat-info {
                    display: flex;
                    flex-direction: column;
                }

                .stat-title {
                    font-size: 14px;
                    color: #6B7280;
                    margin: 0 0 4px 0;
                }

                .stat-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #111827;
                    margin: 0;
                }

                .recent-activity-section {
                    background-color: white;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                }

                .recent-activity-section h2 {
                    font-size: 18px;
                    font-weight: 600;
                    color: #111827;
                    margin: 0 0 20px 0;
                }

                .activity-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .activity-item {
                    display: flex;
                    gap: 16px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #F3F4F6;
                }

                .activity-item:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .time {
                    font-size: 14px;
                    color: #9CA3AF;
                    min-width: 80px;
                }

                .message {
                    font-size: 14px;
                    color: #374151;
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
