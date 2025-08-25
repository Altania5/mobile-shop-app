import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TestimonialCard from '../components/TestimonialCard'; // 1. Import the new component

function TestimonialsPage({ user }) { // Pass down the user prop
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
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  if (loading) return <div className="page-container"><p>Loading testimonials...</p></div>;
  if (error) return <div className="page-container"><p className="error-message">{error}</p></div>;

  return (
    <div className="page-container">
      <h2>What Our Customers Say</h2>
      {testimonials.length === 0 ? (
        <p>No testimonials yet. Be the first to leave a review!</p>
      ) : (
        <div className="testimonials-grid-v2">
          {testimonials.map(testimonial => (
            <TestimonialCard key={testimonial._id} testimonial={testimonial} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TestimonialsPage;