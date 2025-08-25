const router = require('express').Router();
let Testimonial = require('../models/testimonial.model');
const adminAuth = require('../middleware/adminAuth');

// @route   GET /api/testimonials
// @desc    Get all testimonials
// @access  Public
router.get('/', async (req, res) => {
  try {
    // In a real app, you might filter for only approved testimonials
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/testimonials
// @desc    Create a new testimonial
// @access  Admin
router.post('/', adminAuth, async (req, res) => {
  try {
    const { quote, author, rating } = req.body;
    if (!quote || !author || !rating) {
      return res.status(400).json({ msg: 'Please enter all fields.' });
    }
    const newTestimonial = new Testimonial({ quote, author, rating });
    const savedTestimonial = await newTestimonial.save();
    res.status(201).json(savedTestimonial);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route   DELETE /api/testimonials/:id
// @desc    Delete a testimonial
// @access  Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const deletedTestimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!deletedTestimonial) return res.status(404).json({ msg: 'Testimonial not found' });
    res.json({ msg: 'Testimonial deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;