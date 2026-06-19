// client/src/pages/LoginPage.js

import React from 'react';
import Login from '../components/Login';
import { Link } from 'react-router-dom';
import './LoginPage.css';

const LOGIN_FEATURES = [
  { icon: 'fa-solid fa-calendar-check', label: 'Book & manage services' },
  { icon: 'fa-solid fa-clipboard-list',  label: 'View your service history' },
  { icon: 'fa-solid fa-comment-dots',    label: 'Communicate with your tech' },
];

function LoginPage({ onLoginSuccess }) {
  return (
    <div className="lp-page">

      {/* Left panel — branding */}
      <div className="lp-panel lp-panel--brand">
        <div className="lp-brand-inner">
          <span className="lp-eyebrow">
            <i className="fa-solid fa-wrench"></i>&nbsp; Hard Work Mobile
          </span>
          <h1 className="lp-brand-title">Welcome Back</h1>
          <p className="lp-brand-sub">
            Sign in to access your account, view bookings, and manage your service history.
          </p>

          <ul className="lp-features">
            {LOGIN_FEATURES.map(f => (
              <li key={f.label} className="lp-feature">
                <span className="lp-feature-icon">
                  <i className={f.icon}></i>
                </span>
                <span>{f.label}</span>
              </li>
            ))}
          </ul>

          <div className="lp-switch-prompt">
            <span>No account yet?</span>
            <Link to="/register" className="lp-switch-link">Create one &rarr;</Link>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="lp-panel lp-panel--form">
        <div className="lp-form-card">
          <Login onLoginSuccess={onLoginSuccess} />
        </div>
      </div>

    </div>
  );
}

export default LoginPage;
