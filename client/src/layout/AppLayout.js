import React from 'react';
import { Routes, Route, NavLink, useNavigate, Link } from 'react-router-dom';
import Footer from './Footer';
import MainPage from '../pages/MainPage';
import BookingPage from '../pages/BookingPage';
import BookingFormPage from '../pages/BookingFormPage';
import AboutPage from '../pages/AboutPage';
import ServiceHistoryPage from '../pages/ServiceHistoryPage';
import TestimonialsPage from '../pages/TestimonialsPage';
import BlogPage from '../pages/BlogPage';
import PostPage from '../pages/PostPage';
import AdminPage from '../pages/AdminPage';
import LeaveReviewPage from '../pages/LeaveReviewPage';
import ContactPage from '../pages/ContactPage';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppLayout({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="site-wrapper">
      <nav className="dashboard-nav">
        <NavLink to="/" className="nav-brand">Mobile Shop</NavLink>
        <div className="nav-links">
          {/* --- Navigation Links Updated --- */}
          <NavLink to="/services" className="nav-link">Services</NavLink> {/* Changed from "/" to "/services" */}
          <NavLink to="/testimonials" className="nav-link">Testimonials</NavLink>
          <NavLink to="/blog" className="nav-link">Blog</NavLink>
          <NavLink to="/about" className="nav-link">About Us</NavLink>
          <NavLink to="/contact" className="nav-link">Contact</NavLink>

          {user ? (
            <>
              <NavLink to="/history" className="nav-link">My Service History</NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin" className="nav-link">Admin</NavLink>
              )}
              <span>Welcome, {user.firstName}!</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-login-button">Login / Register</Link>
          )}
        </div>
      </nav>
      <main className="app-main">
        <Routes>
          {/* --- Routes Updated --- */}
          <Route path="/" element={<AboutPage />} /> {/* The "About" page is now the homepage */}
          <Route path="/services" element={<MainPage />} /> {/* The "Services" page is now at /services */}
          
          {/* --- Public Routes --- */}
          <Route path="/about" element={<AboutPage />} /> {/* Keep this route for the nav link */}
          <Route path="/testimonials" element={<TestimonialsPage user={user} />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<PostPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* --- Protected Routes (Require Login) --- */}
          <Route path="/book/:serviceId" element={<ProtectedRoute user={user}><BookingPage /></ProtectedRoute>} />
          <Route path="/book/:serviceId/details" element={<ProtectedRoute user={user}><BookingFormPage user={user} /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute user={user}><ServiceHistoryPage /></ProtectedRoute>} />
          <Route path="/leave-review" element={<ProtectedRoute user={user}><LeaveReviewPage /></ProtectedRoute>} />
          
          {user && user.role === 'admin' && (
            <Route path="/admin" element={<ProtectedRoute user={user}><AdminPage /></ProtectedRoute>} />
          )}
        </Routes>
      </main>
      <Footer />
    </div>
  );
}