import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Star rating display component
const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(<span key={i} className={i < Math.round(rating) ? 'star filled' : 'star'}>★</span>);
  }
  return <div className="star-rating">{stars}</div>;
};

function GoogleReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('/api/google-reviews');
        if (Array.isArray(response.data)) {
          setReviews(response.data);
        } else {
          setError('Could not load reviews at this time.');
        }
      } catch (err) {
        setError('Failed to fetch Google reviews.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) return <div className="loader">Loading Reviews...</div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="google-reviews-container">
      <h3>Recent Google Reviews</h3>
      <div className="testimonials-grid-v2">
        {reviews.map(review => (
          <div key={review.time} className="testimonial-card-v2">
            <div className="author-info">
              <img src={review.profile_photo_url} alt={review.author_name} className="profile-pic" />
              <div>
                <a 
                  href={review.author_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="author-name google"
                >
                  {review.author_name}
                </a>
                <span className="testimonial-date">{review.relative_time_description}</span>
              </div>
            </div>
            <StarRating rating={review.rating} />
            <p className="testimonial-quote">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GoogleReviews;