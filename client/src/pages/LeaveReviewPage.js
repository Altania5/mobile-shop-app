import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';


// A reusable StarRating input component
const StarRatingInput = ({ rating, setRating }) => {
  return (
    <div className="star-rating-input">
      {[...Array(5)].map((star, index) => {
        const ratingValue = index + 1;
        return (
          <label key={index}>
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => setRating(ratingValue)}
              style={{ display: 'none' }}
            />
            <span className={ratingValue <= rating ? 'star filled' : 'star'}>★</span>
          </label>
        );
      })}
    </div>
  );
};


function LeaveReviewPage() {
  const location = useLocation();
  const { booking } = location.state || {};

  const [rating, setRating] = useState(5);
  const [quote, setQuote] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // FormData is required for sending files
    const formData = new FormData();
    formData.append('serviceId', booking.service._id);
    formData.append('rating', rating);
    formData.append('quote', quote);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'x-auth-token': token,
        'Content-Type': 'multipart/form-data' 
      };
      await axios.post('/api/testimonials', formData, { headers });
      setSuccess('Thank you! Your review has been submitted.');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to submit your review.');
    }
  };

  if (!booking) {
    return (
      <div className="page-container">
        <h2>Error</h2>
        <p>No booking specified. Please go to your <Link to="/history">Service History</Link> to leave a review.</p>
      </div>
    );
  }

    if (!booking.service) {
    return (
        <div className="page-container">
          <h2>Cannot Leave Review</h2>
          <p>This service is no longer available and cannot be reviewed.</p>
          <Link to="/history">Return to Service History</Link>
        </div>
      );
  }

  return (
    <div className="page-container">
      <h2>Leave a Review for {booking.service?.name}</h2>
      <form onSubmit={handleSubmit} className="review-form">
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="form-group">
            <label>Your Rating</label>
            <StarRatingInput rating={rating} setRating={setRating} />
        </div>
        
        <div className="form-group">
            <label htmlFor="quote">Your Review</label>
            <textarea 
                id="quote"
                value={quote} 
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Tell us about your experience..."
                required 
            />
        </div>

        <div className="form-group">
            <label htmlFor="profileImage">Add a photo (optional)</label>
            <input 
                type="file" 
                id="profileImage"
                name="profileImage"
                onChange={handleFileChange}
                accept="image/*"
            />
        </div>

        <button type="submit" disabled={!!success}>
            {success ? 'Submitted!' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

export default LeaveReviewPage;