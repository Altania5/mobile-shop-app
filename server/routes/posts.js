// server/routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload'); // Assuming your upload middleware is here

// GET all posts (public)
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'firstName lastName')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET single post by ID (public)
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'firstName lastName');
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        const comments = await Comment.find({ post: post._id }).populate('user', 'firstName lastName').sort({ createdAt: -1 });
        
        res.json({ post, comments });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});


// POST a new blog post (Admin Only)
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
    const { title, content, commentsEnabled } = req.body;
    try {
        const newPost = new Post({
            title,
            content,
            commentsEnabled: commentsEnabled === 'true',
            author: req.user.id,
            imageUrl: req.file ? req.file.path : null
        });
        const post = await newPost.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT (Update) a post (Admin Only)
// (For simplicity, this example doesn't handle image updates, but it could be added)
router.put('/:id', adminAuth, async (req, res) => {
    const { title, content, commentsEnabled } = req.body;
    try {
        let post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        post.title = title;
        post.content = content;
        post.commentsEnabled = commentsEnabled;
        
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});


// DELETE a post (Admin Only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        await Comment.deleteMany({ post: req.params.id });
        res.json({ msg: 'Post and associated comments removed' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});


// PUT Like/Unlike a post (Logged-in users)
router.put('/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // Check if the post has already been liked by this user
        if (post.likes.some(like => like.equals(req.user.id))) {
            // If yes, remove the like (unlike)
            post.likes = post.likes.filter(like => !like.equals(req.user.id));
        } else {
            // If no, add the like
            post.likes.push(req.user.id);
        }
        await post.save();
        res.json(post.likes);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;