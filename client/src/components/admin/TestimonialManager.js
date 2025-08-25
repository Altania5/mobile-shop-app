import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentModal from './CommentModal';

function TestimonialManager() {
  const [testimonials, setTestimonials] = useState([]);
  // This state is for the "Add New Testimonial" form
  const [formData, setFormData] = useState({ quote: '', author: '', rating: '5' });
  const [error, setError] = useState('');
  const [commentingOn, setCommentingOn] = useState(null);
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

  // --- THIS IS THE CORRECT handleChange FUNCTION ---
  // It updates the state for the "Add New Testimonial" form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- THIS IS THE CORRECT handleSubmit FUNCTION ---
  // It sends the data from the "Add New Testimonial" form to the backend
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
        fetchTestimonials();
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to delete testimonial.');
      }
    }
  };

  return (
    <>
      {commentingOn && 
        <CommentModal 
            testimonial={commentingOn} 
            onClose={() => setCommentingOn(null)} 
            onCommentAdded={fetchTestimonials} 
        />}

      <div className="manager-container">
        <h3>Manage Testimonials</h3>
        {error && <p className="error-message">{error}</p>}

        {/* --- THIS IS THE JSX FOR THE FORM --- */}
        <form onSubmit={handleSubmit} className="manager-form">
          <h4>Add a New Testimonial</h4>
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
            <div key={testimonial._id} className="list-item testimonial-admin-item">
              <div className="testimonial-info">
                <strong>{testimonial.author?.firstName || testimonial.author} said:</strong> "{testimonial.quote.substring(0, 50)}..."
                <br />
                <span className="info-meta">
                  Rating: {testimonial.rating}/5 | 
                  Likes: {testimonial.likes.length} | 
                  Dislikes: {testimonial.dislikes.length} | 
                  Comments: {testimonial.comments.length}
                </span>
              </div>
              <div>
                <button onClick={() => setCommentingOn(testimonial)}>Reply</button>
                <button onClick={() => handleDelete(testimonial._id)} className="delete-btn">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default TestimonialManager;