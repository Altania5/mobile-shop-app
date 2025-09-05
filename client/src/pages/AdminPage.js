import React from 'react';
import ServiceManager from '../components/admin/ServiceManager';
import BookingManager from '../components/admin/BookingManager';
import TestimonialManager from '../components/admin/TestimonialManager';
import BlogManager from '../components/admin/BlogManager';
import '../components/admin/AdminTheme.css';
import '../components/admin/AdminTheme.css';

function AdminPage() {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div className="admin-panel">
        <BookingManager />
        <ServiceManager />
        <TestimonialManager />
        <BlogManager />
      </div>
    </div>
  );
}

export default AdminPage;
