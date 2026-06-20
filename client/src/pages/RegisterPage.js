import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './RegisterPage.css';

const REGISTER_FEATURES = [
  { icon: 'fa-solid fa-calendar-check',  label: 'Track your booking requests' },
  { icon: 'fa-solid fa-truck-fast',       label: 'We come to your location' },
  { icon: 'fa-solid fa-clipboard-list',   label: 'View your service history' },
];

function RegisterPage({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (!formData.lastName.trim())  e.lastName  = 'Last name is required';
    if (!formData.email.trim()) {
      e.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      e.email = 'Please enter a valid email address';
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      const { confirmPassword, ...submitData } = formData;
      const res = await axios.post('/api/users/register', submitData);
      // Server sets the httpOnly cookie; we receive the user object
      onLoginSuccess(res.data.user);
    } catch (err) {
      setErrors({ general: err.response?.data?.msg || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rp-page">

      {/* Left panel — branding */}
      <div className="rp-panel rp-panel--brand">
        <div className="rp-brand-inner">
          <span className="rp-eyebrow">
            <i className="fa-solid fa-wrench"></i>&nbsp; Hard Work Mobile
          </span>
          <h1 className="rp-brand-title">Create Your Account</h1>
          <p className="rp-brand-sub">
            Join Hard Work Mobile and track your service requests all in one place.
          </p>

          <ul className="rp-features">
            {REGISTER_FEATURES.map(f => (
              <li key={f.label} className="rp-feature">
                <span className="rp-feature-icon"><i className={f.icon}></i></span>
                <span>{f.label}</span>
              </li>
            ))}
          </ul>

          <div className="rp-switch-prompt">
            <span>Already have an account?</span>
            <Link to="/login" className="rp-switch-link">Sign in &rarr;</Link>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="rp-panel rp-panel--form">
        <div className="rp-form-card">
          <div className="rp-form-header">
            <h2>Get Started</h2>
            <p>Fill in your details to create your free account.</p>
          </div>

          {errors.general && (
            <div className="rp-alert rp-alert--error">
              <i className="fa-solid fa-triangle-exclamation"></i>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="rp-form">
            <div className="rp-input-row">
              <div className="rp-input-group">
                <label htmlFor="rp-firstName">First Name</label>
                <input
                  id="rp-firstName" type="text" name="firstName"
                  placeholder="First name" value={formData.firstName}
                  onChange={handleChange} disabled={isLoading}
                  className={errors.firstName ? 'rp-input--error' : ''}
                />
                {errors.firstName && <span className="rp-field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.firstName}</span>}
              </div>

              <div className="rp-input-group">
                <label htmlFor="rp-lastName">Last Name</label>
                <input
                  id="rp-lastName" type="text" name="lastName"
                  placeholder="Last name" value={formData.lastName}
                  onChange={handleChange} disabled={isLoading}
                  className={errors.lastName ? 'rp-input--error' : ''}
                />
                {errors.lastName && <span className="rp-field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.lastName}</span>}
              </div>
            </div>

            <div className="rp-input-group">
              <label htmlFor="rp-email">Email Address</label>
              <input
                id="rp-email" type="email" name="email"
                placeholder="you@example.com" value={formData.email}
                onChange={handleChange} disabled={isLoading}
                className={errors.email ? 'rp-input--error' : ''}
              />
              {errors.email && <span className="rp-field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.email}</span>}
            </div>

            <div className="rp-input-group">
              <label htmlFor="rp-password">Password</label>
              <input
                id="rp-password" type="password" name="password"
                placeholder="Min. 8 characters" value={formData.password}
                onChange={handleChange} disabled={isLoading}
                className={errors.password ? 'rp-input--error' : ''}
              />
              {errors.password && <span className="rp-field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.password}</span>}
            </div>

            <div className="rp-input-group">
              <label htmlFor="rp-confirmPassword">Confirm Password</label>
              <input
                id="rp-confirmPassword" type="password" name="confirmPassword"
                placeholder="Re-enter password" value={formData.confirmPassword}
                onChange={handleChange} disabled={isLoading}
                className={errors.confirmPassword ? 'rp-input--error' : ''}
              />
              {errors.confirmPassword && <span className="rp-field-error"><i className="fa-solid fa-circle-exclamation"></i> {errors.confirmPassword}</span>}
            </div>

            <button type="submit" className={`rp-submit${isLoading ? ' rp-submit--loading' : ''}`} disabled={isLoading}>
              {isLoading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Creating Account…</>
              ) : (
                <><i className="fa-solid fa-user-plus"></i> Create Account</>
              )}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}

export default RegisterPage;
