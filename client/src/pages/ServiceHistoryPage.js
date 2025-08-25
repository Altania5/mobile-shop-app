import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ServiceHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };
        const response = await axios.get('/api/bookings/mybookings', { headers });
        setBookings(response.data);
      } catch (err) {
        setError('Could not fetch your booking history.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <p>Loading your service history...</p>;
  if (error) return <p style={{ color: 'var(--error-color)' }}>{error}</p>;

  return (
    <div className="page-container">
      <h2>My Service History</h2>
      {bookings.length === 0 ? (
        <p>You have no past or upcoming appointments.</p>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <div className="booking-card-header">
                <h3>{booking.service ? booking.service.name : 'Service Removed'}</h3>
                <span className={`booking-status status-${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>
              </div>
              <div className="booking-card-body">
                <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>Price:</strong> ${booking.service ? booking.service.price.toFixed(2) : 'N/A'}</p>
                {booking.notes && <p><strong>Notes:</strong> {booking.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ServiceHistoryPage;