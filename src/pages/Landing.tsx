import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, BarChart3, Shield, Zap, ArrowRight, Users, TrendingUp } from 'lucide-react';
import Footer from '../components/Footer';

const Landing: React.FC = () => {
  return (
    <div className="landing">
      <header className="landing-header">
        <nav className="landing-nav">
          <div className="nav-logo">
            <Mic className="logo-icon" />
            <span>Voice Emotion Recognition</span>
          </div>
          <div className="nav-links">
            <Link to="/login" className="nav-link">Sign In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Understand Emotions Through Voice Analysis
          </h1>
          <p className="hero-subtitle">
            Advanced AI-powered emotion recognition from audio. Upload files or record directly
            to analyze emotions with high accuracy and detailed insights.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-large">
              Start Analyzing
              <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-large">
              Sign In
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-placeholder">
            <Mic size={64} />
            <div className="waveform">
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Powerful Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Mic />
              </div>
              <h3>Voice Recording</h3>
              <p>Record audio directly in your browser with high-quality capture and real-time analysis.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <BarChart3 />
              </div>
              <h3>Detailed Analytics</h3>
              <p>Get comprehensive insights with emotion distribution charts and confidence scores.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Shield />
              </div>
              <h3>Secure & Private</h3>
              <p>Your audio data is processed securely with end-to-end encryption and privacy protection.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Zap />
              </div>
              <h3>Fast Processing</h3>
              <p>Advanced AI models provide instant emotion analysis with high accuracy and speed.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Users />
              </div>
              <h3>User Management</h3>
              <p>Complete user authentication system with profile management and activity tracking.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <TrendingUp />
              </div>
              <h3>Progress Tracking</h3>
              <p>Monitor your emotion analysis patterns over time with detailed statistics and trends.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to Discover Voice Emotions?</h2>
          <p>Join thousands of users who trust our AI for accurate emotion analysis.</p>
          <Link to="/register" className="btn btn-primary btn-large">
            Create Free Account
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
