const router = require('express').Router();
const sendEmail = require('../utils/sendEmail');

// @route   POST /api/service-request
// @desc    Handle service request form submission and send emails
// @access  Public
router.post('/', async (req, res) => {
  // Support both the legacy service-help form fields and the new landing page form fields
  const {
    // Landing page form fields
    year, make, model, serviceType, urgency, phone,
    // Legacy service-help form fields
    generalIssue, detailedDescription, carMake, carModel, carTrim, vin,
    // Shared
    name, email,
  } = req.body;

  // Determine which form submitted and validate accordingly
  const isLandingPageForm = !!(year || make || model || serviceType || urgency || phone);

  if (isLandingPageForm) {
    if (!name || !email || !phone || !year || !make || !model || !serviceType || !urgency) {
      return res.status(400).json({ msg: 'Please fill out all required fields.' });
    }
  } else {
    if (!name || !email || !generalIssue || !detailedDescription || !carMake || !carModel || !vin) {
      return res.status(400).json({ msg: 'Please fill out all required fields.' });
    }
  }

  try {
    const ownerEmail = process.env.SITE_OWNER_EMAIL;

    // 1. Email to the Site Owner
    const emailToOwner = isLandingPageForm ? {
      to: ownerEmail,
      subject: `New Service Request: ${serviceType}`,
      html: `
        <h2>New service request from a landing page!</h2>
        <h3>Contact Information</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr>
        <h3>Vehicle Information</h3>
        <p><strong>Year:</strong> ${year}</p>
        <p><strong>Make:</strong> ${make}</p>
        <p><strong>Model:</strong> ${model}</p>
        <hr>
        <h3>Service Details</h3>
        <p><strong>Service Requested:</strong> ${serviceType}</p>
        <p><strong>How Soon Needed:</strong> ${urgency}</p>
      `
    } : {
      to: ownerEmail,
      subject: `New Service Request: ${generalIssue}`,
      html: `
        <h2>You have a new service request from your website!</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr>
        <h3>Vehicle Information</h3>
        <p><strong>Make:</strong> ${carMake}</p>
        <p><strong>Model:</strong> ${carModel}</p>
        <p><strong>Trim:</strong> ${carTrim || 'N/A'}</p>
        <p><strong>VIN:</strong> ${vin}</p>
        <hr>
        <h3>Issue Details</h3>
        <p><strong>General Issue:</strong> ${generalIssue}</p>
        <p><strong>Detailed Description:</strong></p>
        <p>${detailedDescription}</p>
      `
    };
    await sendEmail(emailToOwner);

    // 2. Confirmation Email to the User
    const confirmationEmail = {
      to: email,
      subject: 'We have received your service request!',
      html: `
        <h2>Hello ${name},</h2>
        <p>Thank you for reaching out to Hard Work Mobile. We have received your request and will get back to you as soon as possible to discuss next steps.</p>
        <p><strong>Service Requested:</strong> ${serviceType || generalIssue}</p>
        <br/>
        <p>Best regards,</p>
        <p>Hard Work Mobile</p>
      `
    };
    await sendEmail(confirmationEmail);

    res.status(200).json({ msg: 'Your request has been sent! We will be in touch shortly.' });

  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ msg: 'Sorry, there was an error sending your request. Please try again later.' });
  }
});

module.exports = router;