import React, { useState, useEffect } from 'react';
import { Users, BarChart3, Settings, Activity, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import type { AdminUser } from '../types';
import '../styles/adminDashboard.css';

type AdminTabType = 'overview' | 'users' | 'analytics' | 'settings';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTabType>('overview');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSignOut = () => {
    logout();
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load users
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview' as AdminTabType, label: 'Overview', icon: BarChart3 },
    { id: 'users' as AdminTabType, label: 'Users', icon: Users },
    { id: 'analytics' as AdminTabType, label: 'Analytics', icon: Activity },
    { id: 'settings' as AdminTabType, label: 'Settings', icon: Settings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'analytics':
        return renderAnalytics();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="overview-content">
      <h2>System Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-value">0</div>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <div className="stat-value">0</div>
        </div>
        <div className="stat-card">
          <h3>Total Predictions</h3>
          <div className="stat-value">0</div>
        </div>
        <div className="stat-card">
          <h3>System Uptime</h3>
          <div className="stat-value">N/A</div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="users-content">
      <h2>User Management</h2>
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`status ${user.is_active ? 'active' : 'inactive'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{user.is_superuser ? 'Admin' : 'User'}</td>
                <td>
                  <button className="btn btn-sm btn-secondary">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="analytics-content">
      <h2>System Analytics</h2>
      <p>Analytics dashboard coming soon...</p>
    </div>
  );

  const renderSettings = () => (
    <div className="settings-content">
      <h2>System Settings</h2>
      <p>Settings panel coming soon...</p>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-dashboard loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.username}</p>
      </div>

      <div className="dashboard-content">
        <div className="sidebar">
          <nav className="tab-navigation">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <button className="logout-btn logout" onClick={logout}>
              <LogOut size={16} />
              Logout
            </button>
            <button className="logout-btn sign-out" onClick={handleSignOut}>
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        <div className="main-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
