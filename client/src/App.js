import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import LoginPage from './pages/LoginPage';
import AppLayout from './layout/AppLayout';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check for an existing token in localStorage when the app loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        const isExpired = decodedUser.exp * 1000 < Date.now();
        if (isExpired) {
          handleLogout();
        } else {
          setUser({ ...decodedUser, token });
        }
      } catch (error) {
        handleLogout();
      }
    }
  }, []);
  
  const handleLoginSuccess = (token) => {
    localStorage.setItem('token', token);
    const decodedUser = jwtDecode(token);
    setUser({ ...decodedUser, token });
    navigate('/'); // Redirect to main page on login
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  // This effect redirects to login if user is logged out
  useEffect(() => {
    if (!user) {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }
  }, [user, navigate]);

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        {/* The "/*" is a wildcard that matches all routes for a logged-in user */}
        {user && <Route path="/*" element={<AppLayout user={user} onLogout={handleLogout} />} />}
      </Routes>
    </div>
  );
}

export default App;