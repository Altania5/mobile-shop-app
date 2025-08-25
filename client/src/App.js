import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // You may need to install this: npm install jwt-decode
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

// A simple component for when the user is logged in
function Dashboard({ user, onLogout }) {
  return (
    <div>
      <nav>
        <span>Welcome, {user.firstName}!</span>
        <button onClick={onLogout}>Logout</button>
      </nav>
      <main>
        <h1>Your Dashboard</h1>
        <p>This is where your booking info and service history will go.</p>
      </main>
    </div>
  );
}

// A component for the login/register page
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

function App() {
  const [user, setUser] = useState(null);

  // Check for an existing token in localStorage when the app loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        // Optional: Check if token is expired
        const isExpired = decodedUser.exp * 1000 < Date.now();
        if (isExpired) {
          handleLogout();
        } else {
          setUser({ ...decodedUser, token });
        }
      } catch (error) {
        // If token is invalid, remove it
        handleLogout();
      }
    }
  }, []);

  const handleLoginSuccess = (token) => {
    localStorage.setItem('token', token);
    const decodedUser = jwtDecode(token);
    setUser({ ...decodedUser, token });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <div className="App">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;