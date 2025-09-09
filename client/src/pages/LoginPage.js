import React from 'react';
import Login from '../components/Login';
import { Link } from 'react-router-dom';
import './LoginPage.css';

function LoginPage({ onLoginSuccess }) {
  return (
    <div className="modern-login-page">
      {/* Animated Background */}
      <div className="login-background">
        <div className="login-shapes">
          <div className="login-shape login-shape-1"></div>
          <div className="login-shape login-shape-2"></div>
          <div className="login-shape login-shape-3"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <h1>Welcome Back</h1>
            <p>Sign in to access your mobile repair dashboard</p>
            
            <div className="login-features">
              <div className="login-feature">
                <div className="login-feature-icon">🔧</div>
                <span>Manage Repairs</span>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">📊</div>
                <span>View Analytics</span>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">💼</div>
                <span>Business Tools</span>
              </div>
            </div>

            <div className="register-prompt">
              <p>Don't have an account?</p>
              <Link to="/register" className="register-link">Create Account</Link>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-section">
          <div className="login-form-wrapper">
            <Login onLoginSuccess={onLoginSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
