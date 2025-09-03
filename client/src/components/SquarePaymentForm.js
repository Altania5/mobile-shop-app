import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './SquarePaymentForm.css';

const SquarePaymentForm = () => {
    const [status, setStatus] = useState({ message: '', type: '' });
    const cardRef = useRef(null);

    useEffect(() => {
        const initSquare = async () => {
            if (!window.Square) {
                console.error('Square SDK not loaded');
                return;
            }
            const appId = 'YOUR_SQUARE_APPLICATION_ID'; 
            const locationId = 'YOUR_SQUARE_LOCATION_ID';
            
            const payments = window.Square.payments(appId, locationId);
            
            const card = await payments.card();
            await card.attach('#card-container');
            cardRef.current = card;
        };

        initSquare();
    }, []);

    const handlePayment = async (event) => {
        event.preventDefault();
        setStatus({ message: 'Processing...', type: 'info' });

        if (!cardRef.current) {
            setStatus({ message: 'Payment fields not ready. Please wait.', type: 'error' });
            return;
        }

        try {
            const result = await cardRef.current.tokenize();
            if (result.status === 'OK') {
                const token = result.token;
                // Send the token to your backend
                const response = await axios.post('/api/payments/save-card', { sourceId: token });
                setStatus({ message: response.data.msg, type: 'success' });
            } else {
                setStatus({ message: `Tokenization failed: ${result.errors[0].message}`, type: 'error' });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.msg || 'An error occurred while saving your card.';
            setStatus({ message: errorMessage, type: 'error' });
        }
    };
    
    // IMPORTANT: You must replace 'YOUR_SQUARE_APPLICATION_ID' and 'YOUR_SQUARE_LOCATION_ID'
    // in the useEffect hook above with the actual values from your Square Developer Dashboard.
    // For better security, these should ideally be loaded from a configuration endpoint
    // rather than being hardcoded.

    return (
        <div className="payment-form-container">
            <h3>Add a Payment Method</h3>
            <p>Your card will be saved securely for future charges.</p>
            <form id="payment-form" onSubmit={handlePayment}>
                <div id="card-container"></div>
                <button id="card-button" type="submit">
                    Save Card
                </button>
            </form>
            {status.message && (
                <div className={`status-message ${status.type}`}>
                    {status.message}
                </div>
            )}
        </div>
    );
};

export default SquarePaymentForm;