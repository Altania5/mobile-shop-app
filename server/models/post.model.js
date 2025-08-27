const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    // In a more complex app, this would be a reference to a User
    type: String, 
    required: true,
    default: 'Shop Owner'
  },imageUrl: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    commentsEnabled: { type: Boolean, default: true },
    slug: { // For creating user-friendly URLs
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true,
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;