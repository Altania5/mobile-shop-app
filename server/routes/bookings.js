const router = require('express').Router();
const auth = require('../middleware/auth');
let Booking = require('../models/booking.model');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { serviceId, date, notes } = req.body;

    if (!serviceId || !date) {
      return res.status(400).json({ msg: 'Please provide a service and a date.' });
    }

    const newBooking = new Booking({
      service: serviceId,
      user: req.user, // from auth middleware
      date,
      notes,
    });

    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/bookings/mybookings
// @desc    Get all bookings for the logged-in user
// @access  Private
router.get('/mybookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user })
      .populate('service', 'name price') // Get service name and price
      .sort({ date: -1 }); // Show the most recent bookings first
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;