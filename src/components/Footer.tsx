import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-logo">
            <Mic size={24} />
            <span>Voice Emotion Recognition</span>
          </div>
          <p>Advanced AI-powered emotion recognition from audio. Analyze emotions with high accuracy and detailed insights.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/register">Get Started</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <ul>
            <li><Mail size={16} /> support@voiceemotion.com</li>
            <li><Phone size={16} /> +1 (555) 123-4567</li>
            <li><MapPin size={16} /> 123 AI Street, Tech City</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href="#" aria-label="Facebook">FB</a>
            <a href="#" aria-label="Twitter">TW</a>
            <a href="#" aria-label="LinkedIn">LI</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 Voice Emotion Recognition. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
