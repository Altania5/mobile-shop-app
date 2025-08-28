const router = require('express').Router();
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const slugify = require('slugify');

// --- GET ALL POSTS (Public) ---
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate('author', 'firstName lastName');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GET SINGLE POST by SLUG (Public) ---
router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).populate('author', 'firstName lastName');
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CREATE NEW POST (Admin Only) ---
router.post('/', [auth, adminAuth, upload.single('heroImage')], async (req, res) => {
  try {
    const { title, content, summary, allowLikes, allowComments } = req.body;
    if (!title || !content) {
      return res.status(400).json({ msg: 'Please enter title and content.' });
    }
    const newPostData = {
      title, content, summary, allowLikes, allowComments,
      author: req.user, 
      slug: slugify(title, { lower: true, strict: true }),
    };
    if (req.file) {
      newPostData.heroImage = `/uploads/${req.file.filename}`;
    }
    const newPost = new Post(newPostData);
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ error: 'Server error while creating post.' });
  }
});

// --- UPDATE POST (Admin Only) ---
router.put('/:id', [auth, adminAuth, upload.single('heroImage')], async (req, res) => {
    try {
        const { title, content, summary, allowLikes, allowComments } = req.body;
        const updatedData = {
            title,
            content,
            summary,
            allowLikes,
            allowComments,
            slug: slugify(title, { lower: true, strict: true })
        };

        if (req.file) {
            updatedData.heroImage = `/uploads/${req.file.filename}`;
        }

        const updatedPost = await Post.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        if (!updatedPost) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.json(updatedPost);
    } catch (err) {
        res.status(500).json({ error: 'Server error while updating post.' });
    }
});


// --- LIKE/UNLIKE A POST (Authenticated Users) ---
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    if (post.likes.includes(req.user)) {
      post.likes = post.likes.filter(userId => userId.toString() !== req.user);
    } else {
      post.likes.push(req.user);
    }
    await post.save();
    res.json(post.likes);
  } catch (err) {
    res.status(500).json({ error: 'Server error while updating likes.' });
  }
});

// --- GET COMMENTS FOR A POST (Public) ---
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'firstName lastName')
      .sort({ createdAt: 'desc' });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching comments.' });
  }
});

// --- DELETE POST (Admin Only) ---
router.delete('/:id', [auth, adminAuth], async (req, res) => {
    try {
        // THE FIX: Changed from post.remove() to Post.findByIdAndDelete()
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        // Note: This doesn't delete the associated image file from storage.
        res.json({ msg: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error while deleting post.' });
    }
});

module.exports = router;
