import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomBookingForm.css';

function CustomBookingForm({ onSave, onCancel }) {
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({
        serviceId: '',
        customServiceName: '',
        customServicePrice: '',
        date: '',
        time: '',
        duration: 60,
        notes: '',
        clientFirstName: '',
        clientLastName: '',
        vehicleMake: '',
        vehicleModel: '',
        vehicleYear: '',
        vehicleColor: '',
        isCustomService: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get('/api/services');
            setServices(response.data);
        } catch (err) {
            console.error('Error fetching services:', err);
            setError('Failed to load services');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const bookingData = {
                ...formData,
                createdByAdmin: true,
                requiresCustomerVerification: true,
                status: 'Pending Verification'
            };

            const headers = { 'x-auth-token': token };
            const response = await axios.post('/api/bookings/admin-create', bookingData, { headers });
            
            alert('Custom booking created successfully! Redirecting to customer assignment...');
            onSave(response.data);
        } catch (err) {
            console.error('Error creating custom booking:', err);
            setError(err.response?.data?.msg || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    const generateTimeOptions = () => {
        const times = [];
        for (let hour = 9; hour <= 17; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                times.push(timeString);
            }
        }
        return times;
    };

    const currentYear = new Date().getFullYear();

    return (
        <div className="custom-booking-form">
            <div className="form-header">
                <h3>Create Custom Booking</h3>
                <p>Create a professional service booking for a customer</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <h4>Service Details</h4>
                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                name="isCustomService"
                                checked={formData.isCustomService}
                                onChange={handleChange}
                            />
                            Custom Service (not from existing services list)
                        </label>
                    </div>

                    {!formData.isCustomService ? (
                        <div className="form-group">
                            <label>Select Service:</label>
                            <select
                                name="serviceId"
                                value={formData.serviceId}
                                onChange={handleChange}
                                required={!formData.isCustomService}
                            >
                                <option value="">Choose a service...</option>
                                {services.map(service => (
                                    <option key={service._id} value={service._id}>
                                        {service.name} - ${service.price}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <>
                            <div className="form-group">
                                <label>Custom Service Name:</label>
                                <input
                                    type="text"
                                    name="customServiceName"
                                    value={formData.customServiceName}
                                    onChange={handleChange}
                                    placeholder="e.g., Special Diagnostic Service"
                                    required={formData.isCustomService}
                                />
                            </div>
                            <div className="form-group">
                                <label>Custom Service Price ($):</label>
                                <input
                                    type="number"
                                    name="customServicePrice"
                                    value={formData.customServicePrice}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    required={formData.isCustomService}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="form-section">
                    <h4>Scheduling</h4>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Date:</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Time:</label>
                            <select
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select time...</option>
                                {generateTimeOptions().map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Duration (minutes):</label>
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                min="15"
                                step="15"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h4>Client Information</h4>
                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name:</label>
                            <input
                                type="text"
                                name="clientFirstName"
                                value={formData.clientFirstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name:</label>
                            <input
                                type="text"
                                name="clientLastName"
                                value={formData.clientLastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h4>Vehicle Information</h4>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Make:</label>
                            <input
                                type="text"
                                name="vehicleMake"
                                value={formData.vehicleMake}
                                onChange={handleChange}
                                placeholder="e.g., Toyota"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Model:</label>
                            <input
                                type="text"
                                name="vehicleModel"
                                value={formData.vehicleModel}
                                onChange={handleChange}
                                placeholder="e.g., Camry"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Year:</label>
                            <input
                                type="number"
                                name="vehicleYear"
                                value={formData.vehicleYear}
                                onChange={handleChange}
                                min="1900"
                                max={currentYear + 1}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Color:</label>
                            <input
                                type="text"
                                name="vehicleColor"
                                value={formData.vehicleColor}
                                onChange={handleChange}
                                placeholder="e.g., Silver"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h4>Additional Notes</h4>
                    <div className="form-group">
                        <label>Notes:</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Any special instructions or details about the service..."
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={onCancel} className="btn-cancel">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Creating...' : 'Create Booking & Assign Customer'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CustomBookingForm;
