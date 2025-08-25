import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TestimonialManager() {
  const [testimonials, setTestimonials] = useState([]);
  const [formData, setFormData] = useState({ quote: '', author: '', rating: '5' });
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const fetchTestimonials = async () => {
    try {
      const response = await axios.get('/api/testimonials');
      setTestimonials(response.data);
    } catch (err) {
      setError('Could not fetch testimonials.');
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const headers = { 'x-auth-token': token };
      await axios.post('/api/testimonials', formData, { headers });
      setFormData({ quote: '', author: '', rating: '5' }); // Reset form
      fetchTestimonials(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to add testimonial.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        setError('');
        const headers = { 'x-auth-token': token };
        await axios.delete(`/api/testimonials/${id}`, { headers });
        fetchTestimonials(); // Refresh list
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to delete testimonial.');
      }
    }
  };

  return (
    <div className="manager-container">
      <h3>Manage Testimonials</h3>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="manager-form">
        <textarea name="quote" value={formData.quote} onChange={handleChange} placeholder="Quote" required />
        <input name="author" value={formData.author} onChange={handleChange} placeholder="Author (e.g., John D.)" required />
        <select name="rating" value={formData.rating} onChange={handleChange}>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
        <button type="submit">Add Testimonial</button>
      </form>

      <div className="manager-list">
        {testimonials.map(testimonial => (
          <div key={testimonial._id} className="list-item">
            <span>"{testimonial.quote.substring(0, 50)}..." - {testimonial.author}</span>
            <button onClick={() => handleDelete(testimonial._id)} className="delete-btn">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestimonialManager;