import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import setAuthToken from './utils/setAuthToken';
import axios from 'axios';

// Layout and Authentication
import AppLayout from './layout/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ProtectedRoute from './components/ProtectedRoute';

// Page Imports
import ServicesPage from './pages/ServicesPage';
import TestimonialsPage from './pages/TestimonialsPage';
import BlogPage from './pages/BlogPage';
import PostPage from './pages/PostPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import WorkOrderPortal from './pages/WorkOrderPortal';
import BookingPage from './pages/BookingPage';
import BookingFormPage from './pages/BookingFormPage';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogout = React.useCallback(() => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
    navigate('/');
  }, [navigate]);

    const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get('/api/users/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user', err);
      handleLogout();
    }
  }, [handleLogout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      try {
        const decodedUser = jwtDecode(token);
        const isExpired = decodedUser.exp * 1000 < Date.now();
        if (isExpired) {
          handleLogout();
        } else {
          // Fetch full user data instead of relying only on the token
          fetchUser();
        }
      } catch (error) {
        handleLogout();
      }
    }
  }, [handleLogout, fetchUser]);

  const handleLoginSuccess = (token) => {
    localStorage.setItem('token', token);
    setAuthToken(token);
    const decodedUser = jwtDecode(token);
    setUser({ ...decodedUser, token, role: decodedUser.role });
    navigate('/services');
  };

  // const handleLoginSuccess = (token, from) => {
  //   localStorage.setItem('token', token);
  //   setAuthToken(token);

  //   try {
  //       const decodedUser = jwtDecode(token);
  //       setUser(decodedUser.user);
  //   } catch (error) {
  //       console.error("Failed to decode token on login", error);
  //       handleLogout();
  //       return;
  //   }
    
  //   // This call will now work because fetchUser is defined above
  //   fetchUser();
    
  //   const destination = from?.pathname || '/';
  //   navigate(destination, { replace: true });
  // };

  return (
    <div className="App">
      <Routes>
        {/* All routes are now nested within the AppLayout */}
        <Route element={<AppLayout user={user} onLogout={handleLogout} />}>
          
          {/* Public Routes */}
          <Route path="/" element={<ServicesPage />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/testimonials" element={<TestimonialsPage user={user} />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<PostPage user={user} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/work-order-portal" element={<WorkOrderPortal />} />
          <Route path="/book/:serviceId" element={<BookingPage user={user} />} />
          <Route path="/book/:serviceId/details" element={<BookingFormPage user={user} />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute user={user}><DashboardPage user={user} /></ProtectedRoute>} />

          {/* Admin-Only Route */}
          <Route path="/admin" element={<ProtectedRoute user={user} roles={['admin']}><AdminPage /></ProtectedRoute>} />

        </Route>
      </Routes>
    </div>
  );
}

export default App;
