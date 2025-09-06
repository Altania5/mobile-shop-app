import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WorkOrderForm.css';

const WorkOrderForm = ({ workOrderId, onSave, onCancel, initialData = null }) => {
  const [workOrder, setWorkOrder] = useState({
    customer: {
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      }
    },
    vehicle: {
      year: '',
      make: '',
      model: '',
      vin: '',
      licensePlate: '',
      mileage: '',
      color: ''
    },
    serviceDetails: {
      description: '',
      customerComplaints: '',
      diagnosis: '',
      workPerformed: '',
      recommendations: ''
    },
    laborItems: [],
    partItems: [],
    pricing: {
      taxRate: 0.08
    },
    status: 'draft',
    scheduledDate: '',
    internalNotes: '',
    customerNotes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setWorkOrder(initialData);
    } else if (workOrderId) {
      fetchWorkOrder();
    }
  }, [workOrderId, initialData]);

  const fetchWorkOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 'x-auth-token': token } : {};
      
      const response = await axios.get(`/api/workOrders/${workOrderId}`, { headers });
      setWorkOrder(response.data);
    } catch (err) {
      setError('Failed to fetch work order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setWorkOrder(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleAddressChange = (field, value) => {
    setWorkOrder(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        address: {
          ...prev.customer.address,
          [field]: value
        }
      }
    }));
  };

  const handleAddLaborItem = () => {
    const newItem = {
      description: '',
      hours: 0,
      hourlyRate: 75, // Default rate
      total: 0
    };
    setWorkOrder(prev => ({
      ...prev,
      laborItems: [...prev.laborItems, newItem]
    }));
  };

  const handleUpdateLaborItem = (index, field, value) => {
    const updatedItems = [...workOrder.laborItems];
    updatedItems[index][field] = value;
    
    // Calculate total for this item
    if (field === 'hours' || field === 'hourlyRate') {
      updatedItems[index].total = updatedItems[index].hours * updatedItems[index].hourlyRate;
    }
    
    setWorkOrder(prev => ({
      ...prev,
      laborItems: updatedItems
    }));
  };

  const handleRemoveLaborItem = (index) => {
    setWorkOrder(prev => ({
      ...prev,
      laborItems: prev.laborItems.filter((_, i) => i !== index)
    }));
  };

  const handleAddPartItem = () => {
    const newItem = {
      partNumber: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setWorkOrder(prev => ({
      ...prev,
      partItems: [...prev.partItems, newItem]
    }));
  };

  const handleUpdatePartItem = (index, field, value) => {
    const updatedItems = [...workOrder.partItems];
    updatedItems[index][field] = value;
    
    // Calculate total for this item
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setWorkOrder(prev => ({
      ...prev,
      partItems: updatedItems
    }));
  };

  const handleRemovePartItem = (index) => {
    setWorkOrder(prev => ({
      ...prev,
      partItems: prev.partItems.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const laborSubtotal = workOrder.laborItems.reduce((sum, item) => sum + item.total, 0);
    const partsSubtotal = workOrder.partItems.reduce((sum, item) => sum + item.total, 0);
    const subtotal = laborSubtotal + partsSubtotal;
    const taxAmount = subtotal * workOrder.pricing.taxRate;
    const totalAmount = subtotal + taxAmount;

    return {
      laborSubtotal,
      partsSubtotal,
      subtotal,
      taxAmount,
      totalAmount
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const totals = calculateTotals();
      const workOrderData = {
        ...workOrder,
        pricing: {
          ...workOrder.pricing,
          ...totals
        }
      };

      const token = localStorage.getItem('token');
      const headers = token ? { 'x-auth-token': token } : {};
      
      let response;
      if (workOrderId) {
        response = await axios.put(`/api/workOrders/${workOrderId}`, workOrderData, { headers });
      } else {
        response = await axios.post('/api/workOrders', workOrderData, { headers });
      }

      onSave(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save work order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  if (loading && !workOrder.workOrderNumber) {
    return <div className="loading">Loading work order...</div>;
  }

  return (
    <div className="work-order-form">
      <div className="form-header">
        <h2>{workOrderId ? 'Edit Work Order' : 'Create New Work Order'}</h2>
        {workOrder.workOrderNumber && (
          <span className="work-order-number">#{workOrder.workOrderNumber}</span>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="work-order-form-content">
        {/* Customer Information */}
        <div className="form-section">
          <h3>Customer Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={workOrder.customer.name}
                onChange={(e) => handleInputChange('customer', 'name', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={workOrder.customer.email}
                onChange={(e) => handleInputChange('customer', 'email', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                value={workOrder.customer.phone}
                onChange={(e) => handleInputChange('customer', 'phone', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                value={workOrder.customer.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={workOrder.customer.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                value={workOrder.customer.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>ZIP Code</label>
              <input
                type="text"
                value={workOrder.customer.address.zipCode}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="form-section">
          <h3>Vehicle Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Year *</label>
              <input
                type="text"
                value={workOrder.vehicle.year}
                onChange={(e) => handleInputChange('vehicle', 'year', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Make *</label>
              <input
                type="text"
                value={workOrder.vehicle.make}
                onChange={(e) => handleInputChange('vehicle', 'make', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Model *</label>
              <input
                type="text"
                value={workOrder.vehicle.model}
                onChange={(e) => handleInputChange('vehicle', 'model', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>VIN</label>
              <input
                type="text"
                value={workOrder.vehicle.vin}
                onChange={(e) => handleInputChange('vehicle', 'vin', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>License Plate</label>
              <input
                type="text"
                value={workOrder.vehicle.licensePlate}
                onChange={(e) => handleInputChange('vehicle', 'licensePlate', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Mileage</label>
              <input
                type="text"
                value={workOrder.vehicle.mileage}
                onChange={(e) => handleInputChange('vehicle', 'mileage', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Color</label>
              <input
                type="text"
                value={workOrder.vehicle.color}
                onChange={(e) => handleInputChange('vehicle', 'color', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="form-section">
          <h3>Service Details</h3>
          <div className="form-group">
            <label>Service Description *</label>
            <textarea
              value={workOrder.serviceDetails.description}
              onChange={(e) => handleInputChange('serviceDetails', 'description', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Customer Complaints</label>
            <textarea
              value={workOrder.serviceDetails.customerComplaints}
              onChange={(e) => handleInputChange('serviceDetails', 'customerComplaints', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Diagnosis</label>
            <textarea
              value={workOrder.serviceDetails.diagnosis}
              onChange={(e) => handleInputChange('serviceDetails', 'diagnosis', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Work Performed</label>
            <textarea
              value={workOrder.serviceDetails.workPerformed}
              onChange={(e) => handleInputChange('serviceDetails', 'workPerformed', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Recommendations</label>
            <textarea
              value={workOrder.serviceDetails.recommendations}
              onChange={(e) => handleInputChange('serviceDetails', 'recommendations', e.target.value)}
            />
          </div>
        </div>

        {/* Labor Items */}
        <div className="form-section">
          <div className="section-header">
            <h3>Labor</h3>
            <button type="button" onClick={handleAddLaborItem} className="add-button">
              Add Labor Item
            </button>
          </div>
          {workOrder.laborItems.map((item, index) => (
            <div key={index} className="item-row">
              <div className="form-grid">
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdateLaborItem(index, 'description', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Hours</label>
                  <input
                    type="number"
                    step="0.25"
                    value={item.hours}
                    onChange={(e) => handleUpdateLaborItem(index, 'hours', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label>Hourly Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.hourlyRate}
                    onChange={(e) => handleUpdateLaborItem(index, 'hourlyRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label>Total</label>
                  <input
                    type="text"
                    value={`$${item.total.toFixed(2)}`}
                    readOnly
                    className="readonly"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveLaborItem(index)}
                className="remove-button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Part Items */}
        <div className="form-section">
          <div className="section-header">
            <h3>Parts</h3>
            <button type="button" onClick={handleAddPartItem} className="add-button">
              Add Part
            </button>
          </div>
          {workOrder.partItems.map((item, index) => (
            <div key={index} className="item-row">
              <div className="form-grid">
                <div className="form-group">
                  <label>Part Number</label>
                  <input
                    type="text"
                    value={item.partNumber}
                    onChange={(e) => handleUpdatePartItem(index, 'partNumber', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdatePartItem(index, 'description', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdatePartItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label>Unit Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleUpdatePartItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label>Total</label>
                  <input
                    type="text"
                    value={`$${item.total.toFixed(2)}`}
                    readOnly
                    className="readonly"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePartItem(index)}
                className="remove-button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="form-section pricing-summary">
          <h3>Pricing Summary</h3>
          <div className="pricing-grid">
            <div className="pricing-row">
              <label>Labor Subtotal:</label>
              <span>${totals.laborSubtotal.toFixed(2)}</span>
            </div>
            <div className="pricing-row">
              <label>Parts Subtotal:</label>
              <span>${totals.partsSubtotal.toFixed(2)}</span>
            </div>
            <div className="pricing-row">
              <label>Subtotal:</label>
              <span>${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="pricing-row">
              <label>
                Tax Rate:
                <input
                  type="number"
                  step="0.001"
                  value={workOrder.pricing.taxRate}
                  onChange={(e) => handleInputChange('pricing', 'taxRate', parseFloat(e.target.value) || 0)}
                  className="tax-rate-input"
                />
              </label>
              <span>${totals.taxAmount.toFixed(2)}</span>
            </div>
            <div className="pricing-row total-row">
              <label>Total Amount:</label>
              <span>${totals.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="form-section">
          <h3>Additional Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Status</label>
              <select
                value={workOrder.status}
                onChange={(e) => setWorkOrder(prev => ({ ...prev, status: e.target.value }))}
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
            <div className="form-group">
              <label>Scheduled Date</label>
              <input
                type="datetime-local"
                value={workOrder.scheduledDate ? new Date(workOrder.scheduledDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => setWorkOrder(prev => ({ ...prev, scheduledDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Internal Notes</label>
            <textarea
              value={workOrder.internalNotes}
              onChange={(e) => setWorkOrder(prev => ({ ...prev, internalNotes: e.target.value }))}
              placeholder="Notes for internal use only"
            />
          </div>
          <div className="form-group">
            <label>Customer Notes</label>
            <textarea
              value={workOrder.customerNotes}
              onChange={(e) => setWorkOrder(prev => ({ ...prev, customerNotes: e.target.value }))}
              placeholder="Notes visible to customer"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="save-button">
            {loading ? 'Saving...' : (workOrderId ? 'Update Work Order' : 'Create Work Order')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkOrderForm;
