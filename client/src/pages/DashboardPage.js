import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ChangePasswordForm from '../components/ChangePasswordForm';
import SquarePaymentForm from '../components/SquarePaymentForm';
import EditBookingModal from '../components/EditBookingModal';
import './DashboardPage.css';

const AccountSettings = () => (
  <div className="settings-container">
    <div className="settings-section">
      <ChangePasswordForm />
    </div>
    <div className="settings-section">
      <SquarePaymentForm />
    </div>
  </div>
);

const ServiceHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingBooking, setEditingBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      const response = await axios.get('/api/bookings/', { headers });
      setBookings(response.data);
    } catch (err) {
      setError('Could not fetch your booking history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await axios.patch(`/api/bookings/${bookingId}/cancel`);
        setBookings(bookings.map(b =>
          b._id === bookingId ? { ...b, status: 'Cancelled' } : b
        ));
        alert('Booking cancelled successfully.');
      } catch (err) {
        console.error('Failed to cancel booking:', err);
        alert('Failed to cancel booking. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }
  if (error) return <p style={{ color: 'var(--error-color)' }}>{error}</p>;

  return (
    <div className="page-container">
      {editingBooking &&
        <EditBookingModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onUpdate={fetchBookings}
        />}
      <h2>My Service History</h2>
      {bookings.length === 0 ? (
        <p>You have no past or upcoming appointments.</p>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <div className="booking-card-header">
                <h3>
                  {booking.isCustomService 
                    ? `${booking.customServiceName} (Professional Service)` 
                    : (booking.service?.name || 'Service Removed')
                  }
                </h3>
                <span className={`booking-status status-${booking.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {booking.status}
                </span>
              </div>
              <div className="booking-card-body">
                <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                <p><strong>Vehicle:</strong> {booking.vehicleYear} {booking.vehicleMake} {booking.vehicleModel} ({booking.vehicleColor})</p>
                <p><strong>Price:</strong> 
                  {booking.isCustomService && booking.customServicePrice 
                    ? `$${booking.customServicePrice}` 
                    : (booking.service && typeof booking.service.price === 'number'
                      ? `$${booking.service.price.toFixed(2)}`
                      : 'N/A')
                  }
                </p>
                {booking.duration && (
                  <p><strong>Duration:</strong> {booking.duration} minutes</p>
                )}
                {booking.createdByAdmin && (
                  <p><strong>Type:</strong> <span className="admin-created-badge">Professional Service</span></p>
                )}
              </div>
              <div className="booking-card-footer">
                {booking.status === 'Pending' && (
                  <>
                    <button onClick={() => setEditingBooking(booking)}>Edit Details</button>
                    <button onClick={() => handleCancelBooking(booking._id)}>Cancel</button>
                  </>
                )}
                {booking.status === 'Confirmed' && (
                  <button onClick={() => handleCancelBooking(booking._id)}>Cancel</button>
                )}
                {booking.status === 'Completed' && (
                  booking.service ? (
                    <Link to="/leave-review" state={{ booking: booking }} className="review-button-link">
                      <button>Leave a Review</button>
                    </Link>
                  ) : (
                    <button disabled>Service No Longer Available</button>
                  )
                )}
                {booking.serviceStatus && booking.serviceStatus.trim() !== '' && (booking.status === 'Pending' || booking.status === 'Confirmed') && (
                  <p className="service-progress"><strong>Progress:</strong> {booking.serviceStatus}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DashboardPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('history');

  return (
    <div className="dashboard-container">
      <h1>My Account</h1>
      <div className="dashboard-tabs">
        <button
          className={`dashboard-tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Service History
        </button>
        <button
          className={`dashboard-tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Account Settings
        </button>
      </div>
      <div className="dashboard-content">
        {activeTab === 'history' && <ServiceHistory user={user} />}
        {activeTab === 'settings' && <AccountSettings user={user} />}
      </div>
    </div>
  );
};

export default DashboardPage;
