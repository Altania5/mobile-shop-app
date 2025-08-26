import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { format } from 'date-fns';

function BookingPage({ user }) {
  const { serviceId } = useParams(); // Get serviceId from the URL
  const navigate = useNavigate();

  // We now have two states: one for the service object and one for the selected date
  const [service, setService] = useState(null);
  const [date, setDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);

  const [loading, setLoading] = useState(!service); // Be in a loading state if we don't have the service data yet
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`/api/services/${serviceId}`);
        setService(response.data);
      } catch (err) {
        setError('Could not load service details.');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId]);

    useEffect(() => {
    if (service && date) {
      const fetchAvailability = async () => {
        try {
          const formattedDate = format(date, 'yyyy-MM-dd');
          const response = await axios.get(`/api/services/${serviceId}/availability?date=${formattedDate}`);
          setAvailableTimes(response.data);
          setSelectedTime(''); // Reset selected time when date changes
        } catch (err) {
          setError('Could not fetch available times.');
        }
      };
      fetchAvailability();
    }
  }, [service, date, serviceId]);

  const handleProceedToBooking = () => {
      navigate(`/book/${serviceId}/details`, {
          state: { service, date: date.toISOString(), time: selectedTime }
      });
  };

    const tileDisabled = ({ date, view }) => {
    if (view === 'month' && service?.availableDays.length > 0) {
      const dayName = format(date, 'EEEE'); // e.g., "Monday"
      return !service.availableDays.includes(dayName);
    }
    return false;
  };

 if (loading) return <div className="page-container"><p>Loading service details...</p></div>;
  if (error) return <div className="page-container"><p className="error-message">{error}</p></div>;
  if (!service) return <div className="page-container"><p>Service not found.</p></div>;

  return (
    <div className="booking-container">
      <h2>Book: {service.name}</h2>
      <div className="booking-layout">
        <div className="calendar-container">
          <h3>1. Select a Date</h3>
          <Calendar
            onChange={setDate}
            value={date}
            minDate={new Date()}
            tileDisabled={tileDisabled}
          />
        </div>
        <div className="booking-details">
          <h3>2. Select a Time</h3>
          <div className="time-slots-container">
            {availableTimes.length > 0 ? (
              availableTimes.map(time => (
                <button 
                  key={time} 
                  className={`time-slot-btn ${selectedTime === time ? 'selected' : ''}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))
            ) : (
              <p>No available time slots for this date.</p>
            )}
          </div>
          <button 
            onClick={handleProceedToBooking} 
            disabled={!selectedTime}
            className="proceed-btn"
          >
            Proceed to Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;