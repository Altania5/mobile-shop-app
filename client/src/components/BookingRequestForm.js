import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VEHICLE_MAKES = [
  'Acura', 'Alfa Romeo', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet',
  'Chrysler', 'Dodge', 'Ford', 'Genesis', 'GMC', 'Honda', 'Hyundai',
  'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Land Rover', 'Lexus', 'Lincoln',
  'Mazda', 'Mercedes-Benz', 'MINI', 'Mitsubishi', 'Nissan', 'Pontiac',
  'Porsche', 'RAM', 'Saturn', 'Scion', 'Subaru', 'Tesla', 'Toyota',
  'Volkswagen', 'Volvo',
];

const SERVICES = [
  'Vehicle Diagnostics / Check Engine Light',
  'Brake Repair',
  'Engine Repair',
  'Scheduled Maintenance',
  'Suspension Repair',
  'Electrical Repair',
  'Oil Change',
  'Pre-Purchase Inspection',
  'Other',
];

const TIME_SLOTS = [
  { value: 'morning',   label: 'Morning',   desc: '8 AM – 12 PM',  icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon', desc: '12 PM – 5 PM',  icon: '☀️' },
  { value: 'evening',   label: 'Evening',   desc: '5 PM – 7 PM',   icon: '🌆' },
];

const GA_CONVERSION = 'AW-17853782705/mu8OCKPS7sEcELG1rMFC';

const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 ' +
  'focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent transition-shadow';

const labelCls = 'block text-sm font-semibold text-gray-700 mb-1';

function SectionHeader({ number, title }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1e2833] text-[#d4af37] text-xs font-bold flex items-center justify-center">
        {number}
      </span>
      <h3 className="text-base font-bold text-[#1e2833] uppercase tracking-wide">{title}</h3>
    </div>
  );
}

export default function BookingRequestForm({ defaultService = '', source = 'contact' }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1984 }, (_, i) => currentYear - i);
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    service: defaultService,
    serviceOther: '',
    preferredDate: '',
    preferredTimeSlot: '',
    serviceAddress: '',
  });

  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [status, setStatus] = useState({ submitted: false, message: '', error: false });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!form.vehicleMake) { setModels([]); return; }
    setModelsLoading(true);
    fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(form.vehicleMake)}?format=json`
    )
      .then((r) => r.json())
      .then((data) => setModels((data.Results || []).map((m) => m.Model_Name).sort()))
      .catch(() => setModels([]))
      .finally(() => setModelsLoading(false));
  }, [form.vehicleMake]);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'vehicleMake') {
      setForm((f) => ({ ...f, vehicleMake: value, vehicleModel: '' }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  function setTimeSlot(value) {
    setForm((f) => ({ ...f, preferredTimeSlot: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post('/api/booking-requests', { ...form, source });
      setStatus({ submitted: true, message: res.data.msg, error: false });
      setForm({
        name: '', email: '', phone: '',
        vehicleYear: '', vehicleMake: '', vehicleModel: '',
        service: defaultService, serviceOther: '',
        preferredDate: '', preferredTimeSlot: '',
        serviceAddress: '',
      });
      try {
        window.gtag('event', 'conversion', {
          send_to: GA_CONVERSION,
          value: 1.0,
          currency: 'USD',
        });
        console.log('[GA] Booking request conversion fired');
      } catch (gtagErr) {
        console.warn('[GA] gtag error:', gtagErr);
      }
    } catch (err) {
      setStatus({
        submitted: true,
        message: err.response?.data?.msg || 'Something went wrong. Please try again or call us at (484) 593-3875.',
        error: true,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (status.submitted && !status.error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[#1e2833] mb-2">Request Received!</h3>
        <p className="text-gray-600 mb-6">{status.message}</p>
        <a
          href="tel:4845933875"
          className="inline-flex items-center gap-2 bg-[#d4af37] text-[#1e2833] font-bold px-6 py-3 rounded-lg hover:bg-[#c9a42e] transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          (484) 593-3875
        </a>
        <p className="text-sm text-gray-400 mt-4">We'll usually call or text within a few hours.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      {/* Form header */}
      <div className="bg-[#1e2833] px-6 py-5">
        <h2 className="text-xl font-bold text-white">Request a Booking</h2>
        <p className="text-[#94a3b8] text-sm mt-1">
          Fill out the form — we'll confirm your appointment within a few hours.
        </p>
      </div>

      <div className="p-6 space-y-8">

        {/* ── 1. Contact Info ── */}
        <section>
          <SectionHeader number="1" title="Your Contact Info" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="br-name" className={labelCls}>Full Name *</label>
              <input
                id="br-name" type="text" name="name"
                value={form.name} onChange={handleChange}
                placeholder="Jane Smith" required
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="br-phone" className={labelCls}>Phone Number *</label>
              <input
                id="br-phone" type="tel" name="phone"
                value={form.phone} onChange={handleChange}
                placeholder="(484) 555-1234" required
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="br-email" className={labelCls}>Email Address *</label>
              <input
                id="br-email" type="email" name="email"
                value={form.email} onChange={handleChange}
                placeholder="jane@example.com" required
                className={inputCls}
              />
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* ── 2. Vehicle ── */}
        <section>
          <SectionHeader number="2" title="Your Vehicle" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="br-year" className={labelCls}>Year *</label>
              <select id="br-year" name="vehicleYear" value={form.vehicleYear} onChange={handleChange} required className={inputCls}>
                <option value="" disabled>Select year</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="br-make" className={labelCls}>Make *</label>
              <select id="br-make" name="vehicleMake" value={form.vehicleMake} onChange={handleChange} required className={inputCls}>
                <option value="" disabled>Select make</option>
                {VEHICLE_MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="br-model" className={labelCls}>Model *</label>
              <select
                id="br-model" name="vehicleModel" value={form.vehicleModel}
                onChange={handleChange} required
                disabled={!form.vehicleMake || modelsLoading}
                className={inputCls}
              >
                <option value="" disabled>
                  {!form.vehicleMake ? 'Select make first' : modelsLoading ? 'Loading…' : 'Select model'}
                </option>
                {models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* ── 3. Service ── */}
        <section>
          <SectionHeader number="3" title="Service Needed" />
          <div>
            <label htmlFor="br-service" className={labelCls}>What do you need? *</label>
            <select id="br-service" name="service" value={form.service} onChange={handleChange} required className={inputCls}>
              <option value="" disabled>Select a service</option>
              {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {form.service === 'Other' && (
            <div className="mt-3">
              <label htmlFor="br-service-other" className={labelCls}>Please describe *</label>
              <textarea
                id="br-service-other" name="serviceOther"
                value={form.serviceOther} onChange={handleChange}
                placeholder="Describe what's going on with your vehicle…"
                rows={3} required
                className={inputCls + ' resize-none'}
              />
            </div>
          )}
        </section>

        <hr className="border-gray-100" />

        {/* ── 4. Scheduling ── */}
        <section>
          <SectionHeader number="4" title="Preferred Schedule" />
          <div className="mb-4">
            <label htmlFor="br-date" className={labelCls}>Preferred Date *</label>
            <input
              id="br-date" type="date" name="preferredDate"
              value={form.preferredDate} onChange={handleChange}
              min={today} required
              className={inputCls}
            />
          </div>
          <div>
            <p className={labelCls}>Preferred Time *</p>
            <div className="grid grid-cols-3 gap-3">
              {TIME_SLOTS.map((slot) => {
                const selected = form.preferredTimeSlot === slot.value;
                return (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => setTimeSlot(slot.value)}
                    className={[
                      'flex flex-col items-center justify-center rounded-xl border-2 py-4 px-2 cursor-pointer transition-all',
                      selected
                        ? 'border-[#d4af37] bg-amber-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300',
                    ].join(' ')}
                  >
                    <span className="text-2xl mb-1">{slot.icon}</span>
                    <span className={`text-sm font-semibold ${selected ? 'text-[#1e2833]' : 'text-gray-700'}`}>
                      {slot.label}
                    </span>
                    <span className="text-xs text-gray-400 mt-0.5">{slot.desc}</span>
                  </button>
                );
              })}
            </div>
            {/* hidden input so required validation works */}
            <input
              type="text" required
              value={form.preferredTimeSlot}
              onChange={() => {}}
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0 }}
              tabIndex={-1}
            />
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* ── 5. Service Location ── */}
        <section>
          <SectionHeader number="5" title="Service Location" />
          <div>
            <label htmlFor="br-address" className={labelCls}>
              Where should we come? *
            </label>
            <input
              id="br-address" type="text" name="serviceAddress"
              value={form.serviceAddress} onChange={handleChange}
              placeholder="123 Main St, West Chester, PA 19380" required
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1.5">Home, workplace, or wherever your vehicle will be parked.</p>
          </div>
        </section>

        {/* ── Error message ── */}
        {status.submitted && status.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {status.message}
          </div>
        )}

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#d4af37] hover:bg-[#c9a42e] disabled:opacity-60 text-[#1e2833] font-bold text-base py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Sending…
            </>
          ) : (
            'Request Service →'
          )}
        </button>

        <p className="text-center text-xs text-gray-400">
          Prefer to call?{' '}
          <a href="tel:4845933875" className="text-[#1e2833] font-semibold hover:underline">(484) 593-3875</a>
          {' '}· We're available Mon–Fri, 10 AM–6 PM
        </p>
      </div>
    </form>
  );
}
