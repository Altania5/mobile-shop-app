const router = require('express').Router();
const sendEmail = require('../utils/sendEmail');

// @route   POST /api/service-request
// @desc    Handle service request form submission and send emails
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, generalIssue, detailedDescription, carMake, carModel, carTrim, vin } = req.body;

  // Basic validation
  if (!name || !email || !generalIssue || !detailedDescription || !carMake || !carModel || !vin) {
    return res.status(400).json({ msg: 'Please fill out all required fields.' });
  }

  try {
    const ownerEmail = process.env.SITE_OWNER_EMAIL;

    // 1. Email to the Site Owner
    const emailToOwner = {
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
            <p>Thank you for your service request. We have received the details and will get back to you as soon as possible to confirm your details and discuss the next steps.</p>
            <p><strong>Your General Issue:</strong> "${generalIssue}"</p>
            <br/>
            <p>Best regards,</p>
            <p>The Mobile Shop Team</p>
        `
    };
    await sendEmail(confirmationEmail);

    res.status(200).json({ msg: 'Your service request has been sent! We will get back to you shortly.' });

  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ msg: 'Sorry, there was an error sending your request. Please try again later.' });
  }
});

module.exports = router;