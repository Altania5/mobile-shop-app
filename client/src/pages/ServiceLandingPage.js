import React from 'react';
import { Link, useParams } from 'react-router-dom';
import BookingRequestForm from '../components/BookingRequestForm';
import './ServiceLandingPage.css';
import servicesBg from './images/services-hero.jpg';

const SERVICE_LABELS = {
  diagnostics: 'Vehicle Diagnostics / Check Engine Light',
  brakes: 'Brake Repair',
  'engine-repair': 'Engine Repair',
  maintenance: 'Scheduled Maintenance',
  suspension: 'Suspension Repair',
  electrical: 'Electrical Repair',
};


// ── Page data ──────────────────────────────────────────────────────────────────
const SERVICE_DATA = {
  diagnostics: {
    eyebrow: 'Mobile Vehicle Diagnostics',
    headline: ['Check Engine Light On? ', 'We Come to You.'],
    subheadline:
      'Don\'t guess — get a proper diagnostic at your home or office. We read your fault codes, explain exactly what\'s wrong, and give you honest, upfront pricing before any repair begins.',
    services: [
      {
        icon: 'fa-solid fa-microchip',
        title: 'OBD-II Fault Code Scan',
        desc: 'Full computer scan to read every stored and pending code across all vehicle systems.',
      },
      {
        icon: 'fa-solid fa-triangle-exclamation',
        title: 'Warning Light Diagnosis',
        desc: 'Check engine, ABS, airbag, TPMS, and other dashboard warning lights identified and explained.',
      },
      {
        icon: 'fa-solid fa-bolt',
        title: 'Electrical Fault Diagnosis',
        desc: 'Pinpoint the root cause of electrical gremlins using professional-grade diagnostic tools.',
      },
      {
        icon: 'fa-solid fa-magnifying-glass',
        title: 'Pre-Purchase Inspection',
        desc: 'Buying a used car? Have us inspect it at the seller\'s location before you commit.',
      },
      {
        icon: 'fa-solid fa-temperature-high',
        title: 'Overheating & Cooling System',
        desc: 'Diagnose overheating causes — thermostat, water pump, head gasket, and beyond.',
      },
      {
        icon: 'fa-solid fa-gauge-high',
        title: 'Performance & Drivability',
        desc: 'Misfires, rough idle, hesitation — we track down the cause and lay out your options.',
      },
    ],
    cta: { book: '/services', contact: '/contact' },
  },

  brakes: {
    eyebrow: 'Mobile Brake Repair',
    headline: ['Brake Problems? ', 'Fixed On-Site.'],
    subheadline:
      'Squealing, grinding, or a soft pedal? Don\'t risk it. Our mobile mechanic comes to your home or workplace and handles your full brake service right there — no tow, no shop wait.',
    services: [
      {
        icon: 'fa-solid fa-circle-dot',
        title: 'Brake Pad Replacement',
        desc: 'Quality pads installed on all four corners. We carry a range of pad grades to fit your needs and budget.',
      },
      {
        icon: 'fa-solid fa-compact-disc',
        title: 'Rotor Replacement',
        desc: 'Warped or worn rotors replaced for smooth, vibration-free braking.',
      },
      {
        icon: 'fa-solid fa-grip-lines',
        title: 'Caliper Service & Replacement',
        desc: 'Sticking or seized calipers diagnosed and replaced to restore even braking pressure.',
      },
      {
        icon: 'fa-solid fa-droplet',
        title: 'Brake Fluid Flush',
        desc: 'Old, moisture-contaminated fluid replaced to restore proper pedal feel and protect the system.',
      },
      {
        icon: 'fa-solid fa-ruler',
        title: 'Brake Line Inspection',
        desc: 'Visual inspection of all brake lines and hoses for leaks, rust, or damage.',
      },
      {
        icon: 'fa-solid fa-magnifying-glass',
        title: 'Full Brake Inspection',
        desc: 'Not sure what\'s wrong? We inspect the entire brake system and give you a straight answer.',
      },
    ],
    cta: { book: '/services', contact: '/contact' },
  },

  'engine-repair': {
    eyebrow: 'Mobile Engine Repair',
    headline: ['Engine Trouble? ', 'We Fix It at Your Location.'],
    subheadline:
      'Most engine repairs don\'t need a full shop — they need the right tools and a knowledgeable mechanic. We bring both to your driveway at a fair $80/hr labor rate.',
    services: [
      {
        icon: 'fa-solid fa-fire-flame-curved',
        title: 'Misfire Diagnosis & Repair',
        desc: 'Rough running, shaking, or check engine flashing? We pinpoint and fix the cylinder causing trouble.',
      },
      {
        icon: 'fa-solid fa-droplet',
        title: 'Head Gasket Repair',
        desc: 'Coolant loss, white smoke, or milky oil? We diagnose and repair blown head gaskets on-site.',
      },
      {
        icon: 'fa-solid fa-gear',
        title: 'Timing Belt & Chain Service',
        desc: 'Prevent catastrophic engine damage with timely timing belt or chain replacement.',
      },
      {
        icon: 'fa-solid fa-oil-can',
        title: 'Valve Cover Gasket',
        desc: 'Oil leaking from the top of your engine? Valve cover gaskets replaced quickly on-site.',
      },
      {
        icon: 'fa-solid fa-temperature-arrow-up',
        title: 'Cooling System Repair',
        desc: 'Thermostat, water pump, radiator hoses, and coolant flushes — all handled at your location.',
      },
      {
        icon: 'fa-solid fa-plug',
        title: 'Spark Plugs & Ignition',
        desc: 'Worn plugs, bad coils, or faulty wires — full ignition system service for peak performance.',
      },
    ],
    cta: { book: '/services', contact: '/contact' },
  },

  maintenance: {
    eyebrow: 'Scheduled Maintenance',
    headline: ['Keep Your Car Running Right ', 'Without Leaving Home.'],
    subheadline:
      'Stay on your manufacturer\'s maintenance schedule without the wait room. We come to your home or office and handle your routine service right there — no appointment hassle, no shop markup.',
    services: [
      {
        icon: 'fa-solid fa-plug',
        title: 'Tune-Up & Spark Plugs',
        desc: 'Fresh spark plugs, new ignition components, and a full tune-up to restore performance and fuel economy.',
      },
      {
        icon: 'fa-solid fa-wind',
        title: 'Air & Cabin Filter Replacement',
        desc: 'Engine air filter and cabin air filter inspected and replaced to keep air clean inside and out.',
      },
      {
        icon: 'fa-solid fa-droplet',
        title: 'Coolant Flush',
        desc: 'Old coolant drained and refilled to protect your engine from overheating and corrosion.',
      },
      {
        icon: 'fa-solid fa-car-burst',
        title: 'Brake Fluid Service',
        desc: 'Moisture-laden brake fluid replaced to maintain pedal feel and protect your braking system.',
      },
      {
        icon: 'fa-solid fa-battery-full',
        title: 'Battery Inspection & Replacement',
        desc: 'Battery tested and replaced if needed — before it leaves you stranded.',
      },
      {
        icon: 'fa-solid fa-road',
        title: 'Belts & Hoses Inspection',
        desc: 'Serpentine belt, drive belts, and coolant hoses inspected and replaced to prevent breakdowns.',
      },
    ],
    cta: { book: '/services', contact: '/contact' },
  },

  suspension: {
    eyebrow: 'Mobile Suspension Repair',
    headline: ['Rough Ride or Clunking? ', 'We Fix It On-Site.'],
    subheadline:
      'Suspension problems get worse fast and affect your safety, tire wear, and handling. Our mobile mechanic diagnoses and repairs suspension components at your location across Southeast PA.',
    services: [
      {
        icon: 'fa-solid fa-car-side',
        title: 'Strut & Shock Replacement',
        desc: 'Worn struts and shocks replaced to restore ride quality, handling, and safety.',
      },
      {
        icon: 'fa-solid fa-circle-nodes',
        title: 'Ball Joint Replacement',
        desc: 'Clunking or wandering steering? Ball joints inspected and replaced before they fail completely.',
      },
      {
        icon: 'fa-solid fa-arrows-left-right',
        title: 'Tie Rod Replacement',
        desc: 'Inner and outer tie rod ends replaced to restore steering precision and eliminate play.',
      },
      {
        icon: 'fa-solid fa-arrows-to-dot',
        title: 'Control Arm Replacement',
        desc: 'Upper and lower control arms and bushings replaced to correct handling and alignment.',
      },
      {
        icon: 'fa-solid fa-link',
        title: 'Sway Bar Links & Bushings',
        desc: 'Clunking over bumps or in turns? Sway bar links and bushings replaced quickly on-site.',
      },
      {
        icon: 'fa-solid fa-circle',
        title: 'Wheel Bearing Replacement',
        desc: 'Humming or grinding at speed? Wheel bearings diagnosed and replaced before they cause damage.',
      },
    ],
    cta: { book: '/services', contact: '/contact' },
  },

  electrical: {
    eyebrow: 'Mobile Auto Electrical Repair',
    headline: ['Electrical Problems? ', 'We Diagnose & Fix On-Site.'],
    subheadline:
      'From a dead battery to complex wiring faults, our mobile mechanic brings professional electrical diagnostic tools directly to you — no tow truck required.',
    services: [
      {
        icon: 'fa-solid fa-battery-full',
        title: 'Battery Replacement',
        desc: 'Battery tested and replaced with a quality unit, right in your driveway.',
      },
      {
        icon: 'fa-solid fa-bolt-lightning',
        title: 'Alternator Replacement',
        desc: 'Battery warning light or frequent dead batteries? Alternator tested and replaced if failing.',
      },
      {
        icon: 'fa-solid fa-power-off',
        title: 'Starter Replacement',
        desc: 'Click with no crank? Starter motor tested and replaced so your car starts reliably again.',
      },
      {
        icon: 'fa-solid fa-diagram-project',
        title: 'Wiring Diagnosis & Repair',
        desc: 'Short circuits, open circuits, and damaged wiring tracked down and repaired properly.',
      },
      {
        icon: 'fa-solid fa-sliders',
        title: 'Fuse, Relay & Module Diagnosis',
        desc: 'Failing relays and blown fuses identified and corrected — no guesswork.',
      },
      {
        icon: 'fa-solid fa-microchip',
        title: 'Sensor Replacement',
        desc: 'O2 sensors, MAF sensors, crankshaft position sensors, and more replaced on-site.',
      },
    ],
    cta: { book: '/services', contact: '/contact' },
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function ServiceLandingPage() {
  const { serviceSlug } = useParams();
  const data = SERVICE_DATA[serviceSlug];

  // Graceful 404 fallback
  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2>Service not found.</h2>
        <Link to="/services" className="cta-button" style={{ display: 'inline-block', marginTop: 20 }}>
          Browse All Services
        </Link>
      </div>
    );
  }

  const { eyebrow, headline, subheadline, services } = data;

  return (
    <div>
      {/* ── Hero ── */}
      <section className="slp-hero" style={{ backgroundImage: `url(${servicesBg})` }}>
        <div className="slp-hero-content">
          <span className="slp-hero-eyebrow">{eyebrow}</span>
          <h1>
            {headline[0]}
            <span>{headline[1]}</span>
          </h1>
          <p>{subheadline}</p>
          <div className="slp-hero-ctas">
            <a href="tel:4845933875" className="slp-btn-primary">
              <i className="fa-solid fa-phone" style={{ marginRight: 8 }}></i>
              (484) 593-3875
            </a>
            <a href="#slp-request-form" className="slp-btn-outline">
              Request Service
            </a>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className="slp-trust-bar">
        <span className="slp-trust-item">
          <i className="fa-solid fa-car"></i> We Come to You
        </span>
        <span className="slp-trust-item">
          <i className="fa-solid fa-dollar-sign"></i> $80/hr Labor
        </span>
        <span className="slp-trust-item">
          <i className="fa-solid fa-file-invoice-dollar"></i> Upfront Pricing
        </span>
        <span className="slp-trust-item">
          <i className="fa-solid fa-map-location-dot"></i> Chester, Delaware & Montgomery Co.
        </span>
      </div>

      {/* ── What's Included ── */}
      <div style={{ background: 'var(--background-color)' }}>
        <div className="slp-section">
          <h2 className="slp-section-title">What's Included</h2>
          <p className="slp-section-subtitle">
            All services performed at your home, workplace, or anywhere your vehicle is parked.
          </p>
          <div className="slp-services-grid">
            {services.map((s, i) => (
              <div className="slp-service-card" key={i}>
                <i className={s.icon}></i>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Why Us ── */}
      <div className="slp-why-bg">
        <div className="slp-why-inner">
          <h2 className="slp-section-title">Why Hard Work Mobile?</h2>
          <p className="slp-section-subtitle">
            The same quality you'd expect from a top-tier shop — delivered to your driveway.
          </p>
          <div className="slp-why-grid">
            <div className="slp-why-card">
              <i className="fa-solid fa-car"></i>
              <h3>We Come to You</h3>
              <p>
                Skip the tow truck and the waiting room. We come to your home, office, or wherever your
                vehicle is parked.
              </p>
            </div>
            <div className="slp-why-card">
              <i className="fa-solid fa-dollar-sign"></i>
              <h3>$80/hr — Competitive Rate</h3>
              <p>
                At $80/hr, our labor rate is significantly lower than most area shops — and there's no
                shop overhead padding the bill.
              </p>
            </div>
            <div className="slp-why-card">
              <i className="fa-solid fa-file-invoice-dollar"></i>
              <h3>Upfront, Honest Pricing</h3>
              <p>
                You know exactly what you're paying before any work begins. No surprises, no upselling,
                no tricks.
              </p>
            </div>
            <div className="slp-why-card">
              <i className="fa-solid fa-shield-halved"></i>
              <h3>Quality Guaranteed</h3>
              <p>
                All work comes with our satisfaction guarantee. We stand behind every repair we perform,
                full stop.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Service Area ── */}
      <div className="slp-area-bg">
        <div className="slp-area-inner">
          <h2 className="slp-section-title">Service Area</h2>
          <p className="slp-section-subtitle">
            Proudly serving Southeast Pennsylvania.
          </p>
          <div className="slp-county-list">
            <span className="slp-county-badge">Chester County, PA</span>
            <span className="slp-county-badge">Delaware County, PA</span>
            <span className="slp-county-badge">Montgomery County, PA</span>
          </div>
          <p className="slp-area-note">
            Not sure if we cover your area? Call us at{' '}
            <a href="tel:4845933875" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
              (484) 593-3875
            </a>{' '}
            or send a message — we're happy to check.
          </p>
        </div>
      </div>

      {/* ── Booking Request Form ── */}
      <div id="slp-request-form" className="slp-form-bg">
        <div className="slp-form-inner">
          <BookingRequestForm
            defaultService={SERVICE_LABELS[serviceSlug] || ''}
            source={`landing-${serviceSlug}`}
          />
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="slp-cta-bg">
        <h2>Ready to Get Started?</h2>
        <p>Book online or give us a call — we'll get you squared away.</p>
        <div className="slp-cta-actions">
          <Link to="/services" className="slp-btn-dark">
            Browse Services & Book
          </Link>
          <Link to="/contact" className="slp-btn-dark-outline">
            Send a Message
          </Link>
          <a href="tel:4845933875" className="slp-btn-dark-outline">
            <i className="fa-solid fa-phone" style={{ marginRight: 8 }}></i>
            (484) 593-3875
          </a>
        </div>
      </div>
    </div>
  );
}
