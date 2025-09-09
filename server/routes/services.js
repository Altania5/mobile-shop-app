const router = require('express').Router();
let Service = require('../models/service.model');
let Booking = require('../models/booking.model');
const adminAuth = require('../middleware/adminAuth');
const { startOfDay, endOfDay, parseISO } = require('date-fns');

// @route   GET /api/services
// @desc    Get all services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/services/:id
// @desc    Get a single service by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/services
// @desc    Create a new service
// @access  Admin
router.post('/', adminAuth, async (req, res) => {
  try {
    // THE FIX: Add availableDays and availableTimes to the destructuring
    const { name, description, price, duration, availableDays, availableTimes } = req.body;
    
    // Pass the new fields when creating the service
    const newService = new Service({ name, description, price, duration, availableDays, availableTimes });
    
    const savedService = await newService.save();
    res.status(201).json(savedService);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route   PUT /api/services/:id
// @desc    Update a service
// @access  Admin
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedService) return res.status(404).json({ msg: 'Service not found' });
    res.json(updatedService);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route   DELETE /api/services/:id
// @desc    Delete a service
// @access  Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);
    if (!deletedService) return res.status(404).json({ msg: 'Service not found' });
    res.json({ msg: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/services/:id/availability
// @desc    Get available time slots for a service on a given date
// @access  Public
router.get('/:id/availability', async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ msg: 'Date query parameter is required.' });
        }
        
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ msg: 'Service not found.' });
        }

        // Import TimeSlot model
        const TimeSlot = require('../models/TimeSlot');
        
        // First, try to find available time slots in the new TimeSlot system
        const availableSlots = await TimeSlot.findAvailableSlots(req.params.id, date);
        
        if (availableSlots.length > 0) {
            const times = availableSlots.map(slot => slot.time);
            return res.json(times);
        }
        
        // Fallback to the old system for backward compatibility
        const selectedDate = new Date(date);
        const dayStart = startOfDay(selectedDate);
        const dayEnd = endOfDay(selectedDate);

        const bookingsOnDate = await Booking.find({
            service: req.params.id,
            date: { $gte: dayStart, $lte: dayEnd },
            status: { $nin: ['Cancelled'] }
        });

        const bookedTimes = bookingsOnDate.map(booking => booking.time);
        const availableTimes = service.availableTimes.filter(time => !bookedTimes.includes(time));

        res.json(availableTimes);
    } catch (err) {
        console.error("Availability check error:", err);
        res.status(500).json({ error: 'Server error while checking availability.' });
    }
});

module.exports = router;