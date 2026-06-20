import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

function ResetPasswordPage({ onLoginSuccess }) {
  const { token } = useParams();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const e = {};
    if (!formData.password) {
      e.password = 'Password is required';
    } else if (formData.password.length < 8) {
      e.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }
    setLoading(true);
    setErrors({});
    try {
      const res = await axios.post(`/api/users/reset-password/${token}`, {
        password: formData.password,
      });
      // Server sets httpOnly cookie and returns user
      onLoginSuccess(res.data.user);
    } catch (err) {
      const msg = err.response?.data?.msg || 'Reset failed. Your link may have expired.';
      setErrors({ general: msg });
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
          <h1 className="lp-brand-title">Set New Password</h1>
          <p className="lp-brand-sub">
            Choose a strong password for your account. You'll be signed in automatically when you're done.
          </p>

          <ul className="lp-features">
            <li className="lp-feature">
              <span className="lp-feature-icon"><i className="fa-solid fa-shield-halved"></i></span>
              <span>Minimum 8 characters</span>
            </li>
            <li className="lp-feature">
              <span className="lp-feature-icon"><i className="fa-solid fa-lock"></i></span>
              <span>Stored securely with bcrypt</span>
            </li>
            <li className="lp-feature">
              <span className="lp-feature-icon"><i className="fa-solid fa-arrow-right-to-bracket"></i></span>
              <span>Signed in automatically on reset</span>
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
          <h2>New Password</h2>
          <p className="lp-form-subtitle">Enter and confirm your new password below.</p>

          {errors.general && (
            <div className="lp-error" style={{ marginBottom: 18 }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
              {errors.general}
              {errors.general.toLowerCase().includes('expired') && (
                <span> <Link to="/forgot-password" style={{ color: '#c53030', textDecoration: 'underline' }}>Request a new one.</Link></span>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div>
              <input
                type="password"
                name="password"
                placeholder="New password (min. 8 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                disabled={loading}
                style={errors.password ? { borderColor: '#f56565' } : {}}
              />
              {errors.password && (
                <p style={{ color: '#c53030', fontSize: '0.83rem', margin: '4px 0 0', fontWeight: 500 }}>
                  <i className="fa-solid fa-circle-exclamation"></i> {errors.password}
                </p>
              )}
            </div>
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                disabled={loading}
                style={errors.confirmPassword ? { borderColor: '#f56565' } : {}}
              />
              {errors.confirmPassword && (
                <p style={{ color: '#c53030', fontSize: '0.83rem', margin: '4px 0 0', fontWeight: 500 }}>
                  <i className="fa-solid fa-circle-exclamation"></i> {errors.confirmPassword}
                </p>
              )}
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Resetting…' : 'Reset Password & Sign In'}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}

export default ResetPasswordPage;
