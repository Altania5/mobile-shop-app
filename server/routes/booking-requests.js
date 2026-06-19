const router = require('express').Router();
const { Resend } = require('resend');
const BookingRequest = require('../models/BookingRequest');
const User = require('../models/user.model');
const auth = require('../middleware/auth');

const resend = new Resend(process.env.RESEND_API_KEY);

// From address — must be a verified Resend domain.
// During testing you can use: onboarding@resend.dev (only delivers to your own account).
// In production, verify hardworkmobile.com with Resend and change this to:
//   Hard Work Mobile <bookings@hardworkmobile.com>
const FROM = process.env.RESEND_FROM_EMAIL || 'Hard Work Mobile <onboarding@resend.dev>';
const OWNER_EMAIL = process.env.SITE_OWNER_EMAIL;

const TIME_SLOT_LABELS = {
  morning:   'Morning (8 AM – 12 PM)',
  afternoon: 'Afternoon (12 PM – 5 PM)',
  evening:   'Evening (5 PM – 7 PM)',
};

function formatDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function ownerHtml(r) {
  const serviceLabel = r.service === 'Other' ? `Other — ${r.serviceOther}` : r.service;
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="background:#1e2833;color:#d4af37;padding:20px;margin:0;border-radius:8px 8px 0 0;">
        🔧 New Booking Request
      </h2>
      <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
        <h3 style="margin-top:0;color:#1e2833;">Contact</h3>
        <table style="border-collapse:collapse;width:100%;">
          <tr><td style="padding:6px 12px 6px 0;color:#64748b;font-size:14px;">Name</td><td style="padding:6px 0;font-weight:600;">${r.name}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#64748b;font-size:14px;">Phone</td><td style="padding:6px 0;"><a href="tel:${r.phone}">${r.phone}</a></td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#64748b;font-size:14px;">Email</td><td style="padding:6px 0;"><a href="mailto:${r.email}">${r.email}</a></td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;">
        <h3 style="color:#1e2833;">Vehicle</h3>
        <p style="margin:0;font-size:16px;font-weight:600;">${r.vehicleYear} ${r.vehicleMake} ${r.vehicleModel}</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;">
        <h3 style="color:#1e2833;">Service Requested</h3>
        <p style="margin:4px 0;">${serviceLabel}</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;">
        <h3 style="color:#1e2833;">Scheduling</h3>
        <p style="margin:4px 0;"><strong>Date:</strong> ${formatDate(r.preferredDate)}</p>
        <p style="margin:4px 0;"><strong>Time:</strong> ${TIME_SLOT_LABELS[r.preferredTimeSlot] || r.preferredTimeSlot}</p>
        <p style="margin:4px 0;"><strong>Address:</strong> ${r.serviceAddress}</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;">
        <p style="margin:0;color:#64748b;font-size:13px;">Source: ${r.source} · Submitted ${new Date().toLocaleString('en-US')}</p>
      </div>
    </div>
  `;
}

function customerHtml(r) {
  const serviceLabel = r.service === 'Other' ? `Other — ${r.serviceOther}` : r.service;
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1e2833;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
        <h1 style="color:#d4af37;margin:0;font-size:24px;">Hard Work Mobile</h1>
        <p style="color:#94a3b8;margin:8px 0 0;">Mobile Auto Repair · Southeast PA</p>
      </div>
      <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:32px 24px;">
        <h2 style="color:#1e2833;margin-top:0;">We've got your request, ${r.name.split(' ')[0]}!</h2>
        <p style="color:#475569;">We'll reach out to you within a few hours to confirm your appointment — usually the same business day.</p>
        <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:24px 0;">
          <h3 style="margin-top:0;color:#1e2833;font-size:15px;text-transform:uppercase;letter-spacing:.05em;">Your Request Summary</h3>
          <table style="border-collapse:collapse;width:100%;font-size:15px;">
            <tr><td style="padding:5px 16px 5px 0;color:#64748b;">Vehicle</td><td style="padding:5px 0;font-weight:600;">${r.vehicleYear} ${r.vehicleMake} ${r.vehicleModel}</td></tr>
            <tr><td style="padding:5px 16px 5px 0;color:#64748b;">Service</td><td style="padding:5px 0;font-weight:600;">${serviceLabel}</td></tr>
            <tr><td style="padding:5px 16px 5px 0;color:#64748b;">Preferred Date</td><td style="padding:5px 0;font-weight:600;">${formatDate(r.preferredDate)}</td></tr>
            <tr><td style="padding:5px 16px 5px 0;color:#64748b;">Time Preference</td><td style="padding:5px 0;font-weight:600;">${TIME_SLOT_LABELS[r.preferredTimeSlot] || r.preferredTimeSlot}</td></tr>
            <tr><td style="padding:5px 16px 5px 0;color:#64748b;">Service Address</td><td style="padding:5px 0;font-weight:600;">${r.serviceAddress}</td></tr>
          </table>
        </div>
        <p style="color:#475569;">Have a question in the meantime? Give us a call:</p>
        <a href="tel:4845933875" style="display:inline-block;background:#d4af37;color:#1e2833;font-weight:700;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:16px;">(484) 593-3875</a>
        <p style="color:#94a3b8;font-size:13px;margin-top:32px;">Hard Work Mobile · Chester, Delaware &amp; Montgomery Counties, PA<br>$80/hr · We come to you</p>
      </div>
    </div>
  `;
}

// GET /api/booking-requests/mine — requests for the logged-in customer (by email)
router.get('/mine', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('email');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    const requests = await BookingRequest.find({ email: user.email }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error('BookingRequest mine error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/booking-requests?status=new&limit=50&skip=0
router.get('/', async (req, res) => {
  const { status, limit = 50, skip = 0 } = req.query;
  const query = status ? { status } : {};
  try {
    const [total, requests] = await Promise.all([
      BookingRequest.countDocuments(query),
      BookingRequest.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(skip)),
    ]);
    res.json({ requests, total });
  } catch (err) {
    console.error('BookingRequest list error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/booking-requests/:id
router.get('/:id', async (req, res) => {
  try {
    const r = await BookingRequest.findById(req.params.id);
    if (!r) return res.status(404).json({ msg: 'Not found' });
    res.json(r);
  } catch (err) {
    console.error('BookingRequest get error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PATCH /api/booking-requests/:id — update status
router.patch('/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const r = await BookingRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!r) return res.status(404).json({ msg: 'Not found' });
    res.json(r);
  } catch (err) {
    console.error('BookingRequest patch error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/booking-requests
router.post('/', async (req, res) => {
  const {
    name, email, phone,
    vehicleYear, vehicleMake, vehicleModel,
    service, serviceOther,
    preferredDate, preferredTimeSlot,
    serviceAddress,
    source,
  } = req.body;

  if (
    !name || !email || !phone ||
    !vehicleYear || !vehicleMake || !vehicleModel ||
    !service || !preferredDate || !preferredTimeSlot ||
    !serviceAddress
  ) {
    return res.status(400).json({ msg: 'Please fill out all required fields.' });
  }

  if (service === 'Other' && !serviceOther?.trim()) {
    return res.status(400).json({ msg: 'Please describe the service you need.' });
  }

  try {
    const record = await BookingRequest.create({
      name, email, phone,
      vehicleYear: Number(vehicleYear),
      vehicleMake, vehicleModel,
      service, serviceOther,
      preferredDate, preferredTimeSlot,
      serviceAddress,
      source: source || 'contact',
    });

    // Send emails — fire and forget (don't block the 201 response)
    Promise.allSettled([
      resend.emails.send({
        from: FROM,
        to: [OWNER_EMAIL],
        subject: `New Booking Request — ${name} · ${service}`,
        html: ownerHtml(record),
      }),
      resend.emails.send({
        from: FROM,
        to: [email],
        subject: "We got your request — Hard Work Mobile",
        html: customerHtml(record),
      }),
    ]).then((results) => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`Resend email ${i} failed:`, r.reason);
      });
    });

    return res.status(201).json({ msg: "Request received! We'll be in touch within a few hours to confirm your appointment." });
  } catch (err) {
    console.error('Booking request error:', err);
    return res.status(500).json({ msg: 'Something went wrong. Please try again or call us at (484) 593-3875.' });
  }
});

module.exports = router;
