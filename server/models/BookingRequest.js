const mongoose = require('mongoose');

const bookingRequestSchema = new mongoose.Schema(
  {
    name:             { type: String, required: true, trim: true },
    email:            { type: String, required: true, trim: true, lowercase: true },
    phone:            { type: String, required: true, trim: true },

    vehicleYear:      { type: Number, required: true },
    vehicleMake:      { type: String, required: true, trim: true },
    vehicleModel:     { type: String, required: true, trim: true },

    service:          { type: String, required: true, trim: true },
    serviceOther:     { type: String, trim: true },

    preferredDate:    { type: Date, required: true },
    preferredTimeSlot:{
      type: String,
      required: true,
      enum: ['morning', 'afternoon', 'evening'],
    },

    serviceAddress:   { type: String, required: true, trim: true },

    // where the form was submitted from (contact / landing-brakes / etc.)
    source:           { type: String, default: 'contact' },
    status:           {
      type: String,
      enum: ['new', 'contacted', 'scheduled', 'completed', 'cancelled', 'converted', 'declined'],
      default: 'new',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);
