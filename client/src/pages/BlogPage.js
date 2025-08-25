import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/posts');
        setPosts(response.data);
      } catch (err) {
        setError('Could not fetch blog posts.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p style={{ color: 'var(--error-color)' }}>{error}</p>;

  return (
    <div className="page-container">
      <h2>Our Blog</h2>
      <div className="blog-list">
        {posts.map(post => (
          <div key={post._id} className="post-summary-card">
            <h3>{post.title}</h3>
            <p className="post-meta">
              By {post.author} on {new Date(post.createdAt).toLocaleDateString()}
            </p>
            {/* Displaying a short snippet of the content */}
            <p className="post-snippet">{post.content.substring(0, 150)}...</p>
            <Link to={`/blog/${post.slug}`} className="read-more-link">Read More →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BlogPage;