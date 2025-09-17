import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WorkOrderForm from './WorkOrderForm';
import './WorkOrderManager.css';

const WorkOrderManager = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalWorkOrders, setTotalWorkOrders] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const limit = 20;

  useEffect(() => {
    fetchWorkOrders();
  }, [searchTerm, statusFilter, currentPage]);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * limit;
      const token = localStorage.getItem('token');
      const headers = token ? { 'x-auth-token': token } : {};
      
      const response = await axios.get('/api/workOrders', {
        params: {
          search: searchTerm,
          status: statusFilter,
          limit,
          skip
        },
        headers
      });
      
      setWorkOrders(response.data.workOrders || []);
      setTotalWorkOrders(response.data.total || 0);
      setHasMore(response.data.hasMore || false);
    } catch (err) {
      setError('Failed to fetch work orders');
      setWorkOrders([]);
      setTotalWorkOrders(0);
      setHasMore(false);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingWorkOrder(null);
    setShowForm(true);
  };

  const handleEdit = (workOrder) => {
    setEditingWorkOrder(workOrder);
    setShowForm(true);
  };

  const handleFormSave = (savedWorkOrder) => {
    if (editingWorkOrder) {
      // Update existing work order in the list
      setWorkOrders(prev => (prev || []).map(wo => 
        wo._id === savedWorkOrder._id ? savedWorkOrder : wo
      ));
    } else {
      // Add new work order to the beginning of the list
      setWorkOrders(prev => [savedWorkOrder, ...(prev || [])]);
    }
    setShowForm(false);
    setEditingWorkOrder(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingWorkOrder(null);
  };

  const handleDelete = async (workOrderId) => {
    if (!window.confirm('Are you sure you want to delete this work order?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'x-auth-token': token } : {};
      
      await axios.delete(`/api/workOrders/${workOrderId}`, { headers });
      setWorkOrders(prev => (prev || []).filter(wo => wo._id !== workOrderId));
    } catch (err) {
      setError('Failed to delete work order');
      console.error(err);
    }
  };

  const handleSendEmail = async (workOrderId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'x-auth-token': token } : {};
      
      await axios.post(`/api/workOrders/${workOrderId}/send-email`, {}, { headers });
      // Update the work order in the list to show email sent status
      setWorkOrders(prev => (prev || []).map(wo => 
        wo._id === workOrderId 
          ? { ...wo, emailSent: true, emailSentDate: new Date().toISOString() }
          : wo
      ));
      alert('Work order sent successfully!');
    } catch (err) {
      alert('Failed to send work order');
      console.error(err);
    }
  };

  const handleDownloadPDF = async (workOrderId, workOrderNumber) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'x-auth-token': token } : {};
      
      const response = await axios.get(`/api/workOrders/${workOrderId}/pdf`, {
        responseType: 'blob',
        headers
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `WorkOrder-${workOrderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download PDF');
      console.error(err);
    }
  };

  const handleGenerateAcknowledgment = async (workOrderId, workOrderNumber) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'x-auth-token': token } : {};
      
      const response = await axios.post(`/api/workOrders/${workOrderId}/generate-acknowledgment`, {}, { headers });
      
      // Update the work order to reflect acknowledgment required
      setWorkOrders(prev => (prev || []).map(wo => 
        wo._id === workOrderId 
          ? { 
              ...wo, 
              acknowledgment: {
                ...wo.acknowledgment,
                isRequired: true,
                tokenExpiresAt: response.data.tokenExpiresAt
              }
            }
          : wo
      ));
      
      alert(`Acknowledgment link sent successfully to customer!\n\nLink expires: ${new Date(response.data.tokenExpiresAt).toLocaleDateString()}`);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already been acknowledged')) {
        alert(`This work order has already been acknowledged.\n\nAcknowledged on: ${new Date(err.response.data.acknowledgedDate).toLocaleDateString()}`);
        // Refresh the work orders list to get the latest data
        fetchWorkOrders();
      } else {
        alert('Failed to generate acknowledgment link');
        console.error(err);
      }
    }
  };

  const handleUpdateStatus = async (workOrderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'x-auth-token': token } : {};
      
      const response = await axios.put(`/api/workOrders/${workOrderId}`, {
        status: newStatus
      }, { headers });
      
      // Update the work order in the list
      setWorkOrders(prev => (prev || []).map(wo => 
        wo._id === workOrderId ? response.data : wo
      ));
    } catch (err) {
      setError('Failed to update status');
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: '#6c757d',
      pending_approval: '#ffc107',
      approved: '#17a2b8',
      in_progress: '#fd7e14',
      completed: '#28a745',
      billed: '#6f42c1',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const formatStatus = (status) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  if (showForm) {
    return (
      <WorkOrderForm
        workOrderId={editingWorkOrder?._id}
        initialData={editingWorkOrder}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="work-order-manager">
      <div className="manager-header">
        <h2>Work Order Management</h2>
        <button onClick={handleCreateNew} className="create-new-button">
          Create New Work Order
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search work orders..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>
        <div className="filter-section">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="status-filter"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="billed">Billed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span>
          Showing {workOrders?.length || 0} of {totalWorkOrders} work orders
        </span>
      </div>

      {loading ? (
        <div className="loading">Loading work orders...</div>
      ) : !workOrders || workOrders.length === 0 ? (
        <div className="no-results">
          <p>No work orders found.</p>
          <button onClick={handleCreateNew} className="create-first-button">
            Create Your First Work Order
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="work-orders-table">
            <table>
              <thead>
                <tr>
                  <th>Work Order #</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Created</th>
                  <th>Email Status</th>
                  <th>Acknowledgment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(workOrders || []).map(workOrder => (
                  <tr key={workOrder._id}>
                    <td>
                      <span className="work-order-number">
                        {workOrder.workOrderNumber}
                      </span>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">{workOrder.customer.name}</div>
                        <div className="customer-email">{workOrder.customer.email}</div>
                      </div>
                    </td>
                    <td>
                      <div className="vehicle-info">
                        {workOrder.vehicle.year} {workOrder.vehicle.make} {workOrder.vehicle.model}
                      </div>
                    </td>
                    <td>
                      <select
                        value={workOrder.status}
                        onChange={(e) => handleUpdateStatus(workOrder._id, e.target.value)}
                        className="status-select"
                        style={{ backgroundColor: getStatusColor(workOrder.status) }}
                      >
                        <option value="draft">Draft</option>
                        <option value="pending_approval">Pending Approval</option>
                        <option value="approved">Approved</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="billed">Billed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <span className="total-amount">
                        {formatCurrency(workOrder.pricing.totalAmount)}
                      </span>
                    </td>
                    <td>{formatDate(workOrder.createdAt)}</td>
                    <td>
                      <div className="email-status">
                        {workOrder.emailSent ? (
                          <span className="email-sent">
                            ✓ Sent {workOrder.emailSentDate ? formatDate(workOrder.emailSentDate) : ''}
                          </span>
                        ) : (
                          <span className="email-not-sent">Not sent</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="acknowledgment-status">
                        {workOrder.acknowledgment?.isAcknowledged ? (
                          <span className="acknowledged">
                            ✅ Acknowledged {workOrder.acknowledgment.acknowledgmentDate ? formatDate(workOrder.acknowledgment.acknowledgmentDate) : ''}
                          </span>
                        ) : workOrder.acknowledgment?.isRequired ? (
                          <span className="pending-acknowledgment">
                            ⏳ Pending
                            {workOrder.acknowledgment.tokenExpiresAt && (
                              <div className="expires-info">
                                Expires: {formatDate(workOrder.acknowledgment.tokenExpiresAt)}
                              </div>
                            )}
                          </span>
                        ) : (
                          <span className="no-acknowledgment">Not required</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(workOrder)}
                          className="edit-button"
                          title="Edit Work Order"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleSendEmail(workOrder._id)}
                          className="email-button"
                          title="Send Email"
                          disabled={!workOrder.customer.email}
                        >
                          Email
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(workOrder._id, workOrder.workOrderNumber)}
                          className="pdf-button"
                          title="Download PDF"
                        >
                          PDF
                        </button>
                        {!workOrder.acknowledgment?.isAcknowledged && (
                          <button
                            onClick={() => handleGenerateAcknowledgment(workOrder._id, workOrder.workOrderNumber)}
                            className="acknowledgment-button"
                            title="Generate Acknowledgment Link"
                            disabled={!workOrder.customer.email}
                          >
                            Acknowledgment
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(workOrder._id)}
                          className="delete-button"
                          title="Delete Work Order"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="mobile-work-orders-container">
            {(workOrders || []).map(workOrder => (
              <div key={workOrder._id} className="mobile-work-order-card">
                <div className="mobile-work-order-header">
                  <div className="mobile-work-order-number">
                    {workOrder.workOrderNumber}
                  </div>
                  <select
                    value={workOrder.status}
                    onChange={(e) => handleUpdateStatus(workOrder._id, e.target.value)}
                    className="mobile-work-order-status"
                    style={{ backgroundColor: getStatusColor(workOrder.status) }}
                  >
                    <option value="draft">Draft</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="billed">Billed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="mobile-work-order-details">
                  <div className="mobile-customer-info">
                    <div className="mobile-customer-name">{workOrder.customer.name}</div>
                    <div className="mobile-customer-email">{workOrder.customer.email}</div>
                  </div>
                  <div className="mobile-vehicle-info">
                    {workOrder.vehicle.year} {workOrder.vehicle.make} {workOrder.vehicle.model}
                  </div>
                </div>

                <div className="mobile-work-order-details">
                  <div className="mobile-work-order-detail">
                    <div className="mobile-work-order-label">Total</div>
                    <div className="mobile-total-amount">
                      {formatCurrency(workOrder.pricing.totalAmount)}
                    </div>
                  </div>
                  <div className="mobile-work-order-detail">
                    <div className="mobile-work-order-label">Created</div>
                    <div className="mobile-work-order-value">{formatDate(workOrder.createdAt)}</div>
                  </div>
                </div>

                <div className="mobile-status-section">
                  <div className="mobile-status-item">
                    <div className="mobile-status-label">Email Status</div>
                    <div className={`mobile-status-value ${workOrder.emailSent ? 'email-sent' : 'email-not-sent'}`}>
                      {workOrder.emailSent ? (
                        <>✓ Sent {workOrder.emailSentDate ? formatDate(workOrder.emailSentDate) : ''}</>
                      ) : (
                        'Not sent'
                      )}
                    </div>
                  </div>
                  <div className="mobile-status-item">
                    <div className="mobile-status-label">Acknowledgment</div>
                    <div className={`mobile-status-value ${
                      workOrder.acknowledgment?.isAcknowledged ? 'acknowledged' : 
                      workOrder.acknowledgment?.isRequired ? 'pending-acknowledgment' : 'no-acknowledgment'
                    }`}>
                      {workOrder.acknowledgment?.isAcknowledged ? (
                        <>✅ Acknowledged {workOrder.acknowledgment.acknowledgmentDate ? formatDate(workOrder.acknowledgment.acknowledgmentDate) : ''}</>
                      ) : workOrder.acknowledgment?.isRequired ? (
                        <>⏳ Pending {workOrder.acknowledgment.tokenExpiresAt && (
                          <div className="expires-info">
                            Expires: {formatDate(workOrder.acknowledgment.tokenExpiresAt)}
                          </div>
                        )}</>
                      ) : (
                        'Not required'
                      )}
                    </div>
                  </div>
                </div>

                <div className="mobile-work-order-actions">
                  <button
                    onClick={() => handleEdit(workOrder)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleSendEmail(workOrder._id)}
                    className="email-button"
                    disabled={!workOrder.customer.email}
                  >
                    Email
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(workOrder._id, workOrder.workOrderNumber)}
                    className="pdf-button"
                  >
                    PDF
                  </button>
                  {!workOrder.acknowledgment?.isAcknowledged && (
                    <button
                      onClick={() => handleGenerateAcknowledgment(workOrder._id, workOrder.workOrderNumber)}
                      className="acknowledgment-button"
                      disabled={!workOrder.customer.email}
                    >
                      Acknowledgment
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(workOrder._id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalWorkOrders > limit && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="page-button"
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {Math.ceil(totalWorkOrders / limit)}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!hasMore}
                className="page-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WorkOrderManager;
