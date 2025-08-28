import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ServicesList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState('');

useEffect(() => {
  const getServices = async () => {
    try {
      const res = await axios.get("/api/services");
      
      // Log the actual data received from the API
      console.log("API Response:", res.data);

      // Check if the response data itself is an array
      if (Array.isArray(res.data)) {
        setServices(res.data);
      } 
      // Check if the response data is an object with a 'services' array
      else if (res.data && Array.isArray(res.data.services)) {
        setServices(res.data.services);
      } 
      // If the data is not in a recognized format, set services to an empty array
      else {
        console.error("Received unexpected data format:", res.data);
        setServices([]); 
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
      setServices([]); // Set to empty array on error to prevent crash
    } finally {
      setLoading(false);
    }
  };
  
  getServices();
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