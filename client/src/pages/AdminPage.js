import React, { useEffect } from 'react';
import ServiceManager from '../components/admin/ServiceManager';
import BookingManager from '../components/admin/BookingManager';
import TestimonialManager from '../components/admin/TestimonialManager';
import BlogManager from '../components/admin/BlogManager';
import WorkOrderManager from '../components/admin/WorkOrderManager';
import TimeSlotManager from '../components/admin/TimeSlotManager';
import '../components/admin/AdminTheme.css';

function AdminPage() {
  useEffect(() => {
    // Add class to body to prevent horizontal scroll
    document.body.classList.add('admin-page-active');
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('admin-page-active');
    };
  }, []);

  return (
    <div className="admin-page-wrapper">
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
    </div>
  );
}

export default AdminPage;
