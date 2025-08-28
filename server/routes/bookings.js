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
        const { customerName, startDate, endDate, make, model, year, service } = req.query;
        const query = {};

        if (startDate) {
            // Add or initialize the date part of the query
            query.date = { ...query.date, $gte: new Date(startDate) };
        }
        if (endDate) {
            // To include the full end day, set to the end of that day
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { ...query.date, $lte: endOfDay };
        }

        if (make) query.vehicleMake = { $regex: make, $options: 'i' };
        if (model) query.vehicleModel = { $regex: model, $options: 'i' };
        if (year) query.vehicleYear = Number(year);

        // Search by client's first or last name
        if (customerName) {
            const nameRegex = new RegExp(customerName, 'i');
            query.$or = [
                { 'clientFirstName': nameRegex },
                { 'clientLastName': nameRegex }
            ];
        }

        // Search by service name
        if (service) {
            // Find service documents that match the service name search term
            const matchingServices = await Service.find({ name: { $regex: service, $options: 'i' } });
            if (matchingServices.length > 0) {
                // If services are found, add a condition to match any of their IDs
                query.service = { $in: matchingServices.map(s => s._id) };
            } else {
                // If no service matches, return an empty array immediately
                return res.json([]);
            }
        }

        const bookings = await Booking.find(query)
            .populate('user', 'firstName lastName email')
            .populate('service', 'name')
            .sort({ date: -1 });
            
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
