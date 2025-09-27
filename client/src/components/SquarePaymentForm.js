import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './SquarePaymentForm.css';

// Use a module-level flag to avoid duplicating the form on re-renders/navigation.
let isSquareFormInitialized = false;

const SquarePaymentForm = () => {
    const [status, setStatus] = useState({ message: '', type: '' });
    const [squareConfig, setSquareConfig] = useState(null);
    const cardRef = useRef(null);
    const paymentsRef = useRef(null);

    useEffect(() => {
        const loadSquareConfig = async () => {
            try {
                const response = await axios.get('/api/payments/config');

                setSquareConfig(response.data);
            } catch (error) {
                const message = error.response?.data?.msg || 'Unable to load payment configuration. Please try again later.';
                setStatus({ message, type: 'error' });
            }
        };

        loadSquareConfig();
    }, []);

    useEffect(() => {
        const initSquare = async () => {
            if (!squareConfig) {
                return;
            }

            if (isSquareFormInitialized) {
                return;
            }

            if (!window.Square) {
                console.error('Square SDK not loaded');
                return;
            }

            isSquareFormInitialized = true;

            try {
                const { appId, locationId } = squareConfig;
                paymentsRef.current = window.Square.payments(appId, locationId);
                const card = await paymentsRef.current.card();
                await card.attach('#card-container');
                cardRef.current = card;
            } catch (error) {
                console.error('Failed to attach Square card form:', error);
                isSquareFormInitialized = false; // Reset so we can try again
                setStatus({ message: 'We could not initialize the payment form. Please refresh and try again.', type: 'error' });
            }
        };

        initSquare();

        return () => {
            isSquareFormInitialized = false;
            cardRef.current = null;
            paymentsRef.current = null;
        };
    }, [squareConfig]);

    const handlePayment = async (event) => {
        event.preventDefault();
        setStatus({ message: 'Processing...', type: 'info' });

        if (!cardRef.current || !paymentsRef.current) {
            setStatus({ message: 'Payment fields not ready. Please wait.', type: 'error' });
            return;
        }

        try {
            const result = await cardRef.current.tokenize();
            if (result.status === 'OK') {
                const token = result.token;
                const authToken = localStorage.getItem('token');
                const response = await axios.post(
                    '/api/payments/save-card',
                    { sourceId: token },
                    { headers: { 'Authorization': `Bearer ${authToken}` } }
                );
                setStatus({ message: response.data.msg, type: 'success' });
            } else {
                const [firstError] = result.errors || [];
                const message = firstError?.message || 'Tokenization failed. Please check your card details.';
                setStatus({ message, type: 'error' });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.msg || 'An error occurred while saving your card.';
            setStatus({ message: errorMessage, type: 'error' });
        }
    };

    if (!squareConfig) {
        return (
            <div className="payment-form-container">
                <h3>Add a Payment Method</h3>
                <p>Loading payment settings...</p>
                {status.message && (
                    <div className={`status-message ${status.type}`}>
                        {status.message}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="payment-form-container">
            <h3>Add a Payment Method</h3>
            <p>Your card will be saved securely for future charges.</p>

            <div className="card-input-section">
                <div id="card-container"></div>
            </div>

            <form id="payment-form" onSubmit={handlePayment}>
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