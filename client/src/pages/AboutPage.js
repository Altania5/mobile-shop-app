import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import TestimonialCarousel from '../components/TestimonialCarousel';

// Import images (assuming you have these in your project)
import heroImage from './/images/about-hero-image.jpg'; // Replace with your actual image path
import missionBg from './/images/mission-bg.jpeg'; // Replace with your actual image path
import signature from './/images/signature.png'; // Replace with your actual image path


const AboutPage = () => {
    const sectionsRef = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate');
                    }
                });
            },
            { threshold: 0.1 }
        );

        sectionsRef.current.forEach((section) => {
            if (section) {
                observer.observe(section);
            }
        });

        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            sectionsRef.current.forEach((section) => {
                if (section) {
                    observer.unobserve(section);
                }
            });
        };
    }, []);

    const addToRefs = (el) => {
        if (el && !sectionsRef.current.includes(el)) {
            sectionsRef.current.push(el);
        }
    };

    return (
        <div className="about-page-wrapper">

            {/* HERO SECTION */}
            <section ref={addToRefs} className="about-hero-section">
                <div className="about-hero-content">
                    <h1 className="fade-in-down">Your Trusted Partner in Mobile Detailing</h1>
                    <p className="fade-in-up">
                        We are more than just a car wash. We are a team of passionate professionals dedicated to bringing back the showroom shine to your vehicle, right at your doorstep.
                    </p>
                    <img src={signature} alt="Signature" className="signature-image fade-in-up delay-1" />
                </div>
                <div className="about-hero-image-container fade-in-right">
                    <img src={heroImage} alt="Professional detailing a car" />
                </div>
            </section>

            <div className="about-page-grid">
                {/* LEFT SIDEBAR */}
                <aside className="about-sidebar left-sidebar">
                    <div className="sidebar-widget">
                        <h3><i className="fas fa-bolt"></i> Quick Contact</h3>
                        <p><i className="fas fa-phone"></i> <strong>Phone:</strong> (555) 123-4567</p>
                        <p><i className="fas fa-envelope"></i> <strong>Email:</strong> contact@mobileshop.com</p>
                        <p><i className="fas fa-clock"></i> <strong>Hours:</strong> Mon-Fri, 9am - 5pm</p>
                        <Link to="/contact" className="cta-button">
                            <i className="fas fa-paper-plane"></i> Send a Message
                        </Link>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="about-main-content">
                    {/* CORE VALUES */}
                    <section ref={addToRefs} className="core-values-section">
                        <div className="value-card hover-lift">
                            <h3><i className="fas fa-check-circle"></i></h3>
                            <h4>Quality</h4>
                        </div>
                        <div className="value-card hover-lift">
                            <h3><i className="fas fa-handshake"></i></h3>
                            <h4>Integrity</h4>
                        </div>
                        <div className="value-card hover-lift">
                            <h3><i className="fas fa-star"></i></h3>
                            <h4>Excellence</h4>
                        </div>
                    </section>
                    
                    {/* TESTIMONIAL CAROUSEL */}
                    <section ref={addToRefs} className="testimonial-carousel-section">
                        <TestimonialCarousel />
                    </section>
                </main>
                
                {/* RIGHT SIDEBAR */}
                <aside className="about-sidebar right-sidebar">
                    <div className="sidebar-widget">
                        <h3><i className="fas fa-concierge-bell"></i> Our Services</h3>
                        <ul>
                            <li><Link to="/services"><i className="fas fa-car-side"></i> Exterior Detailing</Link></li>
                            <li><Link to="/services"><i className="fas fa-couch"></i> Interior Cleaning</Link></li>
                            <li><Link to="/services"><i className="fas fa-paint-roller"></i> Paint Correction</Link></li>
                            <li><Link to="/services"><i className="fas fa-shield-alt"></i> Ceramic Coating</Link></li>
                        </ul>
                    </div>
                </aside>
            </div>


            {/* MISSION SECTION (Full Width) */}
            <section
                ref={addToRefs}
                className="mission-section"
                style={{ backgroundImage: `url(${missionBg})` }}
            >
                <div className="mission-overlay">
                    <h2>Our Mission</h2>
                    <p>
                        To provide the most convenient, high-quality, and reliable mobile detailing service, ensuring every client feels proud of their vehicle's appearance and condition.
                    </p>
                </div>
            </section>

            {/* CTA SECTION (Full Width) */}
            <section ref={addToRefs} className="cta-section">
                <h2>Ready for the Ultimate Shine?</h2>
                <p>Book your appointment today and experience the difference.</p>
                <Link to="/booking" className="cta-button hover-glow">Book an Appointment</Link>
            </section>
        </div>
    );
};

export default AboutPage;