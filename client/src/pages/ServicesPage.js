// client/src/pages/ServicesPage.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ServicesList from '../components/ServicesList';
import ServiceHelpForm from '../components/ServiceHelpForm';
import CustomerChecklist from '../components/CustomerChecklist';
import axios from 'axios';
import { animateCounters, initScrollAnimations } from '../utils/animations';
import {
    ExpertRepairsIcon,
    MobileServiceIcon,
    FastResponseIcon,
    MobileConvenienceIcon,
    ExpertTechniciansIcon,
    QualityGuaranteedIcon,
    FlexibleSchedulingIcon,
} from '../components/icons/ServiceIcons';

const ServicesPage = ({ user }) => {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [error, setError] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [timeSlotSystemStats, setTimeSlotSystemStats] = useState(null);

    // Active filter states (updated when 'Apply' is clicked)
    const [searchTerm, setSearchTerm] = useState('');
    const [maxPrice, setMaxPrice] = useState(1000);
    const [durationFilters, setDurationFilters] = useState([]);

    // Draft states (updated by inputs directly)
    const [draftSearchTerm, setDraftSearchTerm] = useState('');
    const [draftMaxPrice, setDraftMaxPrice] = useState(1000);
    const [draftDurationFilters, setDraftDurationFilters] = useState([]);

    // Animation trigger
        animateCounters();
        //initScrollAnimations();
    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 100);
    }, []);

    // Fetch initial data
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await axios.get('/api/services');
                setServices(res.data);
                setFilteredServices(res.data);
                
                // Fetch TimeSlot system stats for admin users
                if (user && user.role === 'admin') {
                    await fetchTimeSlotSystemStats();
                }
            } catch (err){
                setError('Could not fetch services.');
                console.error(err);
            }
        };
        fetchServices();
    }, [user]);
    
    const fetchTimeSlotSystemStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const headers = { 'x-auth-token': token };
            const response = await axios.get('/api/timeslots/system-stats', { headers });
            setTimeSlotSystemStats(response.data);
        } catch (err) {
            console.warn('Could not fetch TimeSlot system statistics:', err);
        }
    };

    // Helper function to parse duration
    const getDurationInMinutes = (duration) => {
        if (typeof duration === 'number') {
            return duration;
        }
        if (typeof duration !== 'string' || !duration) {
            return 0;
        }
        const match = duration.match(/(\d+(\.\d+)?)/);
        if (!match) return 0;
        let value = parseFloat(match[0]);
        if (duration.toLowerCase().includes('hour')) {
            value = value * 60;
        }
        return value;
    };

    useEffect(() => {
        let tempServices = [...services];

        if (searchTerm) {
            tempServices = tempServices.filter(service =>
                service.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        tempServices = tempServices.filter(service => service.price <= maxPrice);

        if (durationFilters.length > 0) {
            tempServices = tempServices.filter(service => {
                const durationInMinutes = getDurationInMinutes(service.duration);
                return durationInMinutes > 0 && durationFilters.some(filter => {
                    if (filter === 'lt60') return durationInMinutes < 60;
                    if (filter === '60-120') return durationInMinutes >= 60 && durationInMinutes <= 120;
                    if (filter === '121-240') return durationInMinutes > 120 && durationInMinutes <= 240;
                    if (filter === 'gt240') return durationInMinutes > 240;
                    return false;
                });
            });
        }

        setFilteredServices(tempServices);
    }, [services, searchTerm, maxPrice, durationFilters]);

    const handleDurationChange = (e) => {
        const { value, checked } = e.target;
        setDraftDurationFilters(prev =>
            checked ? [...prev, value] : prev.filter(item => item !== value)
        );
    };

    const handleApplyFilters = () => {
        setSearchTerm(draftSearchTerm);
        setMaxPrice(draftMaxPrice);
        setDurationFilters(draftDurationFilters);
    };

    return (
        <div className="modern-home">
            {/* Hero Section */}
            <section className={`hero-section-modern ${isLoaded ? 'loaded' : ''}`}>
                <div className="hero-background">
                    <div className="hero-overlay"></div>
                </div>
                <div className="hero-content-modern">
                    <div className="hero-text-wrapper">
                        <span className="hero-badge">Professional Mobile Service</span>
                        <h1 className="hero-title">
                            Welcome To
                        </h1>
                        <h1 className="hero-title">
                            <span className="gradient-text">Hard Work Mobile</span>
                        </h1>
                        <p className="hero-subtitle">
                            Expert automotive repair and maintenance delivered directly to your location. 
                            Professional service, convenient scheduling, transparent pricing.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/about" className="btn-primary-modern">
                                <span>About Our Services</span>
                                <div className="btn-shine"></div>
                            </Link>
                            <a href="#services" className="btn-secondary-modern">
                                <span>View Services</span>
                            </a>
                        </div>
                    </div>
                    <div className="hero-image-wrapper">
                        <div className="floating-card card-1">
                            <div className="card-icon" aria-hidden="true">
                                <ExpertRepairsIcon width={48} height={48} />
                            </div>
                            <span>Expert Repairs</span>
                        </div>
                        <div className="floating-card card-2">
                            <div className="card-icon" aria-hidden="true">
                                <MobileServiceIcon width={48} height={48} />
                            </div>
                            <span>Mobile Service</span>
                        </div>
                        <div className="floating-card card-3">
                            <div className="card-icon" aria-hidden="true">
                                <FastResponseIcon width={48} height={48} />
                            </div>
                            <span>Fast Response</span>
                        </div>
                    </div>
                </div>
                {/* <div className="hero-scroll-indicator">
                    <div className="scroll-arrow"></div>
                </div> */}
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container-modern">
                    <div className="section-header">
                        <span className="section-badge">Why Choose Us</span>
                        <h2>Professional Mobile Automotive Service</h2>
                        <p>Experience the convenience of professional automotive service at your location</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <div className="icon-bg" aria-hidden="true">
                                    <MobileConvenienceIcon width={64} height={64} />
                                </div>
                            </div>
                            <h3>Mobile Convenience</h3>
                            <p>We come to you - at home, work, or anywhere you need service. No need to visit a garage.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <div className="icon-bg" aria-hidden="true">
                                    <ExpertTechniciansIcon width={64} height={64} />
                                </div>
                            </div>
                            <h3>Expert Technicians</h3>
                            <p>Certified professionals with years of experience in automotive repair and maintenance.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <div className="icon-bg" aria-hidden="true">
                                    <QualityGuaranteedIcon width={64} height={64} />
                                </div>
                            </div>
                            <h3>Quality Guaranteed</h3>
                            <p>All work comes with our satisfaction guarantee and warranty on parts and labor.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <div className="icon-bg" aria-hidden="true">
                                    <FlexibleSchedulingIcon width={64} height={64} />
                                </div>
                            </div>
                            <h3>Flexible Scheduling</h3>
                            <p>Book appointments that fit your schedule, including evenings and weekends.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Customer Checklist Section */}
            <section className="checklist-section">
                <div className="container-modern">
                    <CustomerChecklist user={user} />
                </div>
            </section>

            {/* Service Help Form Section */}
            <section className="help-form-section">
                <div className="container-modern">
                    <div className="section-header">
                        <span className="section-badge">Get Help Now</span>
                        <h2>Need Vehicle Service?</h2>
                        <p>Tell us about your vehicle issue and we'll get back to you with a quote and next steps.</p>
                    </div>
                    <ServiceHelpForm />
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="services-section-modern">
                <div className="container-modern">
                    <div className="section-header">
                        <span className="section-badge">Our Services</span>
                        <h2>Professional Automotive Services</h2>
                        <p>Browse our complete range of mobile automotive services</p>
                    </div>
                    
                    <div className="services-page-layout-modern">
                        <aside className="filter-sidebar-modern">
                            <div className="filter-header">
                                <h3>Find Your Service</h3>
                            </div>
                            <div className="filter-widget">
                                <h4>Search Services</h4>
                                <input
                                    type="text"
                                    placeholder="e.g., Oil Change"
                                    value={draftSearchTerm}
                                    onChange={(e) => setDraftSearchTerm(e.target.value)}
                                    className="modern-input"
                                />
                            </div>

                            <div className="filter-widget">
                                <h4>Max Price: ${draftMaxPrice}</h4>
                                <input
                                    type="range"
                                    min="50"
                                    max="1000"
                                    step="10"
                                    value={draftMaxPrice}
                                    onChange={(e) => setDraftMaxPrice(Number(e.target.value))}
                                    className="price-slider-modern"
                                />
                            </div>
                            
                            <div className="filter-widget">
                                <h4>By Duration</h4>
                                <div className="checkbox-group-modern">
                                    <label><input type="checkbox" value="lt60" onChange={handleDurationChange} /> <span>&lt; 1 Hour</span></label>
                                    <label><input type="checkbox" value="60-120" onChange={handleDurationChange} /> <span>1-2 Hours</span></label>
                                    <label><input type="checkbox" value="121-240" onChange={handleDurationChange} /> <span>2-4 Hours</span></label>
                                    <label><input type="checkbox" value="gt240" onChange={handleDurationChange} /> <span>4+ Hours</span></label>
                                </div>
                            </div>
                            
                            <button onClick={handleApplyFilters} className="filter-apply-btn-modern">
                                Apply Filters
                            </button>
                        </aside>

                        <main className="services-main-content-modern">
                            {error && <p className="error-message">{error}</p>}
                            <ServicesList 
                                services={filteredServices} 
                                user={user}
                                timeSlotSystemStats={timeSlotSystemStats}
                            />
                        </main>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ServicesPage;
