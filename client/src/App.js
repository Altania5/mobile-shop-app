import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AppLayout from './layout/AppLayout';
import LoginPage from './pages/LoginPage';
import ServicesPage from './pages/ServicesPage';
import setAuthToken from './utils/setAuthToken';
import './App.css';

function App() {

  const token = localStorage.getItem('token');
if (token) {
    setAuthToken(token);
}

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
      <AppLayout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/*" element={<AppLayout user={user} onLogout={handleLogout} />} />
      </Routes>
      </AppLayout>
    </div>
  );
}

export default App;