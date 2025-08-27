import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditBookingModal from '../components/EditBookingModal';
import { Link } from 'react-router-dom';

function ServiceHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingBooking, setEditingBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      const response = await axios.get('/api/bookings/mybookings', { headers });
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

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };
        await axios.put(`/api/bookings/${bookingId}/cancel`, {}, { headers });
        fetchBookings(); // Refresh the list
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to cancel booking.');
      }
    }
  };

  if (loading) return <p>Loading your service history...</p>;
  if (error) return <p style={{ color: 'var(--error-color)' }}>{error}</p>;

  return (
    <div className="page-container">
      {/* 3. Render the modal when editingBooking is not null */}
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
              <p><strong>Status:</strong> <span className={`status-${booking.status.toLowerCase()}`}>{booking.status}</span></p>
              <div className="booking-card-header">
                <h3>{booking.service?.name || 'Service Removed'}</h3>
                <span className={`booking-status status-${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>
              </div>
              <div className="booking-card-body">
                <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                <p><strong>Vehicle:</strong> {booking.vehicleYear} {booking.vehicleMake} {booking.vehicleModel} ({booking.vehicleColor})</p>
                <p><strong>Price:</strong> ${booking.service ? booking.service.price.toFixed(2) : 'N/A'}</p>
              </div>
              <div className="booking-card-footer">
                {booking.status === 'Pending' && (
                    <>
                        {/* 4. The Edit button now opens the modal */}
                        <button onClick={() => setEditingBooking(booking)}>Edit Details</button>
                        <button onClick={() => handleCancel(booking._id)} className="delete-btn">Cancel</button>
                    </>
                )}
                {booking.status === 'Confirmed' && (
                    <button onClick={() => handleCancel(booking._id)} className="delete-btn">Cancel</button>
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
              {booking.serviceStatus && (booking.status === 'Pending' || booking.status === 'Confirmed') && (
                <p className="service-progress"><strong>Progress:</strong> {booking.serviceStatus}</p>
            )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ServiceHistoryPage;