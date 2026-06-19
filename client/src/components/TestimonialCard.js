import React, { useState } from 'react';
import axios from 'axios';
import './TestimonialCard.css';

// A simple component to render star ratings (display only)
const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(<span key={i} className={i < rating ? 'star filled' : 'star'}><i className={i < rating ? 'fa-solid fa-star' : 'fa-regular fa-star'}></i></span>);
  }
  return <div className="star-rating">{stars}</div>;
};


function TestimonialCard({ testimonial, user }) {
  const [likes, setLikes] = useState(testimonial.likes.length);
  const [dislikes, setDislikes] = useState(testimonial.dislikes.length);
  const token = localStorage.getItem('token');

  const handleVote = async (voteType) => {
    try {
      const headers = { 'x-auth-token': token };
      const response = await axios.put(`/api/testimonials/${testimonial._id}/vote`, { voteType }, { headers });
      setLikes(response.data.likes.length);
      setDislikes(response.data.dislikes.length);
    } catch (error) {
      console.error("Voting failed:", error);
    }
  };

  return (
    <div className="testimonial-card-v2">
      <div className="author-info">
        <img 
  src={testimonial.profileImageUrl || '/default-avatar.png'} 
  alt={testimonial.author ? `${testimonial.author.firstName}'s profile` : 'User profile'}
  className="profile-pic"
/>
        <div>
          <span className="author-name">{testimonial.author ? `${testimonial.author.firstName} ${testimonial.author.lastName}` : 'Anonymous'}</span>
          <span className="testimonial-date">{new Date(testimonial.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <StarRating rating={testimonial.rating} />
      <p className="testimonial-quote">"{testimonial.quote}"</p>
      <div className="vote-buttons">
        <button onClick={() => handleVote('like')}><i className="fa-solid fa-thumbs-up"></i> Like ({likes})</button>
        <button onClick={() => handleVote('dislike')}><i className="fa-solid fa-thumbs-down"></i> Dislike ({dislikes})</button>
      </div>
      {testimonial.comments && testimonial.comments.length > 0 && (
        <div className="admin-comment">
          <strong>Response from the owner:</strong>
          <p>{testimonial.comments[0].content}</p>
        </div>
      )}
    </div>
  );
}

export default TestimonialCard;
