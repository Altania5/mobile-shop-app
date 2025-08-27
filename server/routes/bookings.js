const router = require('express').Router();
const auth = require('../middleware/auth');
let Booking = require('../models/booking.model');
const adminAuth = require('../middleware/adminAuth');
let Service = require('../models/service.model');

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
// @desc    Get all bookings from all users (with advanced filtering)
// @access  Admin
router.get('/', adminAuth, async (req, res) => {
  try {
    const { customerName, startDate, endDate, make, model, year, service } = req.query;
    
    let query = {};

    // --- Build the query object based on filters ---
    if (startDate) {
        query.date = { ...query.date, $gte: new Date(startDate) };
    }
    if (endDate) {
        query.date = { ...query.date, $lte: new Date(endDate) };
    }
    if (make) {
        query.vehicleMake = { $regex: make, $options: 'i' }; // Case-insensitive search
    }
    if (model) {
        query.vehicleModel = { $regex: model, $options: 'i' };
    }
    if (year) {
        query.vehicleYear = year;
    }
    if (service) {
        // This requires a more complex query since 'service' is a populated field
        const services = await Service.find({ name: { $regex: service, $options: 'i' } }).select('_id');
        const serviceIds = services.map(s => s._id);
        query.service = { $in: serviceIds };
    }

    let bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email')
      .populate('service', 'name')
      .sort({ date: 1 });

    // --- Filter by customer name after populating ---
    if (customerName) {
        bookings = bookings.filter(booking => {
            const fullName = `${booking.user?.firstName} ${booking.user?.lastName}`;
            return fullName.toLowerCase().includes(customerName.toLowerCase());
        });
    }

    res.json(bookings);
  } catch (err) {
    console.error("Booking search error:", err);
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

// @route   PUT api/bookings/:id/status
// @desc    Update the service status of a booking
// @access  Admin
router.put('/:id/service-status', adminAuth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Only allow status updates for pending or confirmed bookings
        if (booking.status !== 'pending' && booking.status !== 'confirmed') {
            return res.status(400).json({ msg: 'Service status can only be updated for pending or confirmed bookings.' });
        }

        booking.serviceStatus = req.body.serviceStatus;
        await booking.save();

        res.json(booking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;