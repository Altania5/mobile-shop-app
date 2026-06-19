// client/src/pages/AboutPage.js

import React from 'react';
import { Link } from 'react-router-dom';
import TestimonialCarousel from '../components/TestimonialCarousel';
import './AboutPage.css';
import heroImage from './images/about-hero-image.jpg';
import missionBg from './images/mission-bg.jpeg';
import signature from './images/signature.png';

const VALUES = [
  {
    icon: 'fa-solid fa-check-circle',
    title: 'Quality',
    body: 'Every repair is done right or not at all. No shortcuts, no half-measures — just solid work you can count on.',
  },
  {
    icon: 'fa-solid fa-handshake',
    title: 'Integrity',
    body: "You get an honest diagnosis and a straight answer. If it doesn't need fixing, I'll tell you.",
  },
  {
    icon: 'fa-solid fa-star',
    title: 'Excellence',
    body: 'The bar is not "good enough." It is the standard a professional is proud to put their name on.',
  },
];

const SERVICES_LIST = [
  { icon: 'fa-solid fa-microchip', label: 'Vehicle Diagnostics', slug: 'diagnostics' },
  { icon: 'fa-solid fa-oil-can', label: 'Routine Maintenance', slug: 'maintenance' },
  { icon: 'fa-solid fa-car-side', label: 'Suspension Work', slug: 'suspension' },
  { icon: 'fa-solid fa-circle-dot', label: 'Brake Repair', slug: 'brakes' },
  { icon: 'fa-solid fa-gear', label: 'Engine Repair', slug: 'engine-repair' },
  { icon: 'fa-solid fa-bolt', label: 'Electrical Repair', slug: 'electrical' },
];

const AboutPage = () => {
  return (
    <div>

      {/* ── Hero ── */}
      <section className="ap-hero" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="ap-hero-content">
          <span className="ap-eyebrow">About Hard Work Mobile</span>
          <h1 className="ap-hero-title">
            When You Dive into the Tough World of Auto Repair, Less than Perfect is a No-No!
          </h1>
          <p className="ap-hero-sub">
            How fortuitous, then, that I shall stop at nothing to deliver it for my clients.
          </p>
          <img src={signature} alt="James Ferzanden signature" className="ap-signature" />
          <div className="ap-hero-ctas">
            <Link to="/contact" className="ap-btn-primary">Get a Free Quote</Link>
            <a href="tel:4845933875" className="ap-btn-outline">
              <i className="fa-solid fa-phone" style={{ marginRight: 8 }}></i>
              (484) 593-3875
            </a>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className="ap-trust-bar">
        <span className="ap-trust-item"><i className="fa-solid fa-wrench"></i> Mobile Auto Repair</span>
        <span className="ap-trust-item"><i className="fa-solid fa-certificate"></i> Certified Technician</span>
        <span className="ap-trust-item"><i className="fa-solid fa-comment-dollar"></i> Honest Pricing</span>
        <span className="ap-trust-item"><i className="fa-solid fa-map-location-dot"></i> Chester, Delaware &amp; Montgomery Co.</span>
      </div>

      {/* ── Core Values ── */}
      <section className="ap-section ap-section--light">
        <div className="ap-container">
          <h2 className="ap-section-title">What I Stand For</h2>
          <p className="ap-section-sub">
            Three principles that guide every job — from a simple oil change to a full engine repair.
          </p>
          <div className="ap-values-grid">
            {VALUES.map(v => (
              <div key={v.title} className="ap-value-card">
                <i className={v.icon}></i>
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission (preserved exact text) ── */}
      <section className="ap-mission" style={{ backgroundImage: `url(${missionBg})` }}>
        <div className="ap-mission-overlay">
          <div className="ap-mission-inner">
            <span className="ap-eyebrow ap-eyebrow--dark">The Mission</span>
            <h2 className="ap-mission-title">My Crusade</h2>
            <p className="ap-mission-body">
              To shatter the corrupt price gouging and degenerate upselling that robs good people blind.
              A business model which plunders its clients and technicians has not the right to exist at all.
            </p>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="ap-section ap-section--light">
        <div className="ap-container">
          <h2 className="ap-section-title">What My Clients Say</h2>
          <p className="ap-section-sub">
            Real feedback from drivers across Chester, Delaware &amp; Montgomery Counties.
          </p>
          <TestimonialCarousel />
        </div>
      </section>

      {/* ── Contact + Services info ── */}
      <section className="ap-info-bg">
        <div className="ap-container">
          <div className="ap-info-grid">

            <div className="ap-info-card">
              <i className="fa-solid fa-phone ap-info-icon"></i>
              <h3>Call or Text</h3>
              <p>(484) 593-3875</p>
              <a href="tel:4845933875" className="ap-info-link">Call now</a>
            </div>

            <div className="ap-info-card">
              <i className="fa-solid fa-envelope ap-info-icon"></i>
              <h3>Email</h3>
              <p>JamesFerzanden@hardworkmobile.com</p>
              <a href="mailto:JamesFerzanden@hardworkmobile.com" className="ap-info-link">Send email</a>
            </div>

            <div className="ap-info-card">
              <i className="fa-solid fa-clock ap-info-icon"></i>
              <h3>Hours</h3>
              <p>Monday – Friday</p>
              <p>8:00 AM – 4:00 PM</p>
            </div>

            <div className="ap-info-card ap-services-card">
              <i className="fa-solid fa-list-check ap-info-icon"></i>
              <h3>Services Offered</h3>
              <ul className="ap-services-list">
                {SERVICES_LIST.map(s => (
                  <li key={s.slug}>
                    <Link to={`/services/${s.slug}`}>
                      <i className={s.icon}></i>
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="ap-cta-bg">
        <h2>In Need of Hard Work?</h2>
        <p>Contact me and we will go from there. Fair enough?</p>
        <div className="ap-cta-actions">
          <Link to="/contact" className="ap-btn-dark">Get in Touch</Link>
          <Link to="/" className="ap-btn-dark-outline">View Services</Link>
        </div>
      </div>

    </div>
  );
};

export default AboutPage;
