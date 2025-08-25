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
    const fetchGoogleReviews = async () => {
      try {
        const response = await axios.get('/api/google-reviews');
        setReviews(response.data);
      } catch (err) {
        setError('Could not load Google reviews at this time.');
      } finally {
        setLoading(false);
      }
    };
    fetchGoogleReviews();
  }, []);

  if (error) return <p className="error-message">{error}</p>;
  if (loading) return <p>Loading Google reviews...</p>;

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