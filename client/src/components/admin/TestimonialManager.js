import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentModal from './CommentModal'; // 1. Import the modal

function TestimonialManager() {
  const [testimonials, setTestimonials] = useState([]);
  const [formData, setFormData] = useState({ quote: '', author: '', rating: '5' });
  const [error, setError] = useState('');
  const [commentingOn, setCommentingOn] = useState(null); // 2. State to manage the modal
  const token = localStorage.getItem('token');

  const fetchTestimonials = async () => {
    try {
      // The GET route now populates author info, so we can use it here
      const response = await axios.get('/api/testimonials');
      setTestimonials(response.data);
    } catch (err) {
      setError('Could not fetch testimonials.');
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // No changes needed for handleChange or handleSubmit for adding testimonials

  const handleDelete = async (id) => {
    // ... (no changes needed here)
  };

  // Keep original handleChange and handleSubmit for the "Add Testimonial" form
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => { /* ... no changes ... */ };

  return (
    <>
      {/* 3. Render the modal when a testimonial is being commented on */}
      {commentingOn && 
        <CommentModal 
            testimonial={commentingOn} 
            onClose={() => setCommentingOn(null)} 
            onCommentAdded={fetchTestimonials} 
        />}

      <div className="manager-container">
        <h3>Manage Testimonials</h3>
        {error && <p className="error-message">{error}</p>}
        {/* The form for manually adding testimonials remains unchanged */}
        {/* <form onSubmit={handleSubmit} ... > ... </form> */}

        <div className="manager-list">
          {testimonials.map(testimonial => (
            <div key={testimonial._id} className="list-item testimonial-admin-item">
              <div className="testimonial-info">
                <strong>{testimonial.author?.firstName || 'User'} said:</strong> "{testimonial.quote.substring(0, 50)}..."
                <br />
                <span className="info-meta">
                  Rating: {testimonial.rating}/5 | 
                  Likes: {testimonial.likes.length} | 
                  Dislikes: {testimonial.dislikes.length} | 
                  Comments: {testimonial.comments.length}
                </span>
              </div>
              <div>
                {/* 4. The new "Reply" button */}
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