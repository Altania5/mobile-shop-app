import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import './WorkOrderAcknowledgmentPage.css';

const WorkOrderAcknowledgmentPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acknowledging, setAcknowledging] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  
  // Acknowledgment form state
  const [acknowledgedBy, setAcknowledgedBy] = useState({
    name: '',
    email: ''
  });
  const [signatureRequired, setSignatureRequired] = useState(false);
  const [signaturePad, setSignaturePad] = useState(null);

  useEffect(() => {
    fetchWorkOrder();
  }, [token]);

  const fetchWorkOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/workOrders/acknowledge/${token}`);
      setWorkOrder(response.data);
      
      // Pre-populate customer information
      setAcknowledgedBy({
        name: response.data.customer.name,
        email: response.data.customer.email
      });
      
    } catch (err) {
      console.error('Error fetching work order:', err);
      if (err.response?.status === 404) {
        setError('Work order not found or acknowledgment link is invalid.');
      } else if (err.response?.status === 400) {
        const data = err.response.data;
        if (data.alreadyAcknowledged) {
          setError('This work order has already been acknowledged.');
        } else if (data.expired) {
          setError('The acknowledgment link has expired. Please contact us for a new link.');
        } else {
          setError(data.message || 'Invalid acknowledgment link.');
        }
      } else {
        setError('Failed to load work order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setAcknowledgedBy({
      ...acknowledgedBy,
      [e.target.name]: e.target.value
    });
  };

  const clearSignature = () => {
    if (signaturePad) {
      signaturePad.clear();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!acknowledgedBy.name.trim() || !acknowledgedBy.email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(acknowledgedBy.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (signatureRequired && (!signaturePad || signaturePad.isEmpty())) {
      setError('Please provide your digital signature.');
      return;
    }

    try {
      setAcknowledging(true);
      setError('');

      const signature = signatureRequired && signaturePad ? signaturePad.toDataURL() : null;
      const userAgent = navigator.userAgent;

      await axios.post(`/api/workOrders/acknowledge/${token}`, {
        acknowledgedBy,
        signature,
        userAgent
      });

      setAcknowledged(true);
    } catch (err) {
      console.error('Error acknowledging work order:', err);
      if (err.response?.status === 403) {
        setError('The email address does not match the work order customer.');
      } else if (err.response?.status === 400) {
        const data = err.response.data;
        if (data.alreadyAcknowledged) {
          setError('This work order has already been acknowledged.');
        } else if (data.expired) {
          setError('The acknowledgment link has expired.');
        } else {
          setError(data.message || 'Invalid acknowledgment request.');
        }
      } else {
        setError('Failed to acknowledge work order. Please try again.');
      }
    } finally {
      setAcknowledging(false);
    }
  };

  if (loading) {
    return (
      <div className="acknowledgment-page">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading work order...</p>
        </div>
      </div>
    );
  }

  if (error && !workOrder) {
    return (
      <div className="acknowledgment-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Unable to Load Work Order</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (acknowledged) {
    return (
      <div className="acknowledgment-page">
        <div className="success-container">
          <div className="success-icon">✅</div>
          <h2>Work Order Acknowledged Successfully!</h2>
          <p>Thank you for acknowledging work order <strong>{workOrder.workOrderNumber}</strong>.</p>
          <p>You will receive a confirmation email shortly.</p>
          <div className="success-actions">
            <button onClick={() => window.print()} className="btn-secondary">
              Print This Page
            </button>
            <button onClick={() => navigate('/')} className="btn-primary">
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="acknowledgment-page">
      <div className="acknowledgment-container">
        <header className="acknowledgment-header">
          <h1>Work Order Acknowledgment</h1>
          <p>Please review the work order details below and acknowledge receipt</p>
        </header>

        {/* Work Order Details */}
        <div className="work-order-summary">
          <div className="summary-header">
            <h2>Work Order #{workOrder.workOrderNumber}</h2>
            <span className={`status-badge status-${workOrder.status}`}>
              {workOrder.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="summary-grid">
            <div className="summary-section">
              <h3>🚗 Vehicle Information</h3>
              <div className="detail-rows">
                <div className="detail-row">
                  <span className="label">Vehicle:</span>
                  <span>{workOrder.vehicle.year} {workOrder.vehicle.make} {workOrder.vehicle.model}</span>
                </div>
                {workOrder.vehicle.vin && (
                  <div className="detail-row">
                    <span className="label">VIN:</span>
                    <span>{workOrder.vehicle.vin}</span>
                  </div>
                )}
                {workOrder.vehicle.licensePlate && (
                  <div className="detail-row">
                    <span className="label">License Plate:</span>
                    <span>{workOrder.vehicle.licensePlate}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="summary-section">
              <h3>🔧 Service Details</h3>
              <div className="detail-rows">
                <div className="detail-row">
                  <span className="label">Service:</span>
                  <span>{workOrder.serviceDetails.description}</span>
                </div>
                {workOrder.serviceDetails.customerComplaints && (
                  <div className="detail-row">
                    <span className="label">Issue:</span>
                    <span>{workOrder.serviceDetails.customerComplaints}</span>
                  </div>
                )}
                {workOrder.scheduledDate && (
                  <div className="detail-row">
                    <span className="label">Scheduled Date:</span>
                    <span>{new Date(workOrder.scheduledDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Labor and Parts */}
          {(workOrder.laborItems.length > 0 || workOrder.partItems.length > 0) && (
            <div className="items-section">
              {workOrder.laborItems.length > 0 && (
                <div className="items-group">
                  <h3>🔨 Labor</h3>
                  <div className="items-list">
                    {workOrder.laborItems.map((item, index) => (
                      <div key={index} className="item-row">
                        <span className="item-description">{item.description}</span>
                        <span className="item-details">{item.hours} hrs @ ${item.hourlyRate}/hr</span>
                        <span className="item-total">${item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {workOrder.partItems.length > 0 && (
                <div className="items-group">
                  <h3>🔩 Parts</h3>
                  <div className="items-list">
                    {workOrder.partItems.map((item, index) => (
                      <div key={index} className="item-row">
                        <span className="item-description">{item.description}</span>
                        <span className="item-details">{item.quantity} @ ${item.unitPrice.toFixed(2)}</span>
                        <span className="item-total">${item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Totals */}
          {workOrder.pricing.totalAmount > 0 && (
            <div className="totals-section">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${workOrder.pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Tax ({(workOrder.pricing.taxRate * 100).toFixed(1)}%):</span>
                <span>${workOrder.pricing.taxAmount.toFixed(2)}</span>
              </div>
              <div className="total-row total-final">
                <span>Total Amount:</span>
                <span>${workOrder.pricing.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Acknowledgment Form */}
        <div className="acknowledgment-form-container">
          <h2>Acknowledgment</h2>
          <p>By acknowledging this work order, you confirm that you have received and reviewed the above details.</p>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="acknowledgment-form">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={acknowledgedBy.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={acknowledgedBy.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email address"
              />
            </div>

            <div className="form-group signature-group">
              <div className="signature-header">
                <label>Digital Signature</label>
                <label className="signature-checkbox">
                  <input
                    type="checkbox"
                    checked={signatureRequired}
                    onChange={(e) => setSignatureRequired(e.target.checked)}
                  />
                  Include digital signature
                </label>
              </div>
              
              {signatureRequired && (
                <div className="signature-container">
                  <SignatureCanvas
                    ref={(ref) => setSignaturePad(ref)}
                    penColor="black"
                    canvasProps={{
                      width: 500,
                      height: 200,
                      className: 'signature-canvas'
                    }}
                  />
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="btn-clear-signature"
                  >
                    Clear Signature
                  </button>
                  <p className="signature-note">
                    Sign above using your mouse or touch screen
                  </p>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-cancel"
                disabled={acknowledging}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-acknowledge"
                disabled={acknowledging}
              >
                {acknowledging ? (
                  <>
                    <div className="spinner"></div>
                    Acknowledging...
                  </>
                ) : (
                  <>
                    ✓ Acknowledge Work Order
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderAcknowledgmentPage;
