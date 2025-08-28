const router = require('express').Router();
let Booking = require('../models/booking.model');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/user.model'); 
const Service = require('../models/service.model'); 

// CREATE A BOOKING
// THE FIX: This route now correctly handles all fields from the booking form.
router.post('/', auth, async (req, res) => {
    try {
        // FIX: Change the destructured variables to match the client-side form data
        const {
            serviceId,
            date,
            time,
            notes, // Changed from customerNotes
            clientFirstName, // Changed from firstName
            clientLastName, // Changed from lastName
            vehicleMake,
            vehicleModel,
            vehicleYear,
            vehicleColor
        } = req.body;

        const newBooking = new Booking({
            user: req.user,
            service: serviceId,
            date,
            time,
            notes, // Pass the notes field
            clientFirstName, // Pass the correct variable
            clientLastName,  // Pass the correct variable
            vehicleMake,
            vehicleModel,
            vehicleYear,
            vehicleColor
        });

        const savedBooking = await newBooking.save();
        res.status(201).json(savedBooking);
    } catch (err) {
        console.error("Error creating booking:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: 'Please fill out all required fields.', details: err.errors });
        }
        res.status(500).json({ msg: 'Server error while creating booking.' });
    }
});

// GET USER'S BOOKINGS
router.get('/', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user }).populate('service', 'name description price');
        res.json(bookings);
    } catch (err) {
        console.error("Error fetching user bookings:", err);
        res.status(500).json({ msg: 'Server error while fetching user bookings.' });
    }
});

// GET ALL BOOKINGS (For Admin)
router.get('/all', [auth, adminAuth], async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('user', 'firstName lastName email')
            .populate('service', 'name')
            .sort({ date: -1 }); // Sort by booking date
        res.json(bookings);
    } catch (err) {
        console.error("Error fetching all bookings:", err);
        res.status(500).json({ msg: 'Server error while fetching all bookings.' });
    }
});

// UPDATE BOOKING STATUS (For Admin)
router.patch('/:id/status', [auth, adminAuth], async (req, res) => {
    try {
        const { status, serviceStatus } = req.body;
        
        const updateData = {};
        if (status) {
            updateData.status = status;
        }
        // Allow serviceStatus to be an empty string
        if (serviceStatus !== undefined) {
            updateData.serviceStatus = serviceStatus;
        }

        const booking = await Booking.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }
        res.json(booking);
    } catch (err) {
        console.error("Error updating booking status:", err);
        res.status(500).json({ msg: 'Server error while updating booking status.' });
    }
});

module.exports = router;
