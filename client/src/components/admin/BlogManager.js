import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/posts');
      setPosts(response.data);
    } catch (err) {
      setError('Could not fetch posts.');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const headers = { 'x-auth-token': token };
    
    try {
      if (editingId) {
        await axios.put(`/api/posts/${editingId}`, formData, { headers });
      } else {
        await axios.post('/api/posts', formData, { headers });
      }
      resetForm();
      fetchPosts();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to save post.');
    }
  };

  const handleEdit = (post) => {
    setError('');
    setEditingId(post._id);
    setFormData({ title: post.title, content: post.content });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        setError('');
        const headers = { 'x-auth-token': token };
        await axios.delete(`/api/posts/${id}`, { headers });
        fetchPosts();
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to delete post.');
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', content: '' });
  };

  return (
    <div className="manager-container">
      <h3>Manage Blog Posts</h3>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="manager-form">
        <input name="title" value={formData.title} onChange={handleChange} placeholder="Post Title" required />
        <textarea name="content" value={formData.content} onChange={handleChange} placeholder="Post Content (use line breaks for paragraphs)" required style={{ minHeight: '150px' }} />
        <div className="form-actions">
          <button type="submit">{editingId ? 'Update Post' : 'Create Post'}</button>
          {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="manager-list">
        {posts.map(post => (
          <div key={post._id} className="list-item">
            <span>{post.title}</span>
            <div>
              <button onClick={() => handleEdit(post)}>Edit</button>
              <button onClick={() => handleDelete(post._id)} className="delete-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BlogManager;