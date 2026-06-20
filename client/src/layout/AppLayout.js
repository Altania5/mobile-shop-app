import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link, Outlet } from 'react-router-dom';
import Footer from './Footer';
import logo from './/images/the_signet_ring.png';
import ScrollToTop from '../components/ScrollToTop';

export default function AppLayout({ user, onLogout }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fire Google Ads click-to-call conversion on any tel: link click
  useEffect(() => {
    const handleTelClick = (e) => {
      const link = e.target.closest('a[href^="tel:"]');
      if (link && typeof window.gtag_report_conversion === 'function') {
        window.gtag_report_conversion(link.href);
      }
    };
    document.addEventListener('click', handleTelClick);
    return () => document.removeEventListener('click', handleTelClick);
  }, []);

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
        <a href="/">
         <img src={logo} alt="Hard Work Mobile Logo" className="nav-logo" />
        </a>
        <button className="mobile-nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          &#9776;
        </button>
        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <NavLink to="/services" className="nav-link" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/testimonials" className="nav-link" onClick={closeMenu}>Testimonials</NavLink>
          <NavLink to="/blog" className="nav-link" onClick={closeMenu}>Blog</NavLink>
          <NavLink to="/about" className="nav-link" onClick={closeMenu}>About Me</NavLink>
          <NavLink to="/contact" className="nav-link" onClick={closeMenu}>Contact</NavLink>
          <NavLink to="/work-order-portal" className="nav-link work-order-link" onClick={closeMenu}><i className="fa-solid fa-file-lines"></i> Work Orders</NavLink>

          {user ? (
            <>
              <NavLink to="/dashboard" className="nav-link" onClick={closeMenu}>My Account</NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin" className="nav-link" onClick={closeMenu}>Admin</NavLink>
              )}
              <span className="nav-user-greeting">Welcome, {user.firstName}!</span>
              <button onClick={handleLogout} className="nav-logout-button">Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-login-button" onClick={closeMenu}>Login / Register</Link>
          )}
        </div>
      </nav>
      <main className="app-main">
        <ScrollToTop />
        <Outlet />
      </main>
      <Footer />
 
    </div>
  );
}

