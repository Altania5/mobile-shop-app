import React from 'react';
import { Link } from 'react-router-dom';
import TestimonialCarousel from '../components/TestimonialCarousel';

// You will need three images for this page.
// Place them in your `client/public/images` folder (create it if it doesn't exist).
const heroImage = '/images/about-hero.jpg';      // A professional headshot or action shot
const signatureImage = '/images/signature.png'; // A transparent PNG of the client's signature
const missionImage = '/images/mission-bg.jpg';  // A background image, maybe of tools or a vehicle

function AboutPage() {
  return (
    <div className="about-page-wrapper">
      
      {/* --- Hero Section --- */}
      <section className="about-hero-section">
        <div className="about-hero-content">
          <h1 className="fade-in-down">Meet Your Trusted Mechanic</h1>
          <p className="fade-in-up delay-1">
            A truly local expert with a deep understanding of vehicle care. 
            When it comes to selecting a mechanic, knowledge and trust are paramount. 
            As someone with years of hands-on experience, I bring homegrown expertise and a commitment to honest service right to your driveway.
          </p>
          <img src={signatureImage} alt="Signature" className="signature-image fade-in-up delay-2" />
        </div>
        <div className="about-hero-image-container">
          <img src={heroImage} alt="Client headshot" className="fade-in-right" />
        </div>
      </section>

      {/* --- Core Values Section --- */}
      <section className="core-values-section">
        <div className="value-card hover-lift">
          <h3>15+</h3>
          <p>Years of Experience</p>
        </div>
        <div className="value-card hover-lift">
          <h3>1,200+</h3>
          <p>Satisfied Clients</p>
        </div>
        <div className="value-card hover-lift">
          <h3>4,000+</h3>
          <p>Services Completed</p>
        </div>
      </section>

      <section className="testimonial-carousel-section animate fade-in-up">
          <TestimonialCarousel />
      </section>

      {/* --- Mission Statement Section --- */}
      <section className="mission-section" style={{ backgroundImage: `url(${missionImage})` }}>
        <div className="mission-overlay">
          <h2>Tired of the Same Old Garage Experience?</h2>
          <p>
            Whether it's the inconvenient drop-offs, the confusing jargon, or the unexpected charges, the traditional auto repair industry has room for improvement. 
            My mission is to provide real, tangible value by bringing convenience, transparency, and master-level skill directly to you.
          </p>
        </div>
      </section>
      
      {/* --- Call to Action Section --- */}
      <section className="cta-section">
        <h2>Ready to Experience the Difference?</h2>
        <p>Let's get your vehicle the expert care it deserves, without the hassle.</p>
        <Link to="/contact"> {/* We will build the contact page later */}
          <button className="cta-button hover-glow">
            Contact Me
          </button>
        </Link>
      </section>

    </div>
  );
}

export default AboutPage;