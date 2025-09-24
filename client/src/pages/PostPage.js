import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './PostPage.css';

// Pass the logged-in user as a prop
function PostPage({ user }) {
  const [post, setPost] = useState(null);
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { slug } = useParams();
  const navigate = useNavigate();

  // Function to fetch everything for the post
  const fetchPostData = React.useCallback(async (postId) => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        axios.get(`/api/posts/${slug}`),
        axios.get(`/api/posts/${postId}/comments`)
      ]);
      setPost(postRes.data);
      setLikes(postRes.data.likes);
      setComments(commentsRes.data);
    } catch (err) {
      setError('Could not find the requested post.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    const getPostAndComments = async () => {
      try {
        const res = await axios.get(`/api/posts/${slug}`);
        fetchPostData(res.data._id);
      } catch (err) {
        setError('Could not find the requested post.');
        setLoading(false);
      }
    };
    getPostAndComments();
  }, [slug, fetchPostData]);

  const handleLike = async () => {
    if (!user) return navigate('/login'); // Redirect if not logged in
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'x-auth-token': token } : {};
      const res = await axios.put(`/api/posts/${post._id}/like`, {}, { headers });
      setLikes(res.data || []);
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!newComment.trim()) return;
    try {
      const res = await axios.post('/api/comments', {
        text: newComment,
        postId: post._id,
      });
      setComments([res.data, ...comments]); // Add new comment to the top
      setNewComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
    }
  };

  if (loading) return <div className="post-status">Loading post...</div>;
  if (error) return <div className="post-status error">{error}</div>;
  if (!post) return null;

  const imageUrl = post.heroImage
    ? (post.heroImage.startsWith('http') ? post.heroImage : `${window.location.origin}${post.heroImage}`)
    : null;
  const authorName = post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Admin';
  const normalizeId = (id) => {
    if (!id) return '';
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id.$oid) return id.$oid;
    return id.toString ? id.toString() : '';
  };

  const userId = normalizeId(user?.id || user?._id);
  const hasLiked = user && likes.some((likeId) => normalizeId(likeId) === userId);

  return (
    <article className="post-page-container">
      <header className="post-header">
        <h1>{post.title}</h1>
        <p className="post-meta-single">
          Posted by {authorName} on {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </header>

      {imageUrl && <img src={imageUrl} alt={post.title} className="post-hero-image" />}

      <div className="post-content-area">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* --- Likes and Comments Section --- */}
      <div className="post-interactions">
        {post.allowLikes && (
          <div className="likes-section">
            <button onClick={handleLike} className={`like-button ${hasLiked ? 'liked' : ''}`}>
              ❤️ {hasLiked ? 'Liked' : 'Like'}
            </button>
            <span>{likes.length} {likes.length === 1 ? 'like' : 'likes'}</span>
          </div>
        )}

        {post.allowComments && (
          <div className="comments-section">
            <h3>Comments ({comments.length})</h3>
            {user ? (
              <form onSubmit={handleCommentSubmit} className="comment-form">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows="3"
                ></textarea>
                <button type="submit">Post Comment</button>
              </form>
            ) : (
              <p><Link to="/login">Log in</Link> to post a comment.</p>
            )}
            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment._id} className="comment">
                  <p className="comment-author">
                    {comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : 'User'}
                  </p>
                  <p className="comment-text">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="post-footer">
        <Link to="/blog" className="back-to-blog-link">&larr; Back to all posts</Link>
      </div>
    </article>
  );
}

export default PostPage;
