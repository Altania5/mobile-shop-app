import React from 'react';
import { Link } from 'react-router-dom';
import './BlogPostCard.css';

const truncateText = (text, maxLength) => {
  if (!text) {
    return '';
  }
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

function BlogPostCard({ post }) {
  const authorName = post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Admin';
  // Construct the full URL for the image
  const imageUrl = post.heroImage ? `http://localhost:5000${post.heroImage}` : null;

  return (
    <div className="blog-post-card">
      {/* ADDED: Display the image if it exists */}
      {imageUrl && (
        <Link to={`/blog/${post.slug}`}>
          <img src={imageUrl} alt={post.title} className="card-hero-image" />
        </Link>
      )}
      <div className="card-content">
        <h2>
          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className="post-meta">
          By {authorName} on {new Date(post.createdAt).toLocaleDateString()}
        </p>
        <p className="post-summary">{truncateText(post.summary, 150)}</p>
        <Link to={`/blog/${post.slug}`} className="read-more-link">
          Read More
        </Link>
      </div>
    </div>
  );
}

export default BlogPostCard;
