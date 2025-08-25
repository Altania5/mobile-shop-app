import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BookingManager() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const fetchBookings = async () => {
    try {
      const headers = { 'x-auth-token': token };
      const response = await axios.get('/api/bookings', { headers });
      setBookings(response.data);
    } catch (err) {
      setError('Could not fetch bookings.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
        setError('');
        const headers = { 'x-auth-token': token };
        const body = { status: newStatus };
        await axios.put(`/api/bookings/${bookingId}/status`, body, { headers });
        // Refresh the list to show the change
        fetchBookings();
    } catch (err) {
        setError(err.response?.data?.msg || 'Failed to update status.');
    }
  };

  if (loading) return <p>Loading bookings...</p>;

  return (
    <div className="manager-container">
      <h3>Manage Bookings</h3>
      {error && <p className="error-message">{error}</p>}
      <div className="manager-list">
        {bookings.length === 0 ? <p>No bookings found.</p> : bookings.map(booking => (
          <div key={booking._id} className="list-item booking-admin-item">
            <div className="booking-info">
                <strong>{booking.service?.name || 'N/A'}</strong> on <strong>{new Date(booking.date).toLocaleDateString()}</strong>
                <br />
                <span>Client: {booking.user?.firstName} {booking.user?.lastName} ({booking.user?.email})</span>
            </div>
            <div className="booking-actions">
              <select 
                value={booking.status} 
                onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                className={`status-select status-${booking.status.toLowerCase()}`}
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookingManager;