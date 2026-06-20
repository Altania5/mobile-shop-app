import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/users/forgot-password', { email });
      setSubmitted(true);
    } catch {
      // Always show success — prevents email enumeration
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-page">

      {/* Left panel — branding */}
      <div className="lp-panel lp-panel--brand">
        <div className="lp-brand-inner">
          <span className="lp-eyebrow">
            <i className="fa-solid fa-wrench"></i>&nbsp; Hard Work Mobile
          </span>
          <h1 className="lp-brand-title">Password Reset</h1>
          <p className="lp-brand-sub">
            Enter the email address on your account and we'll send you a link to reset your password.
          </p>

          <ul className="lp-features">
            <li className="lp-feature">
              <span className="lp-feature-icon"><i className="fa-solid fa-envelope"></i></span>
              <span>Check your inbox for the reset link</span>
            </li>
            <li className="lp-feature">
              <span className="lp-feature-icon"><i className="fa-solid fa-clock"></i></span>
              <span>Link expires after 1 hour</span>
            </li>
            <li className="lp-feature">
              <span className="lp-feature-icon"><i className="fa-solid fa-lock"></i></span>
              <span>Set a new secure password</span>
            </li>
          </ul>

          <div className="lp-switch-prompt">
            <span>Remembered it?</span>
            <Link to="/login" className="lp-switch-link">Back to sign in &rarr;</Link>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="lp-panel lp-panel--form">
        <div className="lp-form-card">
          {submitted ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(72,187,120,0.12)', border: '1px solid #48bb78',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <i className="fa-solid fa-envelope-circle-check" style={{ fontSize: '1.8rem', color: '#276749' }}></i>
              </div>
              <h2 style={{ color: 'var(--primary-color)', marginBottom: 8 }}>Check your email</h2>
              <p style={{ color: 'var(--text-light-color)', lineHeight: 1.65, marginBottom: 28 }}>
                If an account with that address exists, we've sent a password reset link. It may take a minute to arrive.
              </p>
              <Link to="/login" style={{
                display: 'inline-block', background: 'var(--accent-color)', color: '#000',
                fontWeight: 700, padding: '12px 28px', borderRadius: 'var(--border-radius)',
                textDecoration: 'none', fontSize: '1rem',
              }}>
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2>Forgot Password</h2>
              <p className="lp-form-subtitle">We'll email you a secure reset link.</p>
              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                  required
                  autoComplete="email"
                  disabled={loading}
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
              {error && (
                <div className="lp-error" style={{ marginTop: 16 }}>
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
}

export default ForgotPasswordPage;
