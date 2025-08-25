const router = require('express').Router();
let Post = require('../models/post.model');

// @route   GET /api/posts
// @desc    Get all blog posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/posts/:slug
// @desc    Get a single post by its slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;