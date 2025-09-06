const mongoose = require('mongoose');

const serviceHelpFormSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  generalIssue: {
    type: String,
    required: true
  },
  detailedDescription: {
    type: String,
    required: true
  },
  carMake: {
    type: String,
    required: true
  },
  carModel: {
    type: String,
    required: true
  },
  carTrim: {
    type: String
  },
  vin: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ServiceHelpForm', serviceHelpFormSchema);
