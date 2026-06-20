import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import TestimonialCard from '../components/TestimonialCard';
import GoogleReviews from '../components/GoogleReviews';
import './TestimonialsPage.css';
import heroBg from './images/services-hero.jpg';

function TestimonialsPage({ user }) {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get('/api/testimonials');
        setTestimonials(response.data);
      } catch (err) {
        setError('Could not fetch testimonials at this time.');
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <div>

      {/* -- Hero -- */}
      <section className="tp-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="tp-hero-content">
          <span className="tp-eyebrow">Customer Reviews</span>
          <h1>What Our <span>Customers Say</span></h1>
          <p>
            Real reviews from real drivers across Chester, Delaware &amp; Montgomery Counties —
            see why neighbors trust Hard Work Mobile for on-site auto repair.
          </p>
          <div className="tp-hero-stars">
            {[0,1,2,3,4].map(i => <span key={i}><i className="fa-solid fa-star"></i></span>)}
          </div>
        </div>
      </section>

      {/* -- Trust bar -- */}
      <div className="tp-trust-bar">
        <span className="tp-trust-item"><i className="fa-solid fa-star"></i> 5-Star Service</span>
        <span className="tp-trust-item"><i className="fa-solid fa-car"></i> We Come to You</span>
        <span className="tp-trust-item"><i className="fa-solid fa-handshake"></i> Honest &amp; Transparent</span>
        <span className="tp-trust-item"><i className="fa-solid fa-map-location-dot"></i> Chester, Delaware &amp; Montgomery Co.</span>
      </div>

      {/* -- Site testimonials -- */}
      <div className="tp-section-bg">
        <div className="tp-section">
          <h2 className="tp-section-title">From Our Customers</h2>
          <p className="tp-section-subtitle">
            Submitted directly by clients we've served across Southeast Pennsylvania.
          </p>

          {loading && (
            <div className="tp-state-box">
              <i className="fa-solid fa-spinner fa-spin"></i>
              <p>Loading reviews...</p>
            </div>
          )}

          {error && (
            <div className="tp-state-box tp-state-error">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && testimonials.length === 0 && (
            <div className="tp-empty-state">
              <i className="fa-solid fa-comment-dots"></i>
              <h3>No Reviews Yet</h3>
              <p>We're just getting started. Check back soon — or be the first to leave a review after your service.</p>
            </div>
          )}

          {!loading && !error && testimonials.length > 0 && (
            <div className="tp-grid">
              {testimonials.map(t => (
                <TestimonialCard key={t._id} testimonial={t} user={user} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* -- Google Reviews -- */}
      <div className="tp-google-bg">
        <div className="tp-section">
          <h2 className="tp-section-title tp-section-title--light">From Google</h2>
          <p className="tp-section-subtitle tp-section-subtitle--light">
            Verified reviews pulled directly from our Google Business Profile.
          </p>
          <GoogleReviews />
        </div>
      </div>

      {/* -- CTA -- */}
      <div className="tp-cta-bg">
        <h2>Ready to Experience the Difference?</h2>
        <p>Join our growing list of satisfied customers across Southeast Pennsylvania.</p>
        <div className="tp-cta-actions">
          <Link to="/services" className="tp-btn-dark">Book a Service</Link>
          <a href="tel:4845933875" className="tp-btn-dark-outline">
            <i className="fa-solid fa-phone" style={{ marginRight: 8 }}></i>
            (484) 593-3875
          </a>
        </div>
      </div>

    </div>
  );
}

export default TestimonialsPage;
