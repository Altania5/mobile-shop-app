const router = require('express').Router();
const Comment = require('../models/comment.model');
const Post = require('../models/post.model'); // This line is required
const auth = require('../middleware/auth');

// --- POST A NEW COMMENT (Authenticated Users) ---
router.post('/', auth, async (req, res) => {
  try {
    const { text, postId } = req.body;
    if (!text) {
      return res.status(400).json({ msg: 'Comment text is required.' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ msg: 'User authentication required.' });
    }

    // This block is required to validate the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found.' });
    }

    const newComment = new Comment({
      text,
      author: userId,
      post: postId,
    });

    const savedComment = await newComment.save();
    const populatedComment = await savedComment.populate('author', 'firstName lastName');

    res.status(201).json(populatedComment);
  } catch (err) {
    console.error("Comment Post Error:", err.message);
    res.status(500).json({ error: 'Server error while posting comment.' });
  }
});

module.exports = router;
