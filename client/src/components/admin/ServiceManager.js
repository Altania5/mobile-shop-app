import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ServiceManager() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', duration: '' });
  const [editingId, setEditingId] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const response = await axios.get('/api/services');
    setServices(response.data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const headers = { 'x-auth-token': token };
    
    if (editingId) {
      // Update existing service
      await axios.put(`/api/services/${editingId}`, formData, { headers });
    } else {
      // Create new service
      await axios.post('/api/services', formData, { headers });
    }
    
    resetForm();
    fetchServices();
  };

  const handleEdit = (service) => {
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
      const headers = { 'x-auth-token': token };
      await axios.delete(`/api/services/${id}`, { headers });
      fetchServices();
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