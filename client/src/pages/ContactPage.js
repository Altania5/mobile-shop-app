import React from 'react';
import { Link } from 'react-router-dom';
import BookingRequestForm from '../components/BookingRequestForm';
import './ContactPage.css';
import heroBg from './images/services-hero.jpg';

const SERVICES = [
  { icon: 'fa-solid fa-microchip',    title: 'Vehicle Diagnostics',   desc: "Check engine light on? We bring professional OBD-II diagnostic tools to your location and explain exactly what's wrong.", slug: 'diagnostics' },
  { icon: 'fa-solid fa-circle-dot',   title: 'Brake Repair',          desc: 'Squealing, grinding, or a soft pedal? Pads, rotors, calipers, and brake fluid — all handled on-site.',              slug: 'brakes' },
  { icon: 'fa-solid fa-gear',         title: 'Engine Repair',         desc: 'Misfires, overheating, timing belts, head gaskets — most engine repairs done right in your driveway.',                slug: 'engine-repair' },
  { icon: 'fa-solid fa-oil-can',      title: 'Scheduled Maintenance', desc: 'Stay on your manufacturer schedule without a shop visit. Tune-ups, fluid flushes, filters, and more.',              slug: 'maintenance' },
  { icon: 'fa-solid fa-car-side',     title: 'Suspension Repair',     desc: 'Clunking, rough ride, or pulling? Struts, ball joints, tie rods, and control arms replaced on-site.',                slug: 'suspension' },
  { icon: 'fa-solid fa-bolt',         title: 'Electrical Repair',     desc: 'Dead battery, bad alternator, wiring faults — we diagnose and fix electrical problems wherever your car is.',         slug: 'electrical' },
];

function ContactPage() {
  return (
    <div>

      {/* ── Hero ── */}
      <section className="cp-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="cp-hero-content">
          <span className="cp-eyebrow">
            Mobile Mechanic — Chester, Delaware &amp; Montgomery Counties, PA
          </span>
          <h1>Mobile Mechanic — <span>We Come to You.</span></h1>
          <p>
            Skip the shop and the tow truck. Our mobile mechanic comes to your home or office
            across Southeast Pennsylvania with honest, upfront pricing at <strong>$80/hr</strong> —
            no hidden fees, no surprises.
          </p>
          <div className="cp-hero-ctas">
            <a href="tel:4845933875" className="cp-btn-primary">
              <i className="fa-solid fa-phone" style={{ marginRight: 8 }}></i>
              Call (484) 593-3875
            </a>
            <a href="#cp-form" className="cp-btn-outline">
              Get a Free Quote
            </a>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className="cp-trust-bar">
        <span className="cp-trust-item">
          <i className="fa-solid fa-car"></i> We Come to You
        </span>
        <span className="cp-trust-item">
          <i className="fa-solid fa-dollar-sign"></i> $80/hr Labor
        </span>
        <span className="cp-trust-item">
          <i className="fa-solid fa-file-invoice-dollar"></i> Upfront Pricing
        </span>
        <span className="cp-trust-item">
          <i className="fa-solid fa-map-location-dot"></i> Chester, Delaware &amp; Montgomery Co.
        </span>
      </div>

      {/* ── Services overview ── */}
      <div style={{ background: 'var(--background-color)' }}>
        <div className="cp-section">
          <h2 className="cp-section-title">On-Site Auto Repair Services</h2>
          <p className="cp-section-subtitle">
            Diagnostics, brakes, engines, suspension, electrical, and scheduled maintenance —
            all performed at your location in Chester, Delaware &amp; Montgomery Counties.
          </p>
          <div className="cp-services-grid">
            {SERVICES.map((s) => (
              <Link to={`/services/${s.slug}`} key={s.slug} className="cp-service-card">
                <i className={s.icon}></i>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="cp-service-link">Learn More &rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Why Hard Work Mobile ── */}
      <div className="cp-why-bg">
        <div className="cp-why-inner">
          <h2 className="cp-section-title cp-section-title--light">
            Why Choose Hard Work Mobile?
          </h2>
          <p className="cp-section-subtitle cp-section-subtitle--light">
            The same quality repair you'd expect from a top-tier shop — delivered to your driveway.
          </p>
          <div className="cp-why-grid">
            <div className="cp-why-card">
              <i className="fa-solid fa-car"></i>
              <h3>No Shop Required</h3>
              <p>
                We come to your home, office, or wherever your vehicle is. No tow truck,
                no waiting room, no inconvenience.
              </p>
            </div>
            <div className="cp-why-card">
              <i className="fa-solid fa-dollar-sign"></i>
              <h3>$80/hr — Fair &amp; Competitive</h3>
              <p>
                Our labor rate is significantly lower than most area shops — and there's no
                shop overhead padding the bill.
              </p>
            </div>
            <div className="cp-why-card">
              <i className="fa-solid fa-file-invoice-dollar"></i>
              <h3>Upfront, Honest Pricing</h3>
              <p>
                You know exactly what you're paying before any work begins.
                No surprises, no upselling, no tricks.
              </p>
            </div>
            <div className="cp-why-card">
              <i className="fa-solid fa-shield-halved"></i>
              <h3>Quality Guaranteed</h3>
              <p>
                Professional-grade tools, quality parts, and a satisfaction guarantee
                on every repair we perform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contact info cards ── */}
      <div style={{ background: 'var(--background-color)' }}>
        <div className="cp-section">
          <h2 className="cp-section-title">Reach Us Directly</h2>
          <p className="cp-section-subtitle">
            Ready to book or just have a quick question? We're easy to reach.
          </p>
          <div className="cp-info-grid">
            <div className="cp-info-card">
              <i className="fa-solid fa-phone cp-info-icon"></i>
              <h3>Phone</h3>
              <p>(484) 593-3875</p>
              <a href="tel:4845933875" className="cp-info-link">Call Now</a>
            </div>
            <div className="cp-info-card">
              <i className="fa-solid fa-envelope cp-info-icon"></i>
              <h3>Email</h3>
              <p>JamesFerzanden@hardworkmobile.com</p>
              <a href="mailto:JamesFerzanden@hardworkmobile.com" className="cp-info-link">Send Email</a>
            </div>
            <div className="cp-info-card">
              <i className="fa-solid fa-clock cp-info-icon"></i>
              <h3>Hours</h3>
              <p>Monday – Friday</p>
              <p>10:00 AM – 6:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Service Area ── */}
      <div className="cp-area-bg">
        <div className="cp-area-inner">
          <h2 className="cp-section-title">Mobile Mechanic Service Area</h2>
          <p className="cp-section-subtitle">
            Proudly serving Southeast Pennsylvania. We bring the shop to you.
          </p>
          <div className="cp-county-list">
            <span className="cp-county-badge">Chester County, PA</span>
            <span className="cp-county-badge">Delaware County, PA</span>
            <span className="cp-county-badge">Montgomery County, PA</span>
          </div>
          <p className="cp-area-note">
            Not sure if we cover your specific location?{' '}
            <a href="tel:4845933875" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
              Call us
            </a>{' '}
            and we'll confirm right away — we're happy to check.
          </p>
        </div>
      </div>

      {/* ── Booking Request Form ── */}
      <div id="cp-form" className="cp-form-bg">
        <div className="cp-form-inner">
          <BookingRequestForm source="contact" />
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="cp-cta-bg">
        <h2>Ready to Book Your Mobile Mechanic?</h2>
        <p>
          Serving Chester, Delaware &amp; Montgomery Counties — we come to you at $80/hr.
        </p>
        <div className="cp-cta-actions">
          <Link to="/services" className="cp-btn-dark">Browse All Services</Link>
          <a href="tel:4845933875" className="cp-btn-dark-outline">
            <i className="fa-solid fa-phone" style={{ marginRight: 8 }}></i>
            (484) 593-3875
          </a>
        </div>
      </div>

    </div>
  );
}

export default ContactPage;
