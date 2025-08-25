import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Default styling for the calendar
import axios from 'axios';

function BookingPage({ user }) {
  useParams();
  const location = useLocation();
  const { service } = location.state || {}; // Get service details passed from the link

  const [date, setDate] = useState(new Date());
  const [message, setMessage] = useState('');
  
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
        console.error(err);
    }
  };

  if (!service) {
    return <p>Service not found. Please go back and select a service.</p>;
  }

  return (
    <div className="booking-container">
      <h2>Book Appointment for: {service.name}</h2>
      <div className="booking-layout">
        <div className="calendar-container">
          <h3>Select a Date</h3>
          <Calendar
            onChange={setDate}
            value={date}
            minDate={new Date()} // Prevent booking in the past
          />
        </div>
        <div className="booking-details">
          <h3>Appointment Details</h3>
          <p><strong>Service:</strong> {service.name}</p>
          <p><strong>Price:</strong> ${service.price}</p>
          <p><strong>Date:</strong> {date.toLocaleDateString()}</p>
          <button onClick={handleBooking}>Confirm Booking</button>
          {message && <p className="booking-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default BookingPage;