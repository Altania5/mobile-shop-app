const router = require('express').Router();
let Post = require('../models/post.model');
const adminAuth = require('../middleware/adminAuth');
const slugify = require('slugify');

// @route   POST /api/posts
// @desc    Create a new blog post
// @access  Admin
router.post('/', adminAuth, async (req, res) => {
  try {
    const { title, content, author } = req.body;
    if (!title || !content) {
      return res.status(400).json({ msg: 'Title and content are required.' });
    }
    // Generate a unique slug
    let postSlug = slugify(title, { lower: true, strict: true });
    const existingPost = await Post.findOne({ slug: postSlug });
    if (existingPost) {
        postSlug = `${postSlug}-${Date.now()}`; // Add timestamp to ensure uniqueness
    }

    const newPost = new Post({ title, content, author, slug: postSlug });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a blog post
// @access  Admin
router.put('/:id', adminAuth, async (req, res) => {
    try {
      const { title, content } = req.body;
      // We don't update the slug on edit to avoid breaking old links
      const updatedPost = await Post.findByIdAndUpdate(req.params.id, { title, content }, { new: true });
      if (!updatedPost) return res.status(404).json({ msg: 'Post not found' });
      res.json(updatedPost);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

// @route   DELETE /api/posts/:id
// @desc    Delete a blog post
// @access  Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) return res.status(404).json({ msg: 'Post not found' });
    res.json({ msg: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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