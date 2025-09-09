import React from 'react';
import { Link } from 'react-router-dom';

const ServicesList = ({ services, user, timeSlotSystemStats }) => {
  if (!Array.isArray(services)) {
    return <p>Loading services...</p>;
  }

  return (
    <div className="services-container">
      {user && user.role === 'admin' && timeSlotSystemStats && (
        <div className="admin-timeslot-overview">
          <div className="overview-header">
            <h4>📅 TimeSlot System Overview</h4>
            <Link to="/admin" className="manage-link">
              Manage TimeSlots →
            </Link>
          </div>
          <div className="overview-stats">
            <div className="stat-item">
              <span className="stat-number">{timeSlotSystemStats.totalSlots || 0}</span>
              <span className="stat-label">Total Slots</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{timeSlotSystemStats.availableSlots || 0}</span>
              <span className="stat-label">Available</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{timeSlotSystemStats.bookedSlots || 0}</span>
              <span className="stat-label">Booked</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{timeSlotSystemStats.servicesWithSlots || 0}</span>
              <span className="stat-label">Services Active</span>
            </div>
          </div>
        </div>
      )}
      
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