const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serviceSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: { // Duration in minutes
    type: Number,
    required: true
  }
}, {
  timestamps: true,
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;