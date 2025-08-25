const router = require('express').Router();
const sendEmail = require('../utils/sendEmail');

// @route   POST /api/contact
// @desc    Handle contact form submission and send emails
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ msg: 'Please fill out all fields.' });
  }

  try {
    const ownerEmail = process.env.SITE_OWNER_EMAIL;

    // 1. Email to the Site Owner
    const emailToOwner = {
      to: ownerEmail,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>You have a new message from your website!</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };
    await sendEmail(emailToOwner);

    // 2. Confirmation Email to the User
    const confirmationEmail = {
        to: email,
        subject: 'We have received your message!',
        html: `
            <h2>Hello ${name},</h2>
            <p>Thank you for contacting us. We have received your message and will get back to you as soon as possible.</p>
            <p><strong>Your Message:</strong> "${message}"</p>
            <br/>
            <p>Best regards,</p>
            <p>The Mobile Shop Team</p>
        `
    };
    await sendEmail(confirmationEmail);

    res.status(200).json({ msg: 'Thank you for your message! We will get back to you shortly.' });

  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ msg: 'Sorry, there was an error sending your message. Please try again later.' });
  }
});

module.exports = router;