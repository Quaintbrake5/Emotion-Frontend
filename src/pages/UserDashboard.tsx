import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mic, Upload, History, BarChart3, LogOut, User, TrendingUp, Activity, Clock, Award } from 'lucide-react';
import AudioUpload from '../components/AudioUpload';
import PredictionDisplay from '../components/PredictionDisplay';
import HistoryComponent from '../components/History';
import Statistics from '../components/Statistics';
import type { Prediction } from '../types';
import '../styles/dashboard.css';

type TabType = 'overview' | 'upload' | 'history' | 'statistics' | 'profile';

const UserDashboard: React.FC = () => {
  const { user, logout, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [currentPrediction, setCurrentPrediction] = useState<Prediction | null>(null);
  const [stats] = useState({
    totalPredictions: 0,
    totalUploads: 0,
    avgConfidence: 0,
    lastActivity: null as string | null
  });

  const handlePredictionComplete = (prediction: Prediction) => {
    setCurrentPrediction(prediction);
    setActiveTab('history');
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Activity },
    { id: 'upload' as TabType, label: 'Upload Audio', icon: Upload },
    { id: 'history' as TabType, label: 'History', icon: History },
    { id: 'statistics' as TabType, label: 'Analytics', icon: BarChart3 },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-page">
            {/* Hero Section - Clean and Centered */}
            <section className="hero-section-clean">
              <div className="hero-container">
                <div className="hero-text-center">
                  <h1 className="hero-title-clean">
                    Welcome back, <span className="hero-name-highlight">{user?.full_name || user?.username}</span>
                  </h1>
                  <p className="hero-description">
                    Your voice emotion analysis dashboard is ready. Discover powerful insights from your audio data.
                  </p>
                  <div className="hero-actions">
                    <button className="btn-hero-primary" onClick={() => setActiveTab('upload')}>
                      <Mic size={20} />
                      Start Analyzing
                    </button>
                    <button className="btn-hero-secondary" onClick={() => setActiveTab('statistics')}>
                      View Analytics
                    </button>
                  </div>
                </div>
                <div className="hero-visual">
                  <div className="hero-shape-1"></div>
                  <div className="hero-shape-2"></div>
                  <div className="hero-shape-3"></div>
                </div>
              </div>
            </section>

            {/* Stats Overview - Modern Grid */}
            <section className="stats-overview-section">
              <div className="section-header">
                <h2 className="section-title-modern">Your Statistics</h2>
                <p className="section-description">Track your emotion analysis progress</p>
              </div>
              <div className="stats-grid-clean">
                <div className="stat-card-clean">
                  <div className="stat-icon-container">
                    <TrendingUp className="stat-icon-clean" />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{stats.totalPredictions}</div>
                    <div className="stat-label">Total Predictions</div>
                    <div className="stat-trend positive">+12% this month</div>
                  </div>
                </div>

                <div className="stat-card-clean">
                  <div className="stat-icon-container">
                    <Upload className="stat-icon-clean" />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{stats.totalUploads}</div>
                    <div className="stat-label">Audio Files</div>
                    <div className="stat-trend positive">+8% this month</div>
                  </div>
                </div>

                <div className="stat-card-clean">
                  <div className="stat-icon-container">
                    <Award className="stat-icon-clean" />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">
                      {stats.avgConfidence > 0 ? `${Math.round(stats.avgConfidence * 100)}%` : 'N/A'}
                    </div>
                    <div className="stat-label">Avg Confidence</div>
                    <div className="stat-trend neutral">High accuracy</div>
                  </div>
                </div>

                <div className="stat-card-clean">
                  <div className="stat-icon-container">
                    <Clock className="stat-icon-clean" />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">
                      {stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString() : 'Never'}
                    </div>
                    <div className="stat-label">Last Activity</div>
                    <div className="stat-trend neutral">Recent session</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions - Clean Cards */}
            <section className="actions-section-clean">
              <div className="section-header">
                <h2 className="section-title-modern">Quick Actions</h2>
                <p className="section-description">Choose what you'd like to do next</p>
              </div>
              <div className="actions-grid-clean">
                <div className="action-card-clean primary" onClick={() => setActiveTab('upload')}>
                  <div className="action-icon-wrapper">
                    <Mic size={32} />
                  </div>
                  <div className="action-content">
                    <h3 className="action-title">Analyze New Audio</h3>
                    <p className="action-description">Upload or record voice to detect emotions</p>
                  </div>
                  <div className="action-arrow">→</div>
                </div>

                <div className="action-card-clean secondary" onClick={() => setActiveTab('history')}>
                  <div className="action-icon-wrapper">
                    <History size={32} />
                  </div>
                  <div className="action-content">
                    <h3 className="action-title">View History</h3>
                    <p className="action-description">Check your previous analyses</p>
                  </div>
                </div>

                <div className="action-card-clean secondary" onClick={() => setActiveTab('statistics')}>
                  <div className="action-icon-wrapper">
                    <BarChart3 size={32} />
                  </div>
                  <div className="action-content">
                    <h3 className="action-title">View Analytics</h3>
                    <p className="action-description">Explore detailed insights</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Activity - If Available */}
            {currentPrediction && (
              <section className="recent-activity-section">
                <div className="section-header">
                  <h2 className="section-title-modern">Latest Analysis</h2>
                  <span className="activity-status">Just completed</span>
                </div>
                <div className="activity-card-clean">
                  <PredictionDisplay prediction={currentPrediction} />
                </div>
              </section>
            )}
          </div>
        );

      case 'upload':
        return (
          <div className="dashboard-content">
            <div className="content-header">
              <h1>Analyze Voice Emotion</h1>
              <p>Upload an audio file or record your voice to detect emotions</p>
            </div>
            <div className="upload-section">
              <AudioUpload onPredictionComplete={handlePredictionComplete} />
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="dashboard-content">
            <div className="content-header">
              <h1>Prediction History</h1>
              <p>View all your previous emotion analyses</p>
            </div>
            <HistoryComponent />
          </div>
        );

      case 'statistics':
        return (
          <div className="dashboard-content">
            <div className="content-header">
              <h1>Your Analytics</h1>
              <p>Detailed insights into your emotion analysis patterns</p>
            </div>
            <Statistics />
          </div>
        );

      case 'profile':
        return (
          <div className="dashboard-content">
            <div className="content-header">
              <h1>Profile Settings</h1>
              <p>Manage your account information and preferences</p>
            </div>
            <div className="profile-card">
              <div className="profile-avatar">
                <User size={64} />
              </div>
              <div className="profile-details">
                <div className="detail-group">
                  <label>Username</label>
                  <span>{user?.username}</span>
                </div>
                <div className="detail-group">
                  <label>Email</label>
                  <span>{user?.email}</span>
                </div>
                <div className="detail-group">
                  <label>Full Name</label>
                  <span>{user?.full_name || 'Not set'}</span>
                </div>
                <div className="detail-group">
                  <label>Member Since</label>
                  <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
              <div className="profile-actions">
                <button className="btn btn-secondary" onClick={logout}>
                  <LogOut size={16} />
                  Log Out
                </button>
                <button className="btn btn-danger" onClick={signOut}>
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            <Mic className="logo-icon" />
            <span>Voice Emotion Recognition</span>
          </div>
          <div className="user-menu">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <span className="user-name">{user?.full_name || user?.username}</span>
            <button className="btn btn-ghost" onClick={logout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <div className="nav-container">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="dashboard-main">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default UserDashboard;
