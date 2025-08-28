const router = require('express').Router();
let Testimonial = require('../models/testimonial.model');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

// @route   GET /api/testimonials
// @desc    Get all testimonials
// @access  Public
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/testimonials
// @desc    Create a new testimonial
// @access  Admin
router.post('/', auth, (req, res) => {
  // Create the upload middleware for a single file.
  // Replace 'profileImage' with the name of your file input field.
  const profileImageUpload = upload.single('profileImage');

  profileImageUpload(req, res, async (err) => {
    if (err) {
      // Handle Multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ msg: 'File size is too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ msg: err });
    }

    const { serviceId, quote, rating } = req.body;
    if (!serviceId || !quote || !rating) {
      return res.status(400).json({ msg: 'Please enter all required fields.' });
    }

    try {
      const newTestimonial = new Testimonial({
        quote,
        rating,
        service: serviceId,
        author: req.user,
        profileImageUrl: req.file ? req.file.path : ''
      });

      const savedTestimonial = await newTestimonial.save();
      res.status(201).json(savedTestimonial);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
});

router.put('/:id/author', adminAuth, async (req, res) => {
  try {
    const { authorName } = req.body;
    if (!authorName) {
      return res.status(400).json({ msg: 'Author name is required.' });
    }

    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ msg: 'Testimonial not found.' });
    }

    testimonial.authorName = authorName;
    testimonial.author = undefined; 

    const savedTestimonial = await testimonial.save();
    
    res.json(savedTestimonial);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/vote', auth, async (req, res) => {
    try {
        const { voteType } = req.body; // 'like' or 'dislike'
        const testimonial = await Testimonial.findById(req.params.id);

        if (!testimonial) return res.status(404).json({ msg: 'Testimonial not found.' });

        const userId = req.user;
        // Remove user from both arrays to reset their vote
        testimonial.likes = testimonial.likes.filter(id => id.toString() !== userId);
        testimonial.dislikes = testimonial.dislikes.filter(id => id.toString() !== userId);

        // Add user to the correct array based on their new vote
        if (voteType === 'like') {
            testimonial.likes.push(userId);
        } else if (voteType === 'dislike') {
            testimonial.dislikes.push(userId);
        }

        await testimonial.save();
        res.json(testimonial);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/comment', adminAuth, async (req, res) => {
    try {
        const { content } = req.body;
        const testimonial = await Testimonial.findById(req.params.id);

        if (!testimonial) return res.status(404).json({ msg: 'Testimonial not found.' });
        
        const newComment = { content: content }; // Author defaults to 'Shop Owner'
        testimonial.comments.push(newComment);

        await testimonial.save();
        res.json(testimonial);
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

// @route   GET /api/testimonials/featured
// @desc    Get a few random, high-rated testimonials
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    // Find testimonials with a rating of 4 or higher
    const candidates = await Testimonial.find({ rating: { $gte: 4 } })
                                        .populate('author', 'firstName lastName');
    
    // Shuffle the candidates and pick up to 3
    const shuffled = candidates.sort(() => 0.5 - Math.random());
    const featured = shuffled.slice(0, 3);
    
    res.json(featured);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;