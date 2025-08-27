import React, { useState } from 'react';
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
import ServicesPage from '../pages/ServicesPage';

export default function AppLayout({ user, onLogout }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  const handleLogout = () => {
    setIsMenuOpen(false);
    onLogout();
    navigate('/');
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="site-wrapper">
      <nav className="dashboard-nav">
        <NavLink to="/" className="nav-brand">Mobile Shop</NavLink>
        <button className="mobile-nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          &#9776;
        </button>
        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <NavLink to="/services" className="nav-link" onClick={closeMenu}>Services</NavLink>
          <NavLink to="/testimonials" className="nav-link" onClick={closeMenu}>Testimonials</NavLink>
          <NavLink to="/blog" className="nav-link" onClick={closeMenu}>Blog</NavLink>
          <NavLink to="/about" className="nav-link" onClick={closeMenu}>About Us</NavLink>
          <NavLink to="/contact" className="nav-link" onClick={closeMenu}>Contact</NavLink>

          {user ? (
            <>
              <NavLink to="/history" className="nav-link" onClick={closeMenu}>My Service History</NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin" className="nav-link" onClick={closeMenu}>Admin</NavLink>
              )}
              <span className="nav-user-greeting">Welcome, {user.firstName}!</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-login-button" onClick={closeMenu}>Login / Register</Link>
          )}
        </div>
      </nav>
      <main className="app-main">
        <Routes>
          {/* --- Routes Updated --- */}
          <Route path="/" element={<AboutPage />} /> {/* The "About" page is now the homepage */}
          <Route path="/services" element={<ServicesPage />} />
          
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