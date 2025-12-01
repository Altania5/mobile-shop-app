import React, { useState } from 'react';
import { NavLink, useNavigate, Link, Outlet } from 'react-router-dom';
import Footer from './Footer';
import logo from './/images/the_signet_ring.png';

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
        <img src={logo} alt="Logo"> 
        <NavLink to="/" className="nav-brand"></NavLink>
        </img>

        <button className="mobile-nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          &#9776;
        </button>
        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <NavLink to="/services" className="nav-link" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/testimonials" className="nav-link" onClick={closeMenu}>Testimonials</NavLink>
          <NavLink to="/blog" className="nav-link" onClick={closeMenu}>Blog</NavLink>
          <NavLink to="/about" className="nav-link" onClick={closeMenu}>About Me</NavLink>
          <NavLink to="/contact" className="nav-link" onClick={closeMenu}>Contact</NavLink>
          <NavLink to="/work-order-portal" className="nav-link work-order-link" onClick={closeMenu}>📄 Work Orders</NavLink>

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
        {/* All page components will be rendered here */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
