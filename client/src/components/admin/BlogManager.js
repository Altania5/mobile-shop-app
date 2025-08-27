// Git/client/src/components/admin/BlogManager.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BlogManager = () => {
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [commentsEnabled, setCommentsEnabled] = useState(true);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('commentsEnabled', commentsEnabled);
        if (image) {
            formData.append('image', image);
        }

        try {
            // --- START: THE FIX ---
            // Remove the manual config object. The authentication header
            // is now handled globally by the setAuthToken utility.
            // We only need to specify the Content-Type for file uploads.
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };
            await axios.post('/api/posts', formData, config);
            // --- END: THE FIX ---
            
            setTitle('');
            setContent('');
            setImage(null);
            fetchPosts();
            alert('Post created successfully!');
        } catch (err) {
            console.error('Failed to create post:', err);
            const errorMsg = err.response?.data?.msg || 'Error creating post. You may not be authorized.';
            alert(errorMsg);
        }
    };
    
    const handleDeletePost = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                // The auth header is also handled automatically for this request.
                await axios.delete(`/api/posts/${postId}`);
                fetchPosts();
            } catch (err) {
                console.error('Failed to delete post', err);
            }
        }
    };

    return (
        <div className="manager-container">
            <h3>Create New Blog Post</h3>
            <form onSubmit={handleCreatePost}>
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