// client/src/pages/ServicesPage.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ServicesList from '../components/ServicesList';
import ServiceHelpForm from '../components/ServiceHelpForm';
import CustomerChecklist from '../components/CustomerChecklist';
import axios from 'axios';
import './ServicesPage.css';
import heroBg from './images/services-hero.jpg';

const SERVICES = [
  {
    icon: 'fa-solid fa-microchip',
    title: 'Vehicle Diagnostics',
    desc: "Check engine light on? We bring professional OBD-II diagnostic tools to your driveway and explain exactly what's wrong.",
    slug: 'diagnostics',
  },
  {
    icon: 'fa-solid fa-circle-dot',
    title: 'Brake Repair',
    desc: 'Squealing or grinding brakes? We replace pads, rotors, and calipers on-site so you stay safe without the shop trip.',
    slug: 'brakes',
  },
  {
    icon: 'fa-solid fa-gear',
    title: 'Engine Repair',
    desc: 'From minor misfires to major mechanical issues, our certified tech diagnoses and fixes engine problems at your location.',
    slug: 'engine-repair',
  },
  {
    icon: 'fa-solid fa-oil-can',
    title: 'Scheduled Maintenance',
    desc: 'Oil changes, filters, fluids, and tune-ups — we handle your factory-recommended service wherever you park.',
    slug: 'maintenance',
  },
  {
    icon: 'fa-solid fa-car-side',
    title: 'Suspension Repair',
    desc: 'Rough ride or pulling to one side? We inspect and replace shocks, struts, and steering components on the spot.',
    slug: 'suspension',
  },
  {
    icon: 'fa-solid fa-bolt',
    title: 'Electrical Repair',
    desc: 'Dead battery, bad alternator, or failing starter? We diagnose and repair electrical issues without the tow.',
    slug: 'electrical',
  },
];

const WHY_US = [
  {
    icon: 'fa-solid fa-house',
    title: 'We Come to You',
    body: 'Home, work, or anywhere in between — no tow truck, no waiting room, no hassle.',
  },
  {
    icon: 'fa-solid fa-certificate',
    title: 'Certified Technician',
    body: 'Years of hands-on automotive experience. Trained and committed to getting it right the first time.',
  },
  {
    icon: 'fa-solid fa-shield-halved',
    title: 'Satisfaction Guaranteed',
    body: 'Every job is backed by our quality guarantee on parts and labor. Your peace of mind is non-negotiable.',
  },
  {
    icon: 'fa-solid fa-comment-dollar',
    title: 'Upfront Pricing',
    body: "No surprise charges. We quote you before we turn a wrench — what you're told is what you pay.",
  },
];

const ServicesPage = ({ user }) => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [error, setError] = useState('');
  const [timeSlotSystemStats, setTimeSlotSystemStats] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [durationFilters, setDurationFilters] = useState([]);
  const [draftSearchTerm, setDraftSearchTerm] = useState('');
  const [draftMaxPrice, setDraftMaxPrice] = useState(1000);
  const [draftDurationFilters, setDraftDurationFilters] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('/api/services');
        setServices(res.data);
        setFilteredServices(res.data);
        if (user && user.role === 'admin') {
          fetchTimeSlotSystemStats();
        }
      } catch (err) {
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

  const getDurationInMinutes = (duration) => {
    if (typeof duration === 'number') return duration;
    if (typeof duration !== 'string' || !duration) return 0;
    const match = duration.match(/(\d+(\.\d+)?)/);
    if (!match) return 0;
    let value = parseFloat(match[0]);
    if (duration.toLowerCase().includes('hour')) value = value * 60;
    return value;
  };

  useEffect(() => {
    let temp = [...services];
    if (searchTerm) {
      temp = temp.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    temp = temp.filter(s => s.price <= maxPrice);
    if (durationFilters.length > 0) {
      temp = temp.filter(s => {
        const mins = getDurationInMinutes(s.duration);
        return mins > 0 && durationFilters.some(f => {
          if (f === 'lt60') return mins < 60;
          if (f === '60-120') return mins >= 60 && mins <= 120;
          if (f === '121-240') return mins > 120 && mins <= 240;
          if (f === 'gt240') return mins > 240;
          return false;
        });
      });
    }
    setFilteredServices(temp);
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
    <div>

      {/* ── Hero ── */}
      <section className="home-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="home-hero-content">
          <span className="home-eyebrow">Chester, Delaware &amp; Montgomery Counties, PA</span>
          <p className="home-hero-intro">Welcome to Hard Work Mobile!</p>
          <h1 className="home-hero-title">
            When your car is in need of{' '}
            <span className="home-hero-accent">Hard Work</span>,<br />
            your most important choice is your mechanic.
          </h1>
          <p className="home-hero-sub">
            Professional on-site auto repair — we come to your home, office, or wherever you need us.
          </p>
          <div className="home-hero-ctas">
            <Link to="/about" className="home-btn-primary">About Me</Link>
            <a href="#services" className="home-btn-outline">View Services</a>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className="home-trust-bar">
        <span className="home-trust-item"><i className="fa-solid fa-wrench"></i> Mobile Auto Repair</span>
        <span className="home-trust-item"><i className="fa-solid fa-certificate"></i> Certified Technician</span>
        <span className="home-trust-item"><i className="fa-solid fa-shield-halved"></i> Satisfaction Guaranteed</span>
        <span className="home-trust-item"><i className="fa-solid fa-map-location-dot"></i> Chester, Delaware &amp; Montgomery Co.</span>
      </div>

      {/* ── Services Overview ── */}
      <section className="home-section home-section--light">
        <div className="home-container">
          <h2 className="home-section-title">What We Fix</h2>
          <p className="home-section-sub">
            From a check engine light to a full brake job — we handle it all at your location across Southeast Pennsylvania.
          </p>
          <div className="home-services-grid">
            {SERVICES.map(svc => (
              <Link
                key={svc.slug}
                to={`/services/${svc.slug}`}
                className="home-service-card"
              >
                <i className={svc.icon}></i>
                <h3>{svc.title}</h3>
                <p>{svc.desc}</p>
                <span className="home-card-link">Learn more &rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Hard Work Mobile ── */}
      <section className="home-why-bg">
        <div className="home-container">
          <h2 className="home-section-title home-section-title--light">Why Hard Work Mobile?</h2>
          <p className="home-section-sub home-section-sub--light">
            We built this business around one idea: your time is valuable. Here is what that means in practice.
          </p>
          <div className="home-why-grid">
            {WHY_US.map(item => (
              <div key={item.title} className="home-why-card">
                <i className={item.icon}></i>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Customer Checklist ── */}
      <section className="home-section home-section--light">
        <div className="home-container">
          <CustomerChecklist user={user} />
        </div>
      </section>

      {/* ── Service Area ── */}
      <section className="home-area-bg">
        <div className="home-container home-area-inner">
          <h2 className="home-section-title">Our Service Area</h2>
          <p className="home-section-sub">
            We serve drivers across Southeast Pennsylvania. If you are unsure whether we cover your area, give us a call.
          </p>
          <div className="home-county-list">
            <span className="home-county-badge">Chester County</span>
            <span className="home-county-badge">Delaware County</span>
            <span className="home-county-badge">Montgomery County</span>
          </div>
          <p className="home-area-note">
            <i className="fa-solid fa-circle-info" style={{ marginRight: 6 }}></i>
            Surrounding areas may be covered.{' '}
            <Link to="/contact" className="home-area-link">Contact us</Link> to confirm.
          </p>
        </div>
      </section>

      {/* ── Quote Form ── */}
      <section className="home-form-bg">
        <div className="home-form-inner">
          <h2 className="home-section-title">Need a Quote?</h2>
          <p className="home-section-sub">
            Tell us about your vehicle and what is going on. We will get back to you quickly with next steps.
          </p>
          <ServiceHelpForm />
        </div>
      </section>

      {/* ── Full Services Catalog ── */}
      <section id="services" className="home-section home-section--light">
        <div className="home-container">
          <h2 className="home-section-title">Full Service Catalog</h2>
          <p className="home-section-sub">Browse every service we offer and book directly online.</p>

          <div className="home-catalog-layout">
            <aside className="home-filter-sidebar">
              <div className="home-filter-header">
                <h3>Filter Services</h3>
              </div>
              <div className="home-filter-widget">
                <h4>Search</h4>
                <input
                  type="text"
                  placeholder="e.g., Oil Change"
                  value={draftSearchTerm}
                  onChange={e => setDraftSearchTerm(e.target.value)}
                  className="home-filter-input"
                />
              </div>
              <div className="home-filter-widget">
                <h4>Max Price: ${draftMaxPrice}</h4>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="10"
                  value={draftMaxPrice}
                  onChange={e => setDraftMaxPrice(Number(e.target.value))}
                  className="home-price-slider"
                />
              </div>
              <div className="home-filter-widget">
                <h4>Duration</h4>
                <div className="home-checkbox-group">
                  <label><input type="checkbox" value="lt60" onChange={handleDurationChange} /> <span>&lt; 1 Hour</span></label>
                  <label><input type="checkbox" value="60-120" onChange={handleDurationChange} /> <span>1-2 Hours</span></label>
                  <label><input type="checkbox" value="121-240" onChange={handleDurationChange} /> <span>2-4 Hours</span></label>
                  <label><input type="checkbox" value="gt240" onChange={handleDurationChange} /> <span>4+ Hours</span></label>
                </div>
              </div>
              <button onClick={handleApplyFilters} className="home-filter-apply">
                Apply Filters
              </button>
            </aside>

            <div className="home-catalog-main">
              {error && <p className="home-error">{error}</p>}
              <ServicesList
                services={filteredServices}
                user={user}
                timeSlotSystemStats={timeSlotSystemStats}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <div className="home-cta-bg">
        <h2>Ready to Book Your Service?</h2>
        <p>Skip the shop. We come to you — anywhere in Chester, Delaware, or Montgomery County.</p>
        <div className="home-cta-actions">
          <Link to="/contact" className="home-btn-dark">Get a Free Quote</Link>
          <a href="tel:4845933875" className="home-btn-dark-outline">
            <i className="fa-solid fa-phone" style={{ marginRight: 8 }}></i>
            (484) 593-3875
          </a>
        </div>
      </div>

    </div>
  );
};

export default ServicesPage;
