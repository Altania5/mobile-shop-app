import React from 'react';
import ServiceManager from '../components/admin/ServiceManager';

function AdminPage() {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div className="admin-panel">
        <ServiceManager />
        {/* We will add other managers like BlogManager here later */}
      </div>
    </div>
  );
}

export default AdminPage;