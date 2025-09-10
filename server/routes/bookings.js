const router = require('express').Router();
let Booking = require('../models/booking.model');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/user.model');
const Service = require('../models/service.model');
const TimeSlot = require('../models/TimeSlot');

// CREATE A BOOKING - Updated to integrate with TimeSlot model
router.post('/', auth, async (req, res) => {
    try {
        const {
            serviceId, date, time, notes, clientFirstName, clientLastName,
            vehicleMake, vehicleModel, vehicleYear, vehicleColor
        } = req.body;

        // Check if there's a corresponding TimeSlot and mark it as booked
        console.log('Creating booking with data:', { serviceId, date, time, clientFirstName, clientLastName });
        
        const bookingDate = new Date(date);
        const startOfDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate(), 23, 59, 59, 999);
        
        console.log('Looking for TimeSlot with:', {
            service: serviceId,
            date: { start: startOfDay, end: endOfDay },
            time: time
        });
        
        const timeSlot = await TimeSlot.findOne({
            service: serviceId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            time: time,
            isAvailable: true,
            isBooked: false
        });
        
        console.log('Found TimeSlot:', timeSlot ? 'Yes' : 'No');

        const newBooking = new Booking({
            user: req.user.id, service: serviceId, date, time, notes,
            clientFirstName, clientLastName, vehicleMake, vehicleModel, vehicleYear, vehicleColor
        });

        const savedBooking = await newBooking.save();
        console.log('Booking saved successfully:', savedBooking._id);
        
        // Mark the TimeSlot as booked if found
        if (timeSlot) {
            await timeSlot.markAsBooked(savedBooking._id);
            console.log('TimeSlot marked as booked');
        } else {
            console.log('No TimeSlot found - booking created without slot reservation');
        }
        
        res.status(201).json(savedBooking);
    } catch (err) {
        console.error("Error creating booking:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: 'Please fill out all required fields.', details: err.errors });
        }
        res.status(500).json({ msg: 'Server error while creating booking.' });
    }
});

// *** FIX: Updated and more resilient GET USER'S BOOKINGS route ***
router.get('/', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate({ path: 'service', select: 'name description price' })
            .sort({ createdAt: -1 });

        // Filter out any bookings where the service might have been deleted
        const validBookings = bookings.filter(booking => booking.service);
        
        res.json(validBookings);
    } catch (err) {
        console.error("!!! FATAL ERROR fetching user bookings:", err);
        res.status(500).json({ msg: 'Server error while fetching user bookings.' });
    }
});


// *** FIX: Updated and more resilient GET ALL BOOKINGS (For Admin) route ***
router.get('/all', [auth, adminAuth], async (req, res) => {
    try {
        const { customerName, startDate, endDate, make, model, year, service } = req.query;
        const query = {};

        if (startDate) query.date = { ...query.date, $gte: new Date(startDate) };
        if (endDate) {
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { ...query.date, $lte: endOfDay };
        }
        if (make) query.vehicleMake = { $regex: make, $options: 'i' };
        if (model) query.vehicleModel = { $regex: model, $options: 'i' };
        if (year) query.vehicleYear = Number(year);
        if (customerName) {
            const nameRegex = new RegExp(customerName, 'i');
            query.$or = [{ 'clientFirstName': nameRegex }, { 'clientLastName': nameRegex }];
        }
        if (service) {
            const matchingServices = await Service.find({ name: { $regex: service, $options: 'i' } });
            if (matchingServices.length > 0) {
                query.service = { $in: matchingServices.map(s => s._id) };
            } else {
                return res.json([]);
            }
        }

        const bookings = await Booking.find(query)
            .populate({ path: 'user', select: 'firstName lastName email' })
            .populate({ path: 'service', select: 'name' })
            .sort({ date: -1 });

        // Filter out any bookings where the user or service might have been deleted
        const validBookings = bookings.filter(booking => booking.user && booking.service);

        res.json(validBookings);

    } catch (err) {
        console.error("!!! FATAL ERROR in GET /all bookings route:", err);
        res.status(500).json({ msg: 'Server error while fetching all bookings.' });
    }
});


// UPDATE BOOKING STATUS (Your existing code is correct)
router.patch('/:id/status', [auth, adminAuth], async (req, res) => {
    try {
        const { status, serviceStatus } = req.body;
        const updateData = {};
        if (status) updateData.status = status;
        if (serviceStatus !== undefined) updateData.serviceStatus = serviceStatus;

        const booking = await Booking.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!booking) return res.status(404).json({ msg: 'Booking not found' });
        res.json(booking);
    } catch (err) {
        console.error("Error updating booking status:", err);
        res.status(500).json({ msg: 'Server error while updating booking status.' });
    }
});

// CANCEL BOOKING - Updated to free up TimeSlot
router.patch('/:id/cancel', auth, async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { status: 'Cancelled' },
            { new: true }
        );
        
        if (!booking) return res.status(404).json({ msg: 'Booking not found or not authorized.' });
        
        // Free up the corresponding TimeSlot
        const timeSlot = await TimeSlot.findOne({
            booking: booking._id
        });
        
        if (timeSlot) {
            await timeSlot.markAsAvailable();
        }
        
        res.json({ msg: 'Booking cancelled successfully.', booking });
    } catch (err) {
        console.error("Error cancelling booking:", err);
        res.status(500).json({ msg: 'Server error while cancelling booking.' });
    }
});

// This is a duplicate of the main GET route, updated as well
router.get('/mybookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({ path: 'service', select: 'name price' })
      .sort({createdAt: -1 });

    const validBookings = bookings.filter(booking => booking.service);

    res.json(validBookings);
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ error: 'Failed to fetch booking history.' });
  }
});

// ADMIN CREATE CUSTOM BOOKING
router.post('/admin-create', [auth, adminAuth], async (req, res) => {
    try {
        const {
            serviceId, customServiceName, customServicePrice, isCustomService,
            date, time, duration, notes, clientFirstName, clientLastName,
            vehicleMake, vehicleModel, vehicleYear, vehicleColor
        } = req.body;

        let serviceRef = null;
        let finalServiceName = '';
        
        if (isCustomService) {
            // For custom services, create a temporary service entry or use a special marker
            finalServiceName = customServiceName;
        } else {
            // Validate existing service
            const service = await Service.findById(serviceId);
            if (!service) {
                return res.status(400).json({ msg: 'Service not found' });
            }
            serviceRef = serviceId;
            finalServiceName = service.name;
        }

        const newBooking = new Booking({
            service: serviceRef,
            customServiceName: finalServiceName,
            customServicePrice: isCustomService ? parseFloat(customServicePrice) : undefined,
            date,
            time,
            duration: duration || 60,
            notes,
            clientFirstName,
            clientLastName,
            vehicleMake,
            vehicleModel,
            vehicleYear,
            vehicleColor,
            createdByAdmin: true,
            requiresCustomerVerification: true,
            status: 'Pending Verification',
            isCustomService: isCustomService
        });

        const savedBooking = await newBooking.save();
        console.log('Admin custom booking created:', savedBooking._id);
        
        res.status(201).json(savedBooking);
    } catch (err) {
        console.error('Error creating admin custom booking:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: 'Please fill out all required fields.', details: err.errors });
        }
        res.status(500).json({ msg: 'Server error while creating custom booking.' });
    }
});

// ASSIGN CUSTOMER TO CUSTOM BOOKING
router.patch('/:id/assign-customer', [auth, adminAuth], async (req, res) => {
    try {
        const { customerId, customerEmail } = req.body;
        const bookingId = req.params.id;

        // Find the booking and update it with customer info
        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                user: customerId,
                status: 'Pending Customer Verification',
                assignedAt: new Date()
            },
            { new: true }
        ).populate('service');

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // TODO: Send verification email to customer
        console.log(`Custom booking ${bookingId} assigned to customer ${customerEmail}`);
        
        res.json({ msg: 'Booking assigned successfully', booking });
    } catch (err) {
        console.error('Error assigning customer to booking:', err);
        res.status(500).json({ msg: 'Server error while assigning customer.' });
    }
});

module.exports = router;
