import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CustomBookingVerificationPage.css';

function CustomBookingVerificationPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        fetchBooking();
    }, [token]);

    const fetchBooking = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/bookings/verify-custom-booking/${token}`);
            setBooking(response.data);
        } catch (err) {
            console.error('Error fetching booking:', err);
            setError(err.response?.data?.msg || 'Failed to load booking details');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        try {
            setSubmitting(true);
            await axios.post(`/api/bookings/verify-custom-booking/${token}`, {
                confirmed: true,
                customerName: `${booking.customer?.firstName} ${booking.customer?.lastName}`,
                customerEmail: booking.customer?.email
            });
            
            setVerified(true);
            setTimeout(() => {
                navigate('/');
            }, 5000);
        } catch (err) {
            console.error('Error confirming booking:', err);
            setError(err.response?.data?.msg || 'Failed to confirm booking');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeclineBooking = async () => {
        if (!window.confirm('Are you sure you want to decline this booking? This action cannot be undone.')) {
            return;
        }

        try {
            setSubmitting(true);
            await axios.post(`/api/bookings/verify-custom-booking/${token}`, {
                confirmed: false
            });
            
            alert('Booking declined successfully.');
            navigate('/');
        } catch (err) {
            console.error('Error declining booking:', err);
            setError(err.response?.data?.msg || 'Failed to decline booking');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getServiceName = () => {
        if (booking?.isCustomService) {
            return booking.customServiceName;
        }
        return booking?.service?.name || 'Professional Service';
    };

    const getServicePrice = () => {
        if (booking?.isCustomService) {
            return booking.customServicePrice ? `$${booking.customServicePrice}` : 'TBD';
        }
        return booking?.service?.price ? `$${booking.service.price}` : 'TBD';
    };

    if (loading) {
        return (
            <div className="verification-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading booking details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="verification-page">
                <div className="error-container">
                    <div className="error-icon">❌</div>
                    <h2>Unable to Load Booking</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/')} className="btn-primary">
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    if (verified) {
        return (
            <div className="verification-page">
                <div className="success-container">
                    <div className="success-icon">✅</div>
                    <h2>Booking Confirmed!</h2>
                    <p>Thank you for confirming your service appointment. You will receive a confirmation email shortly.</p>
                    <div className="success-details">
                        <h3>Your Booking Details:</h3>
                        <p><strong>Service:</strong> {getServiceName()}</p>
                        <p><strong>Date:</strong> {formatDate(booking?.date)}</p>
                        <p><strong>Time:</strong> {booking?.time}</p>
                    </div>
                    <p className="redirect-message">Redirecting to home page in a few seconds...</p>
                    <button onClick={() => navigate('/')} className="btn-primary">
                        Return to Home Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="verification-page">
            <div className="verification-container">
                <div className="verification-header">
                    <div className="header-icon">📋</div>
                    <h1>Service Booking Confirmation</h1>
                    <p>Please review and confirm your professional service appointment</p>
                </div>

                <div className="customer-info">
                    <h3>Hello {booking?.customer?.firstName} {booking?.customer?.lastName}!</h3>
                    <p>Our team has created the following service booking for you.</p>
                </div>

                <div className="booking-details-card">
                    <h3>📝 Booking Details</h3>
                    <div className="details-grid">
                        <div className="detail-item">
                            <span className="detail-label">Service:</span>
                            <span className="detail-value">{getServiceName()}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Date:</span>
                            <span className="detail-value">{formatDate(booking?.date)}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Time:</span>
                            <span className="detail-value">{booking?.time}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Duration:</span>
                            <span className="detail-value">{booking?.duration || 60} minutes</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Vehicle:</span>
                            <span className="detail-value">
                                {booking?.vehicleYear} {booking?.vehicleMake} {booking?.vehicleModel}
                                {booking?.vehicleColor && ` (${booking.vehicleColor})`}
                            </span>
                        </div>
                        {booking?.isCustomService && (
                            <div className="detail-item">
                                <span className="detail-label">Price:</span>
                                <span className="detail-value">{getServicePrice()}</span>
                            </div>
                        )}
                        {booking?.notes && (
                            <div className="detail-item full-width">
                                <span className="detail-label">Notes:</span>
                                <span className="detail-value">{booking.notes}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="important-notice">
                    <div className="notice-icon">⚠️</div>
                    <div className="notice-content">
                        <h4>Action Required</h4>
                        <p>Please confirm or decline this booking. If you have any questions, please contact us before making your decision.</p>
                    </div>
                </div>

                <div className="verification-actions">
                    <button 
                        onClick={handleDeclineBooking}
                        disabled={submitting}
                        className="btn-decline"
                    >
                        {submitting ? 'Processing...' : 'Decline Booking'}
                    </button>
                    <button 
                        onClick={handleConfirmBooking}
                        disabled={submitting}
                        className="btn-confirm"
                    >
                        {submitting ? 'Confirming...' : 'Confirm Booking'}
                    </button>
                </div>

                <div className="contact-info">
                    <p><strong>Questions?</strong> Contact us at support@mobiletech.com or (555) 123-4567</p>
                </div>
            </div>
        </div>
    );
}

export default CustomBookingVerificationPage;
