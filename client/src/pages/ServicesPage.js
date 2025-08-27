// client/src/pages/ServicesPage.js

import React from 'react';
import ServicesList from '../components/ServicesList';

const ServicesPage = () => {
    return (
        <div className="page-container">
            <section className="page-header">
                <h1>Your Trusted Mobile Mechanics</h1>
                <p>Professional vehicle maintenance and repair, delivered to your door. Choose from our wide range of professional mobile mechanic services.</p>
            </section>
            <ServicesList />
        </div>
    );
};

export default ServicesPage;