import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function PostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/api/posts/${slug}`);
        setPost(response.data);
      } catch (err) {
        setError('Post not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) return <p>Loading post...</p>;
  if (error) return <p style={{ color: 'var(--error-color)' }}>{error}</p>;
  if (!post) return <p>Post not found.</p>;

  return (
    <div className="page-container post-container">
      <h1>{post.title}</h1>
      <p className="post-meta">
        By {post.author} on {new Date(post.createdAt).toLocaleDateString()}
      </p>
      {/* A simple way to render content with line breaks */}
      <div className="post-content">
        {post.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <Link to="/blog" className="back-to-blog-link">← Back to Blog</Link>
    </div>
  );
}

export default PostPage;