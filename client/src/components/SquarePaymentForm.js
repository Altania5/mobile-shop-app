import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './SquarePaymentForm.css';

// Use a global variable to ensure the form is initialized only once per page load.
let isSquareFormInitialized = false;

const SquarePaymentForm = () => {
    const [status, setStatus] = useState({ message: '', type: '' });
    const cardRef = useRef(null);

    useEffect(() => {
        const initSquare = async () => {
            // If the form is already initialized anywhere on the page, do nothing.
            if (isSquareFormInitialized) {
                return;
            }

            if (!window.Square) {
                console.error('Square SDK not loaded');
                return;
            }

            // Mark as initialized immediately.
            isSquareFormInitialized = true;

            const appId = 'sandbox-sq0idb-1q8VlfKxP7diXgxW0kPfOQ';
            const locationId = 'LC7GVN94B0H54';

            try {
                const payments = window.Square.payments(appId, locationId);
                const card = await payments.card();
                await card.attach('#card-container');
                cardRef.current = card;
            } catch (error) {
                console.error("Failed to attach Square card form:", error);
                isSquareFormInitialized = false; // Reset on failure
            }
        };

        initSquare();

        return () => {
            // When the component unmounts, reset the global flag.
            isSquareFormInitialized = false;
        };
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
                const authToken = localStorage.getItem('token');
                const response = await axios.post('/api/payments/save-card', 
                    { sourceId: token },
                    { headers: { 'Authorization': `Bearer ${authToken}` } }
                );
                setStatus({ message: response.data.msg, type: 'success' });
            } else {
                setStatus({ message: `Tokenization failed: ${result.errors[0].message}`, type: 'error' });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.msg || 'An error occurred while saving your card.';
            setStatus({ message: errorMessage, type: 'error' });
        }
    };

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