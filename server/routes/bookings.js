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
            user: req.user.id, 
            service: serviceId, 
            date, 
            time, 
            notes,
            clientFirstName, 
            clientLastName, 
            vehicleMake, 
            vehicleModel, 
            vehicleYear, 
            vehicleColor,
            createdByAdmin: false,  // Regular customer booking
            isCustomService: false
        });

        const savedBooking = await newBooking.save();
        console.log('Booking saved successfully:', savedBooking._id);
        
        // Mark the TimeSlot as booked if found (only for regular bookings)
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


// UPDATE BOOKING STATUS - Enhanced with TimeSlot integration
router.patch('/:id/status', [auth, adminAuth], async (req, res) => {
    try {
        const { status, serviceStatus } = req.body;
        const bookingId = req.params.id;
        
        // Get the current booking to check previous status
        const currentBooking = await Booking.findById(bookingId);
        if (!currentBooking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }
        
        const updateData = {};
        if (status) updateData.status = status;
        if (serviceStatus !== undefined) updateData.serviceStatus = serviceStatus;

        const booking = await Booking.findByIdAndUpdate(bookingId, updateData, { new: true });
        
        // Handle TimeSlot integration based on status changes
        if (status && status !== currentBooking.status) {
            await handleBookingStatusChange(currentBooking, status, bookingId);
        }
        
        res.json(booking);
    } catch (err) {
        console.error("Error updating booking status:", err);
        res.status(500).json({ msg: 'Server error while updating booking status.' });
    }
});

// Helper function to handle booking status changes and TimeSlot updates
async function handleBookingStatusChange(currentBooking, newStatus, bookingId) {
    try {
        // Skip TimeSlot management for admin-created custom bookings
        if (currentBooking.createdByAdmin && currentBooking.isCustomService) {
            console.log('Skipping TimeSlot update for custom admin booking:', bookingId);
            return;
        }
        
        // Find the corresponding TimeSlot
        const timeSlot = await TimeSlot.findOne({ booking: bookingId });
        
        if (!timeSlot) {
            console.log('No TimeSlot found for booking:', bookingId);
            return;
        }
        
        switch (newStatus) {
            case 'Completed':
            case 'Cancelled':
                // Free up the time slot when booking is completed or cancelled
                await timeSlot.markAsAvailable();
                console.log(`TimeSlot freed for booking ${bookingId} - status: ${newStatus}`);
                break;
                
            case 'Confirmed':
                // Ensure slot is still booked when confirmed
                if (!timeSlot.isBooked) {
                    await timeSlot.markAsBooked(bookingId);
                    console.log(`TimeSlot re-booked for booking ${bookingId}`);
                }
                break;
                
            case 'Pending':
                // For pending bookings, keep the slot reserved but mark appropriately
                if (!timeSlot.isBooked) {
                    await timeSlot.markAsBooked(bookingId);
                    console.log(`TimeSlot reserved for pending booking ${bookingId}`);
                }
                break;
                
            default:
                console.log(`No TimeSlot action needed for status: ${newStatus}`);
        }
    } catch (err) {
        console.error('Error handling booking status change:', err);
    }
}

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
        
        // Generate verification token
        const crypto = require('crypto');
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Find the customer
        const customer = await User.findById(customerId);
        if (!customer) {
            return res.status(404).json({ msg: 'Customer not found' });
        }

        // Find the booking and update it with customer info
        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                user: customerId,
                status: 'Pending Customer Verification',
                assignedAt: new Date(),
                verificationToken: verificationToken,
                verificationExpiry: verificationExpiry
            },
            { new: true }
        ).populate('service');

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Send verification email to customer
        try {
            const { sendCustomBookingVerificationEmail } = require('../services/emailVerificationService');
            const customerName = `${customer.firstName} ${customer.lastName}`;
            
            await sendCustomBookingVerificationEmail(customerEmail, customerName, booking);
            console.log(`Verification email sent to ${customerEmail} for booking ${bookingId}`);
        } catch (emailErr) {
            console.error('Error sending verification email:', emailErr);
            // Don't fail the request if email fails
        }
        
        res.json({ 
            msg: 'Booking assigned successfully and verification email sent', 
            booking: {
                ...booking.toObject(),
                verificationToken: undefined // Don't expose token in response
            }
        });
    } catch (err) {
        console.error('Error assigning customer to booking:', err);
        res.status(500).json({ msg: 'Server error while assigning customer.' });
    }
});

// GET CUSTOM BOOKING BY VERIFICATION TOKEN (Public route)
router.get('/verify-custom-booking/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        const booking = await Booking.findOne({
            verificationToken: token,
            verificationExpiry: { $gt: new Date() }
        })
        .populate('service')
        .populate('user', 'firstName lastName email');
        
        if (!booking) {
            return res.status(404).json({ msg: 'Invalid or expired verification token' });
        }
        
        // Don't send sensitive data
        const responseData = {
            _id: booking._id,
            service: booking.service,
            customServiceName: booking.customServiceName,
            customServicePrice: booking.customServicePrice,
            isCustomService: booking.isCustomService,
            date: booking.date,
            time: booking.time,
            duration: booking.duration,
            notes: booking.notes,
            clientFirstName: booking.clientFirstName,
            clientLastName: booking.clientLastName,
            vehicleMake: booking.vehicleMake,
            vehicleModel: booking.vehicleModel,
            vehicleYear: booking.vehicleYear,
            vehicleColor: booking.vehicleColor,
            status: booking.status,
            customer: booking.user
        };
        
        res.json(responseData);
    } catch (err) {
        console.error('Error fetching booking for verification:', err);
        res.status(500).json({ msg: 'Server error while fetching booking.' });
    }
});

// VERIFY CUSTOM BOOKING (Public route)
router.post('/verify-custom-booking/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { confirmed, customerName, customerEmail } = req.body;
        
        const booking = await Booking.findOne({
            verificationToken: token,
            verificationExpiry: { $gt: new Date() }
        });
        
        if (!booking) {
            return res.status(404).json({ msg: 'Invalid or expired verification token' });
        }
        
        if (!confirmed) {
            // Customer declined the booking
            await Booking.findByIdAndUpdate(booking._id, {
                status: 'Cancelled',
                verifiedAt: new Date(),
                verificationToken: null,
                verificationExpiry: null
            });
            
            return res.json({ msg: 'Booking cancelled successfully' });
        }
        
        // Customer confirmed the booking
        const updatedBooking = await Booking.findByIdAndUpdate(
            booking._id,
            {
                status: 'Confirmed',
                verifiedAt: new Date(),
                verificationToken: null,
                verificationExpiry: null
            },
            { new: true }
        );
        
        console.log(`Custom booking ${booking._id} confirmed by customer`);
        
        res.json({ 
            msg: 'Booking confirmed successfully! You will receive a confirmation email shortly.',
            booking: updatedBooking
        });
    } catch (err) {
        console.error('Error verifying custom booking:', err);
        res.status(500).json({ msg: 'Server error while verifying booking.' });
    }
});

module.exports = router;
