import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ServiceManager.css';

function ServiceManager() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', duration: '', availableDays: [], availableTimes: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [timeSlotStats, setTimeSlotStats] = useState({});
  const token = localStorage.getItem('token');

  const fetchServices = async () => {
    try {
        const response = await axios.get('/api/services');
        setServices(response.data);
        
        // Fetch time slot statistics for each service
        await fetchTimeSlotStats(response.data);
    } catch (err) {
        setError('Could not fetch services.');
    }
  };
  
  const fetchTimeSlotStats = async (servicesList) => {
    try {
      const headers = { 'x-auth-token': token };
      const stats = {};
      
      for (const service of servicesList) {
        try {
          const response = await axios.get(`/api/timeslots/stats?serviceId=${service._id}`, { headers });
          stats[service._id] = response.data;
        } catch (err) {
          console.warn(`Could not fetch time slot stats for service ${service._id}:`, err);
          stats[service._id] = { total: 0, available: 0, booked: 0 };
        }
      }
      
      setTimeSlotStats(stats);
    } catch (err) {
      console.error('Error fetching time slot statistics:', err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleDayChange = (day) => {
    const currentDays = formData.availableDays;
    if (currentDays.includes(day)) {
      setFormData({ ...formData, availableDays: currentDays.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, availableDays: [...currentDays, day] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const headers = { 'x-auth-token': token };
    const timesArray = formData.availableTimes.split(',').map(t => t.trim()).filter(Boolean);
    const dataToSubmit = { ...formData, availableTimes: timesArray };

    try {
      if (editingId) {
        await axios.put(`/api/services/${editingId}`, dataToSubmit, { headers });
      } else {
        await axios.post('/api/services', dataToSubmit, { headers });
      }
      resetForm();
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to save service.');
    }
  };

  const handleEdit = (service) => {
    setError('');
    setEditingId(service._id);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      availableDays: service.availableDays || [],
      availableTimes: service.availableTimes?.join(', ') || ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        setError('');
        const headers = { 'x-auth-token': token };
        await axios.delete(`/api/services/${id}`, { headers });
        fetchServices();
      } catch (err) {
        setError(err.response?.data?.msg || 'Could not delete service.');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', duration: '', availableDays: [], availableTimes: '' });
  };
  
  const createTimeSlotsFromService = async (service) => {
    if (!service.availableTimes || service.availableTimes.length === 0) {
      setError('No available times set for this service. Please add available times first.');
      return;
    }
    
    if (!service.availableDays || service.availableDays.length === 0) {
      setError('No available days set for this service. Please add available days first.');
      return;
    }
    
    try {
      const headers = { 'x-auth-token': token };
      
      // Create bulk time slots for the next 30 days
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      const bulkData = {
        serviceId: service._id,
        availableTimes: service.availableTimes,
        availableDays: service.availableDays,
        startDate: new Date().toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        notes: `Auto-created from service ${service.name}`
      };
      
      await axios.post('/api/timeslots/bulk-create', bulkData, { headers });
      
      // Refresh stats
      await fetchTimeSlotStats(services);
      
      setError(''); // Clear any previous errors
      alert(`Time slots created successfully for ${service.name}!`);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create time slots.');
    }
  };

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="service-manager-container">
      <h3>Manage Services</h3>
      {error && <p className="error-message">{error}</p>}
      
      {/* --- NEW 2-COLUMN LAYOUT --- */}
      <div className="manager-layout">
        <div className="manager-form-section">
          <form onSubmit={handleSubmit} className="manager-form">
            <h4>{editingId ? 'Edit Service' : 'Add New Service'}</h4>
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Service Name" required />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
            <div className="form-grid-half">
              <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price ($)" required />
              <input name="duration" type="number" value={formData.duration} onChange={handleChange} placeholder="Duration (min)" required />
            </div>
            <div>
              <label>Available Days:</label>
              <div className="checkbox-group">
                {daysOfWeek.map(day => (
                    <label key={day}><input type="checkbox" checked={formData.availableDays.includes(day)} onChange={() => handleDayChange(day)} /> {day}</label>
                ))}
              </div>
            </div>
            <input name="availableTimes" value={formData.availableTimes} onChange={handleChange} placeholder="Available Times (e.g., 09:00, 11:00, 14:00)" />
            <div className="form-actions">
              <button type="submit">{editingId ? 'Update Service' : 'Add Service'}</button>
              {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        </div>

        <div className="manager-list-section">
          <h4>Existing Services</h4>
          <div className="timeslot-notice">
            <p><strong>📅 New Time Slot System Active:</strong> For better booking management, use the TimeSlot Manager to create specific time slots. The old availability system below is for backup only.</p>
          </div>
          <div className="manager-list">
            {services.map(service => {
              const stats = timeSlotStats[service._id] || { total: 0, available: 0, booked: 0 };
              const hasTimeSlots = stats.total > 0;
              
              return (
                <div key={service._id} className="list-item service-admin-item enhanced">
                  <div className="service-info">
                    <span className="service-title">{service.name} - ${service.price}</span>
                    <div className="service-scheduling-info">
                      {hasTimeSlots ? (
                        <div className="timeslot-stats">
                          <span className="stat-badge active">⏰ TimeSlots Active</span>
                          <span className="stat-detail">{stats.available} available | {stats.booked} booked | {stats.total} total</span>
                        </div>
                      ) : (
                        <div className="legacy-availability">
                          <span className="stat-badge legacy">📝 Legacy Times</span>
                          <span className="stat-detail">
                            {service.availableTimes?.length || 0} times set | 
                            {service.availableDays?.length || 0} days set
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="item-actions">
                    {!hasTimeSlots && service.availableTimes?.length > 0 && (
                      <button 
                        onClick={() => createTimeSlotsFromService(service)} 
                        className="create-slots-btn"
                        title="Create time slots from this service's availability settings"
                      >
                        Create Slots
                      </button>
                    )}
                    <button onClick={() => handleEdit(service)}>Edit</button>
                    <button onClick={() => handleDelete(service._id)} className="delete-btn">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceManager;