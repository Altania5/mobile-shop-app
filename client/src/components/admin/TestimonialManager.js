import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TestimonialManager.css'; // Make sure this CSS file exists

const TestimonialManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [services, setServices] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState({
    serviceId: '',
    quote: '',
    rating: '',
    profileImage: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [updatedAuthorName, setUpdatedAuthorName] = useState('');

  useEffect(() => {
    fetchTestimonials();
    fetchServices();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await axios.get('/api/testimonials');
      setTestimonials(res.data);
    } catch (err) {
      setError('Failed to fetch testimonials.');
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get('/api/services');
      setServices(res.data);
    } catch (err) {
      setError('Failed to fetch services.');
    }
  };

  const onChange = e => {
    setNewTestimonial({ ...newTestimonial, [e.target.name]: e.target.value });
  };

  const onFileChange = e => {
    setNewTestimonial({ ...newTestimonial, profileImage: e.target.files[0] });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('serviceId', newTestimonial.serviceId);
    formData.append('quote', newTestimonial.quote);
    formData.append('rating', newTestimonial.rating);
    if (newTestimonial.profileImage) {
      formData.append('profileImage', newTestimonial.profileImage);
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        }
      };
      const res = await axios.post('/api/testimonials', formData, config);
      setTestimonials([res.data, ...testimonials]);
      document.getElementById("testimonial-form").reset(); 
      setNewTestimonial({ serviceId: '', quote: '', rating: '', profileImage: null });
      setSuccess('Testimonial added successfully!');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to add testimonial.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.delete(`/api/testimonials/${id}`, config);
      setTestimonials(testimonials.filter(t => t._id !== id));
      setSuccess('Testimonial deleted successfully!');
    } catch (err) {
      setError('Failed to delete testimonial.');
    }
  };

    const handleEditClick = (testimonial) => {
    setEditingId(testimonial._id);
    // Pre-fill the input with the current name
    const currentName = testimonial.authorName || (testimonial.author ? `${testimonial.author.firstName} ${testimonial.author.lastName}` : 'N/A');
    setUpdatedAuthorName(currentName);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setUpdatedAuthorName('');
  };

    const handleAuthorUpdate = async (testimonialId) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const body = { authorName: updatedAuthorName };
      
      const res = await axios.put(`/api/testimonials/${testimonialId}/author`, body, config);
      
      // Update the testimonials list with the new data
      setTestimonials(testimonials.map(t => t._id === testimonialId ? { ...res.data, author: null } : t));
      
      setSuccess('Author updated successfully!');
      handleCancelEdit(); // Close the edit form
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update author.');
    }
  };

  return (
    <div className="testimonial-manager">
      <h3>Manage Testimonials</h3>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      
      <form onSubmit={handleSubmit} className="testimonial-form" id="testimonial-form">
        <div className="form-group">
          <label htmlFor="serviceId">Service</label>
          <select id="serviceId" name="serviceId" value={newTestimonial.serviceId} onChange={onChange} required>
            <option value="">Select a Service</option>
            {services.map(service => (
              <option key={service._id} value={service._id}>{service.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="quote">Quote</label>
          <textarea id="quote" name="quote" value={newTestimonial.quote} onChange={onChange} placeholder="Testimonial Quote" required />
        </div>

        <div className="form-group">
          <label htmlFor="rating">Rating</label>
          <input id="rating" type="number" name="rating" value={newTestimonial.rating} onChange={onChange} placeholder="Rating (1-5)" min="1" max="5" required />
        </div>

        <div className="form-group">
          <label htmlFor="profileImage">Profile Image (Optional)</label>
          <input id="profileImage" type="file" name="profileImage" onChange={onFileChange} />
        </div>

        <button type="submit" className="submit-btn">Add Testimonial</button>
      </form>

      <hr />
      <h4>Existing Testimonials</h4>
      <div className="testimonials-list">
        {testimonials.map(testimonial => {
          const authorDisplayName = testimonial.authorName || (testimonial.author ? `${testimonial.author.firstName} ${testimonial.author.lastName}` : 'N/A');
          return (
          <div key={testimonial._id} className="testimonial-item">
            {testimonial.profileImageUrl ? 
              <img src={`/${testimonial.profileImageUrl.replace(/\\/g, '/')}`} alt="Author" className="testimonial-author-img"/>
              : <div className="testimonial-author-placeholder"></div>
            }
            <div className="testimonial-content">
                {editingId === testimonial._id ? (
                  <div className="edit-author-form">
                    <input
                      type="text"
                      value={updatedAuthorName}
                      onChange={(e) => setUpdatedAuthorName(e.target.value)}
                      className="edit-author-input"
                    />
                    <button onClick={() => handleAuthorUpdate(testimonial._id)} className="save-btn">Save</button>
                    <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
                  </div>
                ) : (
                  <p><strong>Author:</strong> {authorDisplayName}</p>
                )}
                <p><strong>Rating:</strong> {'⭐'.repeat(testimonial.rating)}</p>
                <blockquote>"{testimonial.quote}"</blockquote>
              </div>
              <div className="testimonial-actions">
                <button onClick={() => handleEditClick(testimonial)} className="edit-btn">Edit Author</button>
                <button onClick={() => handleDelete(testimonial._id)} className="delete-btn">Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestimonialManager;