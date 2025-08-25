import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// StarRating component remains the same
const StarRating = ({ rating }) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(<span key={i} className={i < rating ? 'star filled' : 'star'}>★</span>);
    }
    return <div className="star-rating">{stars}</div>;
};

function TestimonialCarousel() {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await axios.get('/api/testimonials/featured');
        setTestimonials(response.data);
      } catch (error) {
        console.error("Could not fetch featured testimonials", error);
      }
    };
    fetchFeatured();
  }, []);

  // Function to reset the auto-play timer
  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }

  // Effect for automatic sliding
  useEffect(() => {
    resetTimeout();
    if (testimonials.length > 0) {
      timeoutRef.current = setTimeout(
        () => setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length),
        5000 // Change slide every 5 seconds
      );
    }
    return () => {
      resetTimeout();
    };
  }, [currentIndex, testimonials.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <div className="testimonial-carousel-wrapper">
        <h2>Trusted by Your Neighbors</h2>
        <div className="testimonial-carousel">
            <div className="carousel-inner" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {testimonials.map((testimonial) => (
                <div key={testimonial._id} className="carousel-slide">
                    <StarRating rating={testimonial.rating} />
                    <p className="quote">"{testimonial.quote}"</p>
                    <p className="author">- {testimonial.author ? `${testimonial.author.firstName} ${testimonial.author.lastName}` : 'A Valued Customer'}</p>
                </div>
                ))}
            </div>
            {/* The manual controls are now outside the main container for better styling */}
        </div>
        <button onClick={prevSlide} className="carousel-control-v2 prev" aria-label="Previous testimonial">‹</button>
        <button onClick={nextSlide} className="carousel-control-v2 next" aria-label="Next testimonial">›</button>
    </div>
  );
}

export default TestimonialCarousel;