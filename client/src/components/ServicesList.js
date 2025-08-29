import React from 'react';
import { Link } from 'react-router-dom';

const ServicesList = ({ services }) => {
  if (!Array.isArray(services)) {
    return <p>Loading services...</p>;
  }

  return (
    <div className="services-container">
      {services.length === 0 ? (
        <p>No services match your criteria.</p>
      ) : (
        <div className="services-grid">
          {services.map(service => (
            <div key={service._id} className="service-card">
              <h3>{service.name}</h3>
              <p className="service-description">{service.description}</p>
              <div className="service-footer">
                <span className="service-price">${service.price}</span>
                <span className="service-duration">{service.duration} min</span>
              </div>
              <Link to={`/book/${service._id}`} state={{ service: service }} className="book-button-link">
                  <button className="book-button">Book Now</button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesList;