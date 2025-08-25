const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// We'll define a sub-schema for comments from the admin
const commentSchema = new Schema({
  author: {
    type: String,
    required: true,
    default: 'Shop Owner'
  },
  content: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const testimonialSchema = new Schema({
  // Link the author to a specific user account
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // We'll link this to the service the user is reviewing
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  quote: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  // Store the path to an uploaded image
  profileImageUrl: {
    type: String,
    default: ''
  },
  // Store arrays of user IDs for likes/dislikes
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Store nested comments from the admin
  comments: [commentSchema]
}, {
  timestamps: true,
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = Testimonial;