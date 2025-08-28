import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ServiceManager.css';

function ServiceManager() {
    // FIX: Initialize state with an empty array
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({ name: '', description: '', price: '', duration: '' });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');

    const fetchServices = useCallback(async () => {
        try {
            const response = await axios.get('/api/services/');
            // FIX: Ensure the response is an array before setting state
            if (Array.isArray(response.data)) {
                setServices(response.data);
            } else {
                setServices([]);
            }
        } catch (err) {
            setError('Could not fetch services.');
            setServices([]); // Also set to empty on error
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const headers = { 'x-auth-token': token };
        const url = editingId ? `/api/services/update/${editingId}` : '/api/services/add';
        
        try {
            // Your backend uses POST for both creating and updating
            await axios.post(url, formData, { headers });
            setFormData({ name: '', description: '', price: '', duration: '' });
            setEditingId(null);
            fetchServices(); // Refresh the list
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to save service.');
        }
    };
    
    const handleEdit = (service) => {
        setEditingId(service._id);
        setFormData({
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration,
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
            try {
                const headers = { 'x-auth-token': token };
                await axios.delete(`/api/services/${id}`, { headers });
                fetchServices(); // Refresh the list
            } catch (err) {
                setError(err.response?.data?.msg || 'Failed to delete service.');
            }
        }
    };

    return (
        <div className="manager-container">
            <h3>Manage Services</h3>
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit} className="manager-form service-form">
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Service Name" required />
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Service Description" required />
                <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price ($)" required />
                <input name="duration" type="number" value={formData.duration} onChange={handleChange} placeholder="Duration (minutes)" required />
                <button type="submit">{editingId ? 'Update Service' : 'Add Service'}</button>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', description: '', price: '', duration: '' }); }}>Cancel Edit</button>}
            </form>

            <div className="manager-list">
                {/* FIX: Add safety check before mapping services */}
                {Array.isArray(services) && services.map(service => (
                    <div key={service._id} className="list-item service-card">
                        <div className="service-card-content">
                            <h5>{service.name}</h5>
                            <p>{service.description}</p>
                            <span>${service.price} | {service.duration} mins</span>
                        </div>
                        <div className="item-actions">
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