import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import setAuthToken from './utils/setAuthToken';

// Layout and Authentication
import AppLayout from './layout/AppLayout';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

// Page Imports
import MainPage from './pages/MainPage';
import ServicesPage from './pages/ServicesPage';
import TestimonialsPage from './pages/TestimonialsPage';
import BlogPage from './pages/BlogPage';
import PostPage from './pages/PostPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ServiceHistoryPage from './pages/ServiceHistoryPage';
import AdminPage from './pages/AdminPage';
import BookingPage from './pages/BookingPage';
import BookingFormPage from './pages/BookingFormPage';
import LeaveReviewPage from './pages/LeaveReviewPage';

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
          setUser({ ...decodedUser, token, role: decodedUser.role });
        }
      } catch (error) {
        handleLogout();
      }
    }
  }, [handleLogout]);

  const handleLoginSuccess = (token) => {
    localStorage.setItem('token', token);
    setAuthToken(token);
    const decodedUser = jwtDecode(token);
    setUser({ ...decodedUser, token, role: decodedUser.role });
    navigate('/history');
  };

  return (
    <div className="App">
      <Routes>
        {/* All routes are now nested within the AppLayout */}
        <Route element={<AppLayout user={user} onLogout={handleLogout} />}>
          
          {/* Public Routes */}
          <Route path="/" element={<ServicesPage />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/testimonials" element={<TestimonialsPage user={user} />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<PostPage user={user} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Protected Routes */}
          <Route path="/history" element={<ProtectedRoute user={user}><ServiceHistoryPage /></ProtectedRoute>} />
          <Route path="/book/:serviceId" element={<ProtectedRoute user={user}><BookingPage /></ProtectedRoute>} />
          <Route path="/book/:serviceId/details" element={<ProtectedRoute user={user}><BookingFormPage user={user} /></ProtectedRoute>} />
          <Route path="/leave-review" element={<ProtectedRoute user={user}><LeaveReviewPage /></ProtectedRoute>} />

          {/* Admin-Only Route */}
          <Route path="/admin" element={<ProtectedRoute user={user} roles={['admin']}><AdminPage /></ProtectedRoute>} />

        </Route>
      </Routes>
    </div>
  );
}

export default App;
