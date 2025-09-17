import React from 'react';
import ServiceManager from '../components/admin/ServiceManager';
import BookingManager from '../components/admin/BookingManager';
import TestimonialManager from '../components/admin/TestimonialManager';
import BlogManager from '../components/admin/BlogManager';
import WorkOrderManager from '../components/admin/WorkOrderManager';
import TimeSlotManager from '../components/admin/TimeSlotManager';
import '../components/admin/AdminTheme.css';

function AdminPage() {
  return (
    <div className="admin-page-container">
      <h2 className="admin-dashboard-title">Admin Dashboard</h2>
      <div className="admin-panel">
        <BookingManager />
        <TimeSlotManager />
        <ServiceManager />
        <WorkOrderManager />
        <TestimonialManager />
        <BlogManager />
      </div>
    </div>
  );
}

export default AdminPage;
