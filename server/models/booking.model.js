const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  notes: { type: String, trim: true }
}, {
  timestamps: true,
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;