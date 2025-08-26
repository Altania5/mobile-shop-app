import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AppLayout from './layout/AppLayout';
import LoginPage from './pages/LoginPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Effect to check for an existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        const isExpired = decodedUser.exp * 1000 < Date.now();
        if (isExpired) {
          handleLogout();
        } else {
          setUser({ ...decodedUser, token, role: decodedUser.role });
        }
      } catch (error) {
        handleLogout();
      }
    }
  }, []);

  const handleLoginSuccess = (token, from) => {
    localStorage.setItem('token', token);
    const decodedUser = jwtDecode(token);
    setUser({ ...decodedUser, token, role: decodedUser.role });
    const destination = from?.pathname || '/';
    navigate(destination, { replace: true }); 
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/'); // Redirect to main page after logout
  };

  return (
    <div className="App">
      {/* The AppLayout is now always visible, but its content will change */}
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        {/* The "/*" wildcard passes control to AppLayout for all other routes */}
        <Route path="/*" element={<AppLayout user={user} onLogout={handleLogout} />} />
      </Routes>
    </div>
  );
}

export default App;