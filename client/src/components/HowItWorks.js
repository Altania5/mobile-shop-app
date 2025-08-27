// client/src/components/HowItWorks.js

import React from 'react';
import { Link } from 'react-router-dom';

const HowItWorks = () => (
    <div className="how-it-works-section">
        <h2>How It Works: Our Simple Process</h2>
        <div className="steps-container">
            <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                    <h3>Book Your Service</h3>
                    <p>Select the services you need and choose a date and time that works for you through our easy-to-use online booking system.</p>
                </div>
            </div>
            <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                    <h3>We Come To You</h3>
                    <p>Our certified mechanic arrives at your location with all the necessary tools and parts to complete the job.</p>
                </div>
            </div>
            <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                    <h3>Job Done Right</h3>
                    <p>We perform the service efficiently, provide you with a detailed report, and ensure your vehicle is running smoothly.</p>
                </div>
            </div>
        </div>
        {/* This button correctly links to the /services page */}
        <Link to="/services" className="cta-button">Book a Service Now</Link>
    </div>
);

export default HowItWorks;