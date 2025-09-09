const router = require('express').Router();
const TimeSlot = require('../models/TimeSlot');
const Service = require('../models/service.model');
const Booking = require('../models/booking.model');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { startOfDay, endOfDay, addDays, format } = require('date-fns');

// @route   GET /api/timeslots
// @desc    Get time slots with filtering options
// @access  Admin
router.get('/', adminAuth, async (req, res) => {
  try {
    const { 
      serviceId, 
      date, 
      startDate, 
      endDate, 
      isAvailable, 
      isBooked,
      limit = 50,
      page = 1
    } = req.query;

    const query = {};
    
    if (serviceId) query.service = serviceId;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    if (isBooked !== undefined) query.isBooked = isBooked === 'true';
    
    if (date) {
      const selectedDate = new Date(date);
      query.date = {
        $gte: startOfDay(selectedDate),
        $lte: endOfDay(selectedDate)
      };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startOfDay(new Date(startDate));
      if (endDate) query.date.$lte = endOfDay(new Date(endDate));
    }

    const skip = (page - 1) * limit;
    
    const timeSlots = await TimeSlot.find(query)
      .populate('service', 'name description')
      .populate('booking', 'clientFirstName clientLastName')
      .populate('createdBy', 'firstName lastName')
      .sort({ date: 1, time: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await TimeSlot.countDocuments(query);
    
    res.json({
      timeSlots,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Error fetching time slots:', err);
    res.status(500).json({ msg: 'Server error while fetching time slots' });
  }
});

// @route   GET /api/timeslots/available/:serviceId
// @desc    Get available time slots for a service on a specific date
// @access  Public
router.get('/available/:serviceId', async (req, res) => {
  try {
    const { date } = req.query;
    const { serviceId } = req.params;
    
    if (!date) {
      return res.status(400).json({ msg: 'Date query parameter is required' });
    }

    // First, try to find time slots in the new system
    const availableSlots = await TimeSlot.findAvailableSlots(serviceId, date);
    
    if (availableSlots.length > 0) {
      const times = availableSlots.map(slot => slot.time);
      return res.json(times);
    }
    
    // Fallback to the old system for backward compatibility
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }

    const selectedDate = new Date(date);
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);

    const bookingsOnDate = await Booking.find({
      service: serviceId,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $nin: ['Cancelled'] }
    });

    const bookedTimes = bookingsOnDate.map(booking => booking.time);
    const availableTimes = service.availableTimes.filter(time => !bookedTimes.includes(time));

    res.json(availableTimes);
  } catch (err) {
    console.error('Error fetching available time slots:', err);
    res.status(500).json({ msg: 'Server error while fetching available time slots' });
  }
});

// @route   POST /api/timeslots
// @desc    Create new time slot(s)
// @access  Admin
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      serviceId,
      date,
      time,
      isRecurring = false,
      recurringPattern = 'none',
      recurringEndDate,
      notes = ''
    } = req.body;

    // Validate required fields
    if (!serviceId || !date || !time) {
      return res.status(400).json({ 
        msg: 'Service ID, date, and time are required' 
      });
    }

    // Verify service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }

    const slotData = {
      service: serviceId,
      date,
      time,
      createdBy: req.user.id,
      notes,
      isRecurring,
      recurringPattern: isRecurring ? recurringPattern : 'none',
      recurringEndDate: isRecurring ? recurringEndDate : null
    };

    let slots;
    
    if (isRecurring && recurringPattern !== 'none') {
      slots = await TimeSlot.createRecurringSlots(slotData);
    } else {
      const slot = new TimeSlot(slotData);
      await slot.save();
      slots = [slot];
    }

    res.status(201).json({
      msg: `${slots.length} time slot(s) created successfully`,
      slots
    });
    
  } catch (err) {
    console.error('Error creating time slot:', err);
    if (err.code === 11000) {
      return res.status(400).json({ 
        msg: 'Time slot already exists for this service, date, and time' 
      });
    }
    res.status(500).json({ msg: 'Server error while creating time slot' });
  }
});

// @route   POST /api/timeslots/bulk
// @desc    Create multiple time slots at once
// @access  Admin
router.post('/bulk', adminAuth, async (req, res) => {
  try {
    const {
      serviceId,
      dates,
      times,
      notes = ''
    } = req.body;

    if (!serviceId || !dates || !times || dates.length === 0 || times.length === 0) {
      return res.status(400).json({ 
        msg: 'Service ID, dates array, and times array are required' 
      });
    }

    // Verify service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }

    const slots = [];
    const errors = [];

    for (const date of dates) {
      for (const time of times) {
        try {
          const slot = new TimeSlot({
            service: serviceId,
            date,
            time,
            createdBy: req.user.id,
            notes
          });
          
          await slot.save();
          slots.push(slot);
        } catch (error) {
          if (error.code === 11000) {
            errors.push(`Slot already exists: ${date} at ${time}`);
          } else {
            errors.push(`Error creating slot ${date} at ${time}: ${error.message}`);
          }
        }
      }
    }

    res.status(201).json({
      msg: `${slots.length} time slots created successfully`,
      slots,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (err) {
    console.error('Error creating bulk time slots:', err);
    res.status(500).json({ msg: 'Server error while creating time slots' });
  }
});

// @route   PUT /api/timeslots/:id
// @desc    Update a time slot
// @access  Admin
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { isAvailable, notes } = req.body;
    
    const updateData = {};
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (notes !== undefined) updateData.notes = notes;

    const timeSlot = await TimeSlot.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('service', 'name')
     .populate('booking', 'clientFirstName clientLastName');

    if (!timeSlot) {
      return res.status(404).json({ msg: 'Time slot not found' });
    }

    res.json({ 
      msg: 'Time slot updated successfully', 
      timeSlot 
    });
    
  } catch (err) {
    console.error('Error updating time slot:', err);
    res.status(500).json({ msg: 'Server error while updating time slot' });
  }
});

// @route   DELETE /api/timeslots/:id
// @desc    Delete a time slot
// @access  Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findById(req.params.id);
    
    if (!timeSlot) {
      return res.status(404).json({ msg: 'Time slot not found' });
    }

    // Check if slot is booked
    if (timeSlot.isBooked) {
      return res.status(400).json({ 
        msg: 'Cannot delete a booked time slot. Cancel the booking first.' 
      });
    }

    await TimeSlot.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'Time slot deleted successfully' });
    
  } catch (err) {
    console.error('Error deleting time slot:', err);
    res.status(500).json({ msg: 'Server error while deleting time slot' });
  }
});

// @route   DELETE /api/timeslots/bulk
// @desc    Delete multiple time slots
// @access  Admin
router.delete('/bulk', adminAuth, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ msg: 'Array of time slot IDs is required' });
    }

    // Check for booked slots
    const bookedSlots = await TimeSlot.find({
      _id: { $in: ids },
      isBooked: true
    });

    if (bookedSlots.length > 0) {
      return res.status(400).json({ 
        msg: `Cannot delete ${bookedSlots.length} booked time slots. Cancel bookings first.`,
        bookedSlots: bookedSlots.map(slot => ({
          id: slot._id,
          date: slot.date,
          time: slot.time
        }))
      });
    }

    const result = await TimeSlot.deleteMany({
      _id: { $in: ids }
    });

    res.json({ 
      msg: `${result.deletedCount} time slots deleted successfully`,
      deletedCount: result.deletedCount
    });
    
  } catch (err) {
    console.error('Error deleting time slots:', err);
    res.status(500).json({ msg: 'Server error while deleting time slots' });
  }
});

// @route   GET /api/timeslots/statistics
// @desc    Get time slot statistics
// @access  Admin
router.get('/statistics', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate, serviceId } = req.query;
    
    const matchConditions = {};
    
    if (startDate || endDate) {
      matchConditions.date = {};
      if (startDate) matchConditions.date.$gte = new Date(startDate);
      if (endDate) matchConditions.date.$lte = endOfDay(new Date(endDate));
    }
    
    if (serviceId) matchConditions.service = serviceId;

    const statistics = await TimeSlot.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalSlots: { $sum: 1 },
          availableSlots: {
            $sum: {
              $cond: [
                { $and: ['$isAvailable', { $not: '$isBooked' }] },
                1,
                0
              ]
            }
          },
          bookedSlots: { $sum: { $cond: ['$isBooked', 1, 0] } },
          unavailableSlots: { $sum: { $cond: ['$isAvailable', 0, 1] } }
        }
      }
    ]);

    const stats = statistics[0] || {
      totalSlots: 0,
      availableSlots: 0,
      bookedSlots: 0,
      unavailableSlots: 0
    };

    // Calculate utilization rate
    stats.utilizationRate = stats.totalSlots > 0 
      ? ((stats.bookedSlots / stats.totalSlots) * 100).toFixed(2)
      : 0;

    res.json(stats);
    
  } catch (err) {
    console.error('Error fetching time slot statistics:', err);
    res.status(500).json({ msg: 'Server error while fetching statistics' });
  }
});

module.exports = router;
