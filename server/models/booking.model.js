const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  service: { type: Schema.Types.ObjectId, ref: 'Service', required: false },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  date: { type: Date, required: true },
  // ADDED: Time slot for the appointment
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Pending Verification', 'Pending Customer Verification'],
    default: 'Pending'
  },
  serviceStatus: { type: String, default: '' },
  clientFirstName: { type: String, required: true },
  clientLastName: { type: String, required: true },
  vehicleMake: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  vehicleYear: { type: Number, required: true },
  vehicleColor: { type: String, required: true },
  notes: { type: String, trim: true },
  
  // Custom booking fields
  createdByAdmin: { type: Boolean, default: false },
  requiresCustomerVerification: { type: Boolean, default: false },
  isCustomService: { type: Boolean, default: false },
  customServiceName: { type: String, trim: true },
  customServicePrice: { type: Number },
  duration: { type: Number, default: 60 },
  assignedAt: { type: Date },
  verificationToken: { type: String },
  verificationExpiry: { type: Date },
  verifiedAt: { type: Date }
}, {
  timestamps: true,
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;