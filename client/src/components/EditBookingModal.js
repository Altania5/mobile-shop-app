import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EditBookingModal({ booking, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    notes: ''
  });
  const [error, setError] = useState('');

  // When the modal opens, pre-fill the form with the booking's current data
  useEffect(() => {
    if (booking) {
      setFormData({
        vehicleMake: booking.vehicleMake || '',
        vehicleModel: booking.vehicleModel || '',
        vehicleYear: booking.vehicleYear || '',
        vehicleColor: booking.vehicleColor || '',
        notes: booking.notes || ''
      });
    }
  }, [booking]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      await axios.put(`/api/bookings/${booking._id}`, formData, { headers });
      onUpdate(); // This will refresh the service history list
      onClose();   // This will close the modal
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update booking.');
    }
  };

  if (!booking) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Appointment Details</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <input name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} placeholder="Car Make" required />
          <input name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="Car Model" required />
          <input name="vehicleYear" type="number" value={formData.vehicleYear} onChange={handleChange} placeholder="Car Year" required />
          <input name="vehicleColor" value={formData.vehicleColor} onChange={handleChange} placeholder="Car Color" required />
          <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional Notes" />
          <div className="form-actions">
            <button type="submit">Save Changes</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBookingModal;