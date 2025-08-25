const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serviceSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  // ADDED: Availability fields for the admin to set
  availableDays: { // Store days of the week, e.g., ["Monday", "Tuesday"]
    type: [String],
    default: []
  },
  availableTimes: { // Store time slots, e.g., ["09:00", "11:00", "14:00"]
    type: [String],
    default: []
  }
}, {
  timestamps: true,
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;