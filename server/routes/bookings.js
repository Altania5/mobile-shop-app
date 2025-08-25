const router = require('express').Router();
const auth = require('../middleware/auth');
let Booking = require('../models/booking.model');
const adminAuth = require('../middleware/adminAuth');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { serviceId, date, time, clientFirstName, clientLastName, vehicleMake, vehicleModel, vehicleYear, vehicleColor, notes } = req.body;

    if (!serviceId || !date || !time || !clientFirstName || !clientLastName || !vehicleMake || !vehicleModel || !vehicleYear || !vehicleColor) {
      return res.status(400).json({ msg: 'Please provide all required fields.' });
    }

    const newBooking = new Booking({
      service: serviceId,
      user: req.user,
      date,
      time,
      clientFirstName,
      clientLastName,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      notes,
    });

    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADDED: Route for a user to update their own booking ---
router.put('/:id', auth, async (req, res) => {
    try {
        const { vehicleMake, vehicleModel, vehicleYear, vehicleColor, notes } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) return res.status(404).json({ msg: 'Booking not found' });
        if (booking.user.toString() !== req.user) return res.status(401).json({ msg: 'User not authorized' });
        if (booking.status !== 'Pending') return res.status(400).json({ msg: 'Only pending bookings can be modified.' });

        booking.vehicleMake = vehicleMake;
        booking.vehicleModel = vehicleModel;
        booking.vehicleYear = vehicleYear;
        booking.vehicleColor = vehicleColor;
        booking.notes = notes;
        
        const updatedBooking = await booking.save();
        res.json(updatedBooking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ADDED: Route for a user to cancel their own booking ---
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ msg: 'Booking not found' });
        if (booking.user.toString() !== req.user) return res.status(401).json({ msg: 'User not authorized' });
        if (booking.status === 'Completed' || booking.status === 'Cancelled') {
            return res.status(400).json({ msg: 'Booking cannot be cancelled.' });
        }

        booking.status = 'Cancelled';
        await booking.save();
        res.json({ msg: 'Booking cancelled successfully.' });
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
      .populate('service', 'name price') 
      .sort({ date: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ error: 'Failed to fetch booking history.' });
  }
});

// --- Admin-Only Routes ---

// @route   GET /api/bookings
// @desc    Get all bookings from all users
// @access  Admin
router.get('/', adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'firstName lastName email') // Get user details
      .populate('service', 'name') // Get service name
      .sort({ date: 1 }); // Sort by the soonest date
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update the status of a booking
// @access  Admin
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    // Basic validation for status
    const allowedStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value.' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true }
    ).populate('user', 'firstName lastName email').populate('service', 'name');

    if (!updatedBooking) {
      return res.status(404).json({ msg: 'Booking not found.' });
    }

    res.json(updatedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;