import React, { useState, useEffect } from 'react';
import axios from 'axios';

// A simple component to render star ratings
const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span key={i} className={i < rating ? 'star filled' : 'star'}>★</span>
    );
  }
  return <div className="star-rating">{stars}</div>;
};

function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get('/api/testimonials');
        setTestimonials(response.data);
      } catch (err) {
        setError('Could not fetch testimonials at this time.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) return <p>Loading testimonials...</p>;
  if (error) return <p style={{ color: 'var(--error-color)' }}>{error}</p>;

  return (
    <div className="page-container">
      <h2>What Our Customers Say</h2>
      {testimonials.length === 0 ? (
        <p>No testimonials yet. Be the first to leave a review!</p>
      ) : (
        <div className="testimonials-grid">
          {testimonials.map(testimonial => (
            <div key={testimonial._id} className="testimonial-card">
              <StarRating rating={testimonial.rating} />
              <p className="testimonial-quote">"{testimonial.quote}"</p>
              <p className="testimonial-author">- {testimonial.author}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TestimonialsPage;