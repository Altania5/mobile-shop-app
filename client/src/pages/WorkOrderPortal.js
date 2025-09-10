import React, { useState } from 'react';
import axios from 'axios';
import './WorkOrderPortal.css';

const WorkOrderPortal = () => {
  const [workOrderNumber, setWorkOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async (e) => {
    e.preventDefault();
    
    if (!workOrderNumber.trim() || !email.trim()) {
      setError('Please enter both work order number and email address');
      return;
    }

    setIsDownloading(true);
    setError('');

    try {
      const response = await axios.get(
        `/api/workOrders/public/${workOrderNumber}/pdf`,
        {
          params: { email },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `WorkOrder-${workOrderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Success message
      setError('');
      alert('Work order downloaded successfully!');
    } catch (err) {
      console.error('Download error:', err);
      if (err.response?.status === 404) {
        setError('Work order not found or email does not match our records');
      } else if (err.response?.status === 400) {
        setError('Please provide a valid email address');
      } else {
        setError('Unable to download work order. Please try again later.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="work-order-portal">
      <div className="portal-container">
        <div className="portal-header">
          <h1>📄 Work Order Portal</h1>
          <p>Download your work order PDF using your work order number and email address</p>
        </div>

        <div className="portal-card">
          <div className="card-header">
            <h2>Download Work Order</h2>
          </div>

          <form onSubmit={handleDownload} className="download-form">
            <div className="form-group">
              <label htmlFor="workOrderNumber">Work Order Number</label>
              <input
                type="text"
                id="workOrderNumber"
                value={workOrderNumber}
                onChange={(e) => setWorkOrderNumber(e.target.value)}
                placeholder="e.g., WO-2024-001"
                required
              />
              <small>The work order number from your email or receipt</small>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
              <small>The email address used when the work order was created</small>
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            <button 
              type="submit" 
              className={`download-button ${isDownloading ? 'downloading' : ''}`}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <span className="spinner"></span>
                  Downloading...
                </>
              ) : (
                <>
                  📥 Download Work Order PDF
                </>
              )}
            </button>
          </form>

          <div className="help-section">
            <h3>Need Help?</h3>
            <p>If you're having trouble finding your work order, please contact us:</p>
            <div className="contact-info">
              <div className="contact-item">
                <span className="icon">📞</span>
                <span>(555) 123-4567</span>
              </div>
              <div className="contact-item">
                <span className="icon">📧</span>
                <span>JamesFerzanden@hardworkmobile.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderPortal;
