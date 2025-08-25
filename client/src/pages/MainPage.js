import React from 'react';
import ServicesList from '../components/ServicesList';

function MainPage() {
  return (
    <div>
      <div className="hero-section">
        <h1>Your Trusted Mobile Mechanics</h1>
        <p>Professional vehicle maintenance and repair, delivered to your door.</p>
      </div>
      <ServicesList />
    </div>
  );
}

export default MainPage;