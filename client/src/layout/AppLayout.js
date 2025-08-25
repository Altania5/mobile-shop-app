import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import MainPage from '../pages/MainPage';
import BookingPage from '../pages/BookingPage'; // We will create this next

export default function AppLayout({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <div>
      <nav className="dashboard-nav">
        <Link to="/" className="nav-brand">Mobile Shop</Link>
        <div>
          <span>Welcome, {user.firstName}!</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/book/:serviceId" element={<BookingPage user={user} />} />
          {/* Add other routes here later */}
        </Routes>
      </main>
    </div>
  );
}