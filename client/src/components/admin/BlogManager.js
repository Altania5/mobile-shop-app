// client/src/components/admin/BlogManager.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BlogManager = () => {
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [commentsEnabled, setCommentsEnabled] = useState(true);
    const [loading, setLoading] = useState(true);

    // --- START: Added fetchPosts function ---
    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/posts');
            setPosts(res.data);
        } catch (err) {
            console.error("Failed to fetch posts:", err);
        } finally {
            setLoading(false);
        }
    };

    // Load posts when the component mounts
    useEffect(() => {
        fetchPosts();
    }, []);
    // --- END: Added fetchPosts function ---


    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Authentication error. Please log in again.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('commentsEnabled', commentsEnabled);
        if (image) {
            formData.append('image', image);
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-auth-token': token
                }
            };
            await axios.post('/api/posts', formData, config);
            
            // Clear form and refresh the list of posts
            setTitle('');
            setContent('');
            setImage(null);
            fetchPosts(); // <-- This now correctly calls the function
            alert('Post created successfully!');
        } catch (err) {
            console.error('Failed to create post:', err);
            const errorMsg = err.response?.data?.msg || 'Error creating post.';
            alert(errorMsg);
        }
    };
    
    // (Optional but recommended) Add a delete handler
    const handleDeletePost = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            const token = localStorage.getItem('token');
            try {
                await axios.delete(`/api/posts/${postId}`, { headers: { 'x-auth-token': token } });
                fetchPosts(); // Refresh list after deleting
            } catch (err) {
                console.error('Failed to delete post', err);
            }
        }
    };

    return (
        <div className="manager-container">
            <h3>Create New Blog Post</h3>
            <form onSubmit={handleCreatePost}>
                {/* ... form fields from before ... */}
                 <div>
                    <label>Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                    <label>Content</label>
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} required />
                </div>
                <div>
                    <label>Header Image</label>
                    <input type="file" onChange={handleFileChange} />
                </div>
                <div>
                    <label>
                        <input type="checkbox" checked={commentsEnabled} onChange={() => setCommentsEnabled(!commentsEnabled)} />
                        Allow Comments
                    </label>
                </div>
                <button type="submit">Create Post</button>
            </form>

            <hr className="section-divider" />

            <h3>Existing Posts</h3>
            {loading ? <p>Loading posts...</p> : (
                <div className="posts-list">
                    {posts.map(post => (
                        <div key={post._id} className="post-item">
                            <span>{post.title}</span>
                            <button onClick={() => handleDeletePost(post._id)} className="delete-btn">Delete</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BlogManager;