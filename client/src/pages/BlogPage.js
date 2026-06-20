import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import BlogPostCard from '../components/BlogPostCard';
import './BlogPage.css';
import heroBg from './images/services-hero.jpg';

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
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div>

      {/* ── Hero ── */}
      <section className="bp-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="bp-hero-content">
          <span className="bp-eyebrow">The Hard Work Mobile Blog</span>
          <h1>Auto Repair Insights <span>&amp; Advice</span></h1>
          <p>
            Tips, how-to guides, and updates straight from our mobile mechanic —
            helping Southeast PA drivers stay informed and on the road.
          </p>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className="bp-trust-bar">
        <span className="bp-trust-item"><i className="fa-solid fa-car"></i> Mobile Mechanic Tips</span>
        <span className="bp-trust-item"><i className="fa-solid fa-wrench"></i> DIY Guides</span>
        <span className="bp-trust-item"><i className="fa-solid fa-shield-halved"></i> Maintenance Advice</span>
        <span className="bp-trust-item"><i className="fa-solid fa-map-location-dot"></i> Chester, Delaware &amp; Montgomery Co.</span>
      </div>

      {/* ── Posts ── */}
      <div className="bp-posts-bg">
        <div className="bp-posts-section">

          {loading && (
            <div className="bp-state-box">
              <i className="fa-solid fa-spinner fa-spin"></i>
              <p>Loading posts…</p>
            </div>
          )}

          {error && (
            <div className="bp-state-box bp-state-error">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="bp-empty-state">
              <i className="fa-solid fa-newspaper"></i>
              <h2>Coming Soon</h2>
              <p>
                We're working on articles covering common auto repair questions,
                maintenance schedules, and tips for Southeast PA drivers. Check back soon.
              </p>
              <Link to="/contact" className="bp-btn-primary">Get in Touch</Link>
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <div className="bp-posts-grid">
              {posts.map(post => <BlogPostCard key={post._id} post={post} />)}
            </div>
          )}

        </div>
      </div>

      {/* ── Bottom CTA ── */}
      {!loading && !error && posts.length > 0 && (
        <div className="bp-cta-bg">
          <h2>Need a Mobile Mechanic?</h2>
          <p>We come to your home or office across Chester, Delaware &amp; Montgomery Counties.</p>
          <div className="bp-cta-actions">
            <Link to="/services" className="bp-btn-dark">Browse Services</Link>
            <a href="tel:4845933875" className="bp-btn-dark-outline">
              <i className="fa-solid fa-phone" style={{ marginRight: 8 }}></i>
              (484) 593-3875
            </a>
          </div>
        </div>
      )}

    </div>
  );
}

export default BlogPage;
