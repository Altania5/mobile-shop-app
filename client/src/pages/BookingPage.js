import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import './BookingPage.css';
import { Link } from 'react-router-dom';
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
  const [timesLoading, setTimesLoading] = useState(false);
  const [availabilitySystem, setAvailabilitySystem] = useState(null);
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  const [loading, setLoading] = useState(!service);
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
                setTimesLoading(true); // <-- 2. Set loading to true before fetching
                try {
                    const formattedDate = format(date, 'yyyy-MM-dd');
                    const response = await axios.get(`/api/services/${serviceId}/availability?date=${formattedDate}`);
                    
                    // Handle both old and new response formats
                    if (Array.isArray(response.data)) {
                        // Old format - just an array of times
                        setAvailableTimes(response.data);
                        setAvailabilitySystem('legacy');
                        setAvailabilityMessage('');
                    } else {
                        // New format - object with times, system, and message
                        setAvailableTimes(response.data.times || []);
                        setAvailabilitySystem(response.data.system);
                        setAvailabilityMessage(response.data.message || '');
                    }
                    
                    setSelectedTime('');
                } catch (err) {
                    setError('Could not fetch available times.');
                    setAvailabilityMessage('');
                } finally {
                    setTimesLoading(false); // <-- 3. Set loading to false after fetching
                }
            };
            fetchAvailability();
        }
    }, [service, date, serviceId]);

const handleProceedToBooking = () => {
    navigate(`/book/${serviceId}/details`, {
        state: { 
            service, 
            date: format(date, 'yyyy-MM-dd'),
            time: selectedTime 
        }
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

  if (!user) {
    return (
        <div className="booking-container">
            <div className="notice-card">
                <h2>Please Log In</h2>
                <p>You must be logged in to book a service.</p>
                <Link to="/login" className="btn-primary">Login</Link>
            </div>
        </div>
    );
  }

  if (!user.hasCardOnFile) {
    return (
        <div className="booking-container">
            <div className="notice-card">
                <h2>Payment Method Required</h2>
                <p>To ensure a seamless booking process, we require a card on file before you can schedule a service.</p>
                <p>Your card will not be charged until the service is complete.</p>
                <Link to="/account-settings" className="btn-primary">Go to Account Settings</Link>
            </div>
        </div>
    );
  }

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
          {availabilitySystem && (
            <div className={`system-indicator ${availabilitySystem}`}>
              <span className="system-badge">
                {availabilitySystem === 'timeslot' ? '📅 TimeSlot System' : '📝 Legacy System'}
              </span>
            </div>
          )}
          <div className="time-slots-container">
            {timesLoading ? (
                    <p>Loading times...</p>
                ) : availableTimes.length > 0 ? (
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
              <div className="no-times-message">
                <p>No available time slots for this date.</p>
                {availabilityMessage && <p className="availability-message">{availabilityMessage}</p>}
              </div>
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