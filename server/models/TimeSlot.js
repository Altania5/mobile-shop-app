const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timeSlotSchema = new Schema({
  service: { 
    type: Schema.Types.ObjectId, 
    ref: 'Service', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  isBooked: { 
    type: Boolean, 
    default: false 
  },
  booking: { 
    type: Schema.Types.ObjectId, 
    ref: 'Booking',
    default: null
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // Recurring time slots
  isRecurring: { 
    type: Boolean, 
    default: false 
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'none'],
    default: 'none'
  },
  recurringEndDate: {
    type: Date,
    default: null
  },
  // Notes for admin reference
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true,
});

// Compound index to ensure no duplicate time slots for the same service, date, and time
timeSlotSchema.index({ service: 1, date: 1, time: 1 }, { unique: true });

// Index for efficient queries
timeSlotSchema.index({ service: 1, date: 1, isAvailable: 1 });
timeSlotSchema.index({ date: 1, isAvailable: 1 });

// Method to check if slot is bookable
timeSlotSchema.methods.isBookable = function() {
  return this.isAvailable && !this.isBooked;
};

// Static method to find available slots for a service on a date
timeSlotSchema.statics.findAvailableSlots = function(serviceId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    service: serviceId,
    date: { $gte: startOfDay, $lte: endOfDay },
    isAvailable: true,
    isBooked: false
  }).sort({ time: 1 });
};

// Static method to create recurring time slots
timeSlotSchema.statics.createRecurringSlots = async function(slotData) {
  const slots = [];
  const { service, time, recurringPattern, recurringEndDate, createdBy, notes } = slotData;
  
  let currentDate = new Date(slotData.date);
  const endDate = new Date(recurringEndDate);
  
  while (currentDate <= endDate) {
    try {
      const slot = new this({
        service,
        date: new Date(currentDate),
        time,
        isRecurring: true,
        recurringPattern,
        recurringEndDate,
        createdBy,
        notes
      });
      
      await slot.save();
      slots.push(slot);
    } catch (error) {
      // Skip duplicate slots (already exists for this date/time/service)
      if (error.code !== 11000) {
        console.error('Error creating recurring slot:', error);
      }
    }
    
    // Increment date based on pattern
    switch (recurringPattern) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      default:
        return slots; // Single slot only
    }
  }
  
  return slots;
};

// Method to mark slot as booked
timeSlotSchema.methods.markAsBooked = async function(bookingId) {
  this.isBooked = true;
  this.booking = bookingId;
  return await this.save();
};

// Method to mark slot as available (cancel booking)
timeSlotSchema.methods.markAsAvailable = async function() {
  this.isBooked = false;
  this.booking = null;
  return await this.save();
};

const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);

module.exports = TimeSlot;
