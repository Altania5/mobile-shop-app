import React from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'; 
import MainPage from '../pages/MainPage';
import BookingPage from '../pages/BookingPage';
import AboutPage from '../pages/AboutPage';
import ServiceHistoryPage from '../pages/ServiceHistoryPage';
import TestimonialsPage from '../pages/TestimonialsPage';


export default function AppLayout({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <div>
      <nav className="dashboard-nav">
        <NavLink to="/" className="nav-brand">Mobile Shop</NavLink>
        <div className="nav-links">
          {/* 3. Add the new NavLinks */}
          <NavLink to="/" className="nav-link">Services</NavLink>
          <NavLink to="/history" className="nav-link">My Service History</NavLink>
          <NavLink to="/testimonials" className="nav-link">Testimonials</NavLink>
          <NavLink to="/about" className="nav-link">About Us</NavLink>
          <span>Welcome, {user.firstName}!</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/book/:serviceId" element={<BookingPage user={user} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/history" element={<ServiceHistoryPage />} /> 
          <Route path="/testimonials" element={<TestimonialsPage />} /> 
        </Routes>
      </main>
    </div>
  );
}