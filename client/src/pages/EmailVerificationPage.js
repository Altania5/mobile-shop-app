import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './EmailVerificationPage.css';

function EmailVerificationPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`/api/users/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.msg);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.msg || 'Email verification failed');
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [token]);

  const handleResendVerification = async (e) => {
    e.preventDefault();
    setIsResending(true);

    try {
      const response = await axios.post('/api/users/resend-verification', {
        email: resendEmail
      });
      setMessage(response.data.msg);
      setResendEmail('');
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="verification-page">
      <div className="verification-container">
        <div className="verification-card">
          {status === 'verifying' && (
            <div className="verification-content">
              <div className="loading-spinner"></div>
              <h2>Verifying Your Email</h2>
              <p>Please wait while we verify your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="verification-content success">
              <div className="success-icon">
                <div className="checkmark">
                  <div className="checkmark-circle"></div>
                  <div className="checkmark-stem"></div>
                  <div className="checkmark-kick"></div>
                </div>
              </div>
              <h2>Email Verified Successfully!</h2>
              <p className="success-message">{message}</p>
              <div className="action-buttons">
                <Link to="/login" className="primary-button">
                  Sign In Now
                </Link>
                <Link to="/services" className="secondary-button">
                  Explore Services
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="verification-content error">
              <div className="error-icon">⚠</div>
              <h2>Verification Failed</h2>
              <p className="error-message">{message}</p>
              
              <div className="resend-section">
                <h3>Need a new verification link?</h3>
                <form onSubmit={handleResendVerification} className="resend-form">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    required
                    disabled={isResending}
                  />
                  <button
                    type="submit"
                    disabled={isResending || !resendEmail}
                    className={`resend-button ${isResending ? 'loading' : ''}`}
                  >
                    {isResending ? (
                      <>
                        <div className="button-spinner"></div>
                        Sending...
                      </>
                    ) : (
                      'Resend Verification Email'
                    )}
                  </button>
                </form>
              </div>
              
              <div className="help-section">
                <p>Still having trouble?</p>
                <Link to="/contact" className="help-link">Contact Support</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmailVerificationPage;
