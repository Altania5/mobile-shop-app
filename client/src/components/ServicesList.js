import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ServicesList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('/api/services');
        setServices(response.data);
      } catch (err) {
        setError('Could not fetch services. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) return <p>Loading services...</p>;
  if (error) return <p style={{ color: 'var(--error-color)' }}>{error}</p>;

  return (
    <div className="services-container">
      <h2>Our Services</h2>
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
    </div>
  );
}

export default ServicesList;