// client/src/pages/BlogPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './BlogPage.css'; // We'll create this file for styling

// You can create this in a separate file: components/BlogPostCard.js
const BlogPostCard = ({ post }) => (
    <div className="blog-card">
        {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="blog-card-image" />}
        <div className="blog-card-content">
            <h3>{post.title}</h3>
            <p className="blog-card-snippet">{post.content.substring(0, 100)}...</p>
            <div className="blog-card-meta">
                <span>❤️ {post.likes.length} Likes</span>
                {/* We need to get comment count separately or adjust API */}
            </div>
            <Link to={`/blog/${post._id}`} className="read-more-btn">Read More</Link>
        </div>
    </div>
);

const BlogPage = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            const res = await axios.get('/api/posts');
            setPosts(res.data);
        };
        fetchPosts();
    }, []);

    return (
        <div className="blog-page">
            <h1>Our Blog</h1>
            <div className="blog-grid">
                {posts.map(post => (
                    <BlogPostCard key={post._id} post={post} />
                ))}
            </div>
        </div>
    );
};

export default BlogPage;