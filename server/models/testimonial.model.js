const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    content: { type: String, required: true },
    author: { type: String, default: 'Shop Owner' },
    createdAt: { type: Date, default: Date.now }
});

const testimonialSchema = new Schema({
    quote: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String }, // Add this line
    service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    profileImageUrl: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);