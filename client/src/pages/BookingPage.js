import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';

function BookingPage({ user }) {
  const { serviceId } = useParams(); // Get serviceId from the URL
  const location = useLocation();

  // We now have two states: one for the service object and one for the selected date
  const [service, setService] = useState(location.state?.service || null);
  const [date, setDate] = useState(new Date());

  const [loading, setLoading] = useState(!service); // Be in a loading state if we don't have the service data yet
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // If the service data wasn't passed with the Link, fetch it
    if (!service) {
      const fetchService = async () => {
        try {
          const response = await axios.get(`/api/services/${serviceId}`);
          setService(response.data);
        } catch (err) {
          setError('Could not load service details. It may no longer exist.');
        } finally {
          setLoading(false);
        }
      };
      fetchService();
    }
  }, [serviceId, service]); // Dependency array ensures this runs if the ID changes

  const handleBooking = async () => {
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      const bookingData = {
        serviceId: service._id,
        date: date,
      };
      await axios.post('/api/bookings', bookingData, { headers });
      setMessage('Booking successful! We will contact you to confirm the time.');
    } catch (err) {
      setMessage('Booking failed. Please try again.');
    }
  };

  if (loading) return <p>Loading service details...</p>;
  if (error) return <p style={{ color: 'var(--error-color)' }}>{error}</p>;
  if (!service) return <p>Service not found.</p>;

  return (
    <div className="booking-container">
      <h2>Book Appointment for: {service.name}</h2>
      <div className="booking-layout">
        <div className="calendar-container">
          <h3>Select a Date</h3>
          <Calendar
            onChange={setDate}
            value={date}
            minDate={new Date()}
          />
        </div>
        <div className="booking-details">
          <h3>Appointment Details</h3>
          <p><strong>Service:</strong> {service.name}</p>
          <p><strong>Description:</strong> {service.description}</p>
          <p><strong>Price:</strong> ${service.price.toFixed(2)}</p>
          <hr/>
          <p><strong>Selected Date:</strong> {date.toLocaleDateString()}</p>
          <button onClick={handleBooking} disabled={!!message}>
            {message ? 'Booked!' : 'Confirm Booking'}
          </button>
          {message && <p className="booking-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default BookingPage;