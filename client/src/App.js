import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';

import AppLayout from './layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

import ServicesPage from './pages/ServicesPage';
import TestimonialsPage from './pages/TestimonialsPage';
import BlogPage from './pages/BlogPage';
import PostPage from './pages/PostPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import WorkOrderPortal from './pages/WorkOrderPortal';
import BookingPage from './pages/BookingPage';
import BookingFormPage from './pages/BookingFormPage';
import WorkOrderAcknowledgmentPage from './pages/WorkOrderAcknowledgmentPage';
import CustomBookingVerificationPage from './pages/CustomBookingVerificationPage';
import ServiceLandingPage from './pages/ServiceLandingPage';

import './App.css';

// Send cookies with every request (httpOnly cookie auth)
axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try { await axios.post('/api/users/logout'); } catch {}
    setUser(null);
    navigate('/');
  }, [navigate]);

  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get('/api/users/me');
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setAuthReady(true);
    }
  }, []);

  // On mount, check if we have an active session (cookie-based)
  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleLoginSuccess = useCallback((userData) => {
    setUser(userData);
    navigate('/dashboard');
  }, [navigate]);

  // Don't render routes until we know auth state (prevents redirect flicker)
  if (!authReady) return null;

  return (
    <div className="App">
      <Routes>
        <Route element={<AppLayout user={user} onLogout={handleLogout} />}>

          {/* Public Routes */}
          <Route path="/"                             element={<ServicesPage user={user} />} />
          <Route path="/services"                     element={<ServicesPage user={user} />} />
          <Route path="/services/:serviceSlug"        element={<ServiceLandingPage />} />
          <Route path="/testimonials"                 element={<TestimonialsPage user={user} />} />
          <Route path="/blog"                         element={<BlogPage />} />
          <Route path="/blog/:slug"                   element={<PostPage user={user} />} />
          <Route path="/about"                        element={<AboutPage />} />
          <Route path="/contact"                      element={<ContactPage />} />
          <Route path="/work-order-portal"            element={<WorkOrderPortal />} />
          <Route path="/work-order/acknowledge/:token" element={<WorkOrderAcknowledgmentPage />} />
          <Route path="/verify-custom-booking/:token" element={<CustomBookingVerificationPage />} />
          <Route path="/book/:serviceId"              element={<BookingPage user={user} />} />
          <Route path="/book/:serviceId/details"      element={<BookingFormPage user={user} />} />

          {/* Auth Routes */}
          <Route path="/login"          element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register"       element={<RegisterPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage onLoginSuccess={handleLoginSuccess} />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute user={user}>
              <DashboardPage user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute user={user} roles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          } />

        </Route>
      </Routes>
    </div>
  );
}

export default App;
