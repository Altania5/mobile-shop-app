import React from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

function LoginPage({ onLoginSuccess }) {
  return (
    <div className="login-page">
      <div className="form-container">
        <Login onLoginSuccess={onLoginSuccess} />
      </div>
      <div className="form-container">
        <Register />
      </div>
    </div>
  );
}

export default LoginPage;