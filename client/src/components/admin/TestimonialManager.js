import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function TestimonialManager() {
    // FIX: Initialize state with an empty array to prevent crashes
    const [testimonials, setTestimonials] = useState([]);
    const [formData, setFormData] = useState({ name: '', message: '', isFeatured: false });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');

    const fetchTestimonials = useCallback(async () => {
        try {
            const response = await axios.get('/api/testimonials/');
            // FIX: Ensure the response is an array before setting state
            if (Array.isArray(response.data)) {
                setTestimonials(response.data);
            } else {
                setTestimonials([]);
            }
        } catch (err) {
            setError('Could not fetch testimonials.');
            setTestimonials([]); // Also set to empty on error
        }
    }, []);

    useEffect(() => {
        fetchTestimonials();
    }, [fetchTestimonials]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const headers = { 'x-auth-token': token };
        const url = editingId ? `/api/testimonials/update/${editingId}` : '/api/testimonials/add';
        const method = editingId ? 'post' : 'post'; // Both are post in your backend

        try {
            await axios[method](url, formData, { headers });
            setFormData({ name: '', message: '', isFeatured: false });
            setEditingId(null);
            fetchTestimonials(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to save testimonial.');
        }
    };
    
    const handleEdit = (testimonial) => {
        setEditingId(testimonial._id);
        setFormData({ name: testimonial.name, message: testimonial.message, isFeatured: testimonial.isFeatured });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this testimonial?')) {
            try {
                const headers = { 'x-auth-token': token };
                await axios.delete(`/api/testimonials/${id}`, { headers });
                fetchTestimonials(); // Refresh list
            } catch (err) {
                setError(err.response?.data?.msg || 'Failed to delete testimonial.');
            }
        }
    };

    const handleFeature = async (id, isFeatured) => {
        try {
            const headers = { 'x-auth-token': token };
            await axios.patch(`/api/testimonials/${id}/feature`, { isFeatured: !isFeatured }, { headers });
            fetchTestimonials(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to update feature status.');
        }
    };

    return (
        <div className="manager-container">
            <h3>Manage Testimonials</h3>
            {error && <p className="error-message">{error}</p>}
            
            <form onSubmit={handleSubmit} className="manager-form">
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Client Name" required />
                <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Testimonial Message" required />
                <label>
                    <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
                    Feature this testimonial?
                </label>
                <button type="submit">{editingId ? 'Update Testimonial' : 'Add Testimonial'}</button>
                {editingId && <button onClick={() => { setEditingId(null); setFormData({ name: '', message: '', isFeatured: false }); }}>Cancel Edit</button>}
            </form>

            <div className="manager-list">
                {/* FIX: Add safety check before mapping testimonials */}
                {Array.isArray(testimonials) && testimonials.map(t => (
                    <div key={t._id} className="list-item">
                        <p><strong>{t.name}</strong>: "{t.message}"</p>
                        <div className="item-actions">
                            <button onClick={() => handleFeature(t._id, t.isFeatured)}>
                                {t.isFeatured ? 'Unfeature' : 'Feature'}
                            </button>
                            <button onClick={() => handleEdit(t)}>Edit</button>
                            <button onClick={() => handleDelete(t._id)} className="delete-btn">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TestimonialManager;