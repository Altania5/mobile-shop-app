import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function BookingFormPage({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { service, date, time } = location.state || {};
  
  const [formData, setFormData] = useState({
    clientFirstName: user?.firstName || '',
    clientLastName: user?.lastName || '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    notes: ''
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!service || !date || !time) {
      // If data is missing (e.g., page refresh), redirect back
      navigate('/');
    }
  }, [service, date, time, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      const bookingData = {
        ...formData,
        serviceId: service._id,
        date,
        time,
      };
      await axios.post('/api/bookings', bookingData, { headers });
      setSuccess('Your appointment has been successfully booked! You can view it in your Service History.');
    } catch (err) {
      setError(err.response?.data?.msg || 'There was an error creating your booking.');
    }
  };
  
  const isFormValid = () => {
      return Object.values(formData).every(val => val !== '') && agreed;
  }

  if (!service) return null; // Render nothing while redirecting

  return (
    <div className="page-container">
      <h2>Confirm Your Booking</h2>
      <p>You are booking <strong>{service.name}</strong> for <strong>{new Date(date).toLocaleDateString()}</strong> at <strong>{time}</strong>.</p>
      
      <form onSubmit={handleSubmit} className="booking-form">
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="form-grid">
            <input name="clientFirstName" value={formData.clientFirstName} onChange={handleChange} placeholder="First Name" required />
            <input name="clientLastName" value={formData.clientLastName} onChange={handleChange} placeholder="Last Name" required />
            <input name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} placeholder="Car Make (e.g., Toyota)" required />
            <input name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="Car Model (e.g., Camry)" required />
            <input name="vehicleYear" type="number" value={formData.vehicleYear} onChange={handleChange} placeholder="Car Year (e.g., 2022)" required />
            <input name="vehicleColor" value={formData.vehicleColor} onChange={handleChange} placeholder="Car Color" required />
        </div>
        <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional Notes (optional)" />

        <div className="terms-container">
            <input type="checkbox" id="terms" checked={agreed} onChange={() => setAgreed(!agreed)} />
            <label htmlFor="terms">
                I agree to the <Link to="/terms" target="_blank">Terms and Conditions</Link>.
            </label>
        </div>

        <button type="submit" disabled={!isFormValid() || !!success}>
            {success ? 'Booked!' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
}

export default BookingFormPage;