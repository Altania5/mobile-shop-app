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
                    <h1 className="fade-in-down"> When You Dive into the Tough World of Auto Repair, Less than Perfection is a No-No!</h1>
                    <p className="fade-in-up">
                       How fortuitous, then, that I shall stop at nothing to deliver it for my clients.
                    </p>
                    <img src={signature} alt="Signature" className="signature-image fade-in-up delay-1" />
                </div>
                <div className="about-hero-image-container fade-in-right">
                    <img src={heroImage} alt="Professional detailing a car" />
                </div>
            </section>

            {/*<section className="stats-section">
                <div className="stat-item">
                    <i className="fas fa-award"></i>
                    <h3>10+</h3>
                    <p>Years Experience</p>
                </div>
                <div className="stat-item">
                    <i className="fas fa-car-on"></i>
                    <h3>5,000+</h3>
                    <p>Vehicles Detailed</p>
                </div>
                <div className="stat-item">
                    <i className="fas fa-smile"></i>
                    <h3>99%</h3>
                    <p>Client Satisfaction</p>
                </div>
                <div className="stat-item">
                    <i className="fas fa-leaf"></i>
                    <h3>Eco-Friendly</h3>
                    <p>Products Used</p>
                </div>
            </section>*/}

            <div className="about-page-grid">
                {/* LEFT SIDEBAR */}
                <aside className="about-sidebar left-sidebar">
                    <div className="sidebar-widget">
                        <h3><i className="fas fa-bolt"></i> Quick Contact</h3>
                        <p><i className="fas fa-phone"></i> <strong>Phone:</strong> (484) 593-3875</p>
                        <p><i className="fas fa-envelope"></i> <strong>Email:</strong> JamesFerzanden@hardworkmobile.com</p>
                        <p><i className="fas fa-clock"></i> <strong>Hours:</strong> Mon-Fri, 8:00am - 4:00pm</p>
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
                    <section className="testimonial-container">
                        <h2>What Our Clients Say</h2>
                        <TestimonialCarousel />
                    </section>
                </main>
                
                {/* RIGHT SIDEBAR */}
                <aside className="about-sidebar right-sidebar">
                    <div className="sidebar-widget">
                        <h3><i className="fas fa-concierge-bell"></i> Our Services</h3>
                        <ul>
                            <li><Link to="/services"><i className="fas fa-car-side"></i> Vehicle Diagnosis</Link></li>
                            <li><Link to="/services"><i className="fas fa-couch"></i> Routine Maintenance</Link></li>
                            <li><Link to="/services"><i className="fas fa-paint-roller"></i> Suspension Work</Link></li>
                            <li><Link to="/services"><i className="fas fa-shield-alt"></i> Brakes</Link></li>
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
                    <h2>My Crusade</h2>
                    <p>
                        To shatter the corrupt price gouging and degenerate upselling that robbs good people blind. A bussiness Model whcih plunders its clients and Techniscians has not the right to exist at all.
                    </p>
                </div>
            </section>

            {/* CTA SECTION (Full Width) */}
            <section ref={addToRefs} className="cta-section">
                <h2>In need of Hard Work?</h2>
                <p>Contact me, and well go from there. Fair Enough?</p>
                <Link to="/services" className="cta-button hover-glow">View Our Services</Link>
            </section>
        </div>
    );
};

export default AboutPage;
