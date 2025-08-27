// server/routes/comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const auth = require('../middleware/auth');

// POST a new comment (Logged-in users)
router.post('/:postId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post || !post.commentsEnabled) {
            return res.status(400).json({ msg: 'Comments are not enabled for this post.' });
        }

        const newComment = new Comment({
            text: req.body.text,
            post: req.params.postId,
            user: req.user.id
        });

        const comment = await newComment.save();
        res.json(comment);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;