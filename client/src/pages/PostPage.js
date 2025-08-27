// client/src/pages/PostPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const PostPage = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token'); // Get token for authenticated actions

    const fetchPostData = async () => {
        try {
            const res = await axios.get(`/api/posts/${id}`);
            setPost(res.data.post);
            setComments(res.data.comments);
        } catch (err) {
            console.error("Failed to fetch post data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPostData();
    }, [id]);

    // --- START: Define handleLike function ---
    const handleLike = async () => {
        if (!token) {
            alert('You must be logged in to like a post.');
            return;
        }
        try {
            const headers = { 'x-auth-token': token };
            const res = await axios.put(`/api/posts/${id}/like`, {}, { headers });
            // Update likes count on the post object
            setPost({ ...post, likes: res.data });
        } catch (err) {
            console.error('Failed to like post:', err);
        }
    };
    // --- END: Define handleLike function ---

    // --- START: Define handleCommentSubmit function ---
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            alert('You must be logged in to comment.');
            return;
        }
        if (!newComment.trim()) return;

        try {
            const headers = { 'x-auth-token': token };
            const body = { text: newComment };
            await axios.post(`/api/comments/${id}`, body, { headers });
            setNewComment('');
            fetchPostData(); // Refetch post and comments to show the new one
        } catch (err) {
            console.error('Failed to submit comment:', err);
            alert('Error submitting comment.');
        }
    };
    // --- END: Define handleCommentSubmit function ---

    if (loading) return <div>Loading...</div>;
    if (!post) return <div>Post not found.</div>;

    return (
        <div className="post-page-container">
            {post.imageUrl && <img src={`/${post.imageUrl.replace(/\\/g, '/')}`} alt={post.title} className="post-header-image" />}
            <h1>{post.title}</h1>
            <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }}></div>

            <div className="post-actions">
                <button onClick={handleLike} className="like-button">
                    ❤️ {post.likes.length} Likes
                </button>
            </div>

            {post.commentsEnabled && (
                <div className="comments-section">
                    <h3>Comments</h3>
                    <form onSubmit={handleCommentSubmit} className="comment-form">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            required
                        ></textarea>
                        <button type="submit">Submit</button>
                    </form>
                    <div className="comments-list">
                        {comments.length > 0 ? (
                            comments.map(comment => (
                                <div key={comment._id} className="comment">
                                    <p><strong>{comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'User'}:</strong> {comment.text}</p>
                                </div>
                            ))
                        ) : (
                            <p>No comments yet.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostPage;