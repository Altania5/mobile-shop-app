import React, { useState } from 'react';
import axios from 'axios';

function CommentModal({ testimonial, onClose, onCommentAdded }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      await axios.post(`/api/testimonials/${testimonial._id}/comment`, { content }, { headers });
      onCommentAdded(); // Refresh the main list
      onClose();       // Close the modal
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to post comment.');
    }
  };

  if (!testimonial) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Reply to Testimonial</h2>
        <blockquote className="comment-quote">"{testimonial.quote}"</blockquote>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your public reply here..."
            required
          />
          <div className="form-actions">
            <button type="submit">Post Reply</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CommentModal;