import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BlogPostCard from '../components/BlogPostCard'; // UPDATED: Import the new component
import './BlogPage.css';

function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('/api/posts');
        setPosts(res.data);
      } catch (err) {
        setError('There was an error fetching the blog posts.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div className="loading-message">Loading posts...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="blog-page-container">
      <h1>Our Blog</h1>
      <div className="blog-posts-list">
        {posts.length > 0 ? (
          // UPDATED: This now renders the new, safer BlogPostCard component
          posts.map(post => <BlogPostCard key={post._id} post={post} />)
        ) : (
          <p>No blog posts have been published yet.</p>
        )}
      </div>
    </div>
  );
}

export default BlogPage;