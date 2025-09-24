import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './BlogManager.css';

function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [allowLikes, setAllowLikes] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [heroImage, setHeroImage] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState(null);
  
  // State for editing
  const [editingPostId, setEditingPostId] = useState(null);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const formRef = useRef(null); // Ref to scroll to the form when editing

  const fetchPosts = async () => {
    try {
      const res = await axios.get('/api/posts');
      setPosts(res.data);
    } catch (err) {
      setError('Could not fetch posts.');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (heroImage) {
      const previewUrl = URL.createObjectURL(heroImage);
      setHeroImagePreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    } else if (editingPostId) {
      const currentPost = posts.find((p) => p._id === editingPostId);
      setHeroImagePreview(currentPost?.heroImage || null);
    } else {
      setHeroImagePreview(null);
    }
  }, [heroImage, editingPostId, posts]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSummary('');
    setAllowLikes(true);
    setAllowComments(true);
    setHeroImage(null);
    setHeroImagePreview(null);
    setEditingPostId(null);
    if (document.getElementById('heroImage')) {
      document.getElementById('heroImage').value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validation
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!content.trim()) {
      setError('Content is required.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    formData.append('summary', summary.trim());
    formData.append('allowLikes', allowLikes);
    formData.append('allowComments', allowComments);
    if (heroImage) {
      formData.append('heroImage', heroImage);
    }

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'x-auth-token': token } : {};
      
      if (editingPostId) {
        // --- UPDATE EXISTING POST ---
        await axios.put(`/api/posts/${editingPostId}`, formData, { headers });
        setMessage('Post updated successfully!');
      } else {
        // --- CREATE NEW POST ---
        await axios.post('/api/posts', formData, { headers });
        setMessage('Post created successfully!');
      }
      resetForm();
      fetchPosts();
    } catch (err) {
      console.error('Blog creation error:', err);
      setError(err.response?.data?.msg || err.response?.data?.error || 'Operation failed.');
    }
  };

  const handleEdit = (post) => {
    setEditingPostId(post._id);
    setTitle(post.title);
    setContent(post.content);
    setSummary(post.summary || '');
    setAllowLikes(post.allowLikes);
    setAllowComments(post.allowComments);
    setHeroImage(null);
    setMessage('');
    setError('');
    formRef.current.scrollIntoView({ behavior: 'smooth' }); // Scroll to form
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
        try {
            await axios.delete(`/api/posts/${id}`);
            setMessage('Post deleted successfully!');
            fetchPosts();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to delete post.');
        }
    }
  };

  return (
    <div className="blog-manager-container">
      <h3>Blog Manager</h3>
      
      <form onSubmit={handleSubmit} className="blog-form" ref={formRef}>
        <h4>{editingPostId ? 'Edit Post' : 'Create New Post'}</h4>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="heroImage">Hero Image (Optional)</label>
          <input
            id="heroImage"
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/gif"
            onChange={(e) => {
              const file = e.target.files[0];
              setHeroImage(file || null);
            }}
          />
          <p className="field-hint">PNG, JPG, GIF up to 5MB</p>
          {heroImagePreview && (
            <img src={heroImagePreview} alt="Preview" className="image-preview" />
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="summary">Summary</label>
          <textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)}></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} required rows="10"></textarea>
        </div>
        
        <div className="form-options">
          <label><input type="checkbox" checked={allowLikes} onChange={(e) => setAllowLikes(e.target.checked)} /> Allow Likes</label>
          <label><input type="checkbox" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} /> Allow Comments</label>
        </div>
        
        <div className="form-actions">
            <button type="submit" className="submit-btn">{editingPostId ? 'Update Post' : 'Create Post'}</button>
            {editingPostId && <button type="button" className="cancel-btn" onClick={resetForm}>Cancel Edit</button>}
        </div>
      </form>

      <div className="posts-list-container">
        <h4>Existing Posts</h4>
        <ul className="posts-list">
          {posts.length > 0 ? (
            posts.map((post) => (
              <li key={post._id} className="post-item">
                <span className="post-title">{post.title}</span>
                <div className="post-actions">
                    <button onClick={() => handleEdit(post)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(post._id)} className="delete-btn">Delete</button>
                </div>
              </li>
            ))
          ) : (
            <p>No posts found.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default BlogManager;
