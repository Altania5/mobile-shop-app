import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ServiceManager() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', duration: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(''); // State for handling errors
  const token = localStorage.getItem('token');

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services');
      setServices(response.data);
    } catch (err) {
      setError('Could not fetch services.');
    }
  };
  
  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    const headers = { 'x-auth-token': token };
    
    try {
      if (editingId) {
        // Update existing service
        await axios.put(`/api/services/${editingId}`, formData, { headers });
      } else {
        // Create new service
        await axios.post('/api/services', formData, { headers });
      }
      
      resetForm();
      fetchServices();
    } catch (err) {
      // Set an error message from the server response if it exists
      setError(err.response?.data?.msg || err.response?.data?.error || 'An error occurred. Please try again.');
    }
  };

  const handleEdit = (service) => {
    setError('');
    setEditingId(service._id);
    setFormData({ 
      name: service.name, 
      description: service.description, 
      price: service.price, 
      duration: service.duration 
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
    setFormData({ name: '', description: '', price: '', duration: '' });
  };

  return (
    <div className="manager-container">
      <h3>Manage Services</h3>
      <form onSubmit={handleSubmit} className="manager-form">
        {/* We will display the error message here */}
        {error && <p className="error-message">{error}</p>}
        
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Service Name" required />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
        <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price ($)" required />
        <input name="duration" type="number" value={formData.duration} onChange={handleChange} placeholder="Duration (min)" required />
        <div className="form-actions">
          <button type="submit">{editingId ? 'Update Service' : 'Add Service'}</button>
          {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="manager-list">
        {services.map(service => (
          <div key={service._id} className="list-item">
            <span>{service.name} - ${service.price}</span>
            <div>
              <button onClick={() => handleEdit(service)}>Edit</button>
              <button onClick={() => handleDelete(service._id)} className="delete-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServiceManager;