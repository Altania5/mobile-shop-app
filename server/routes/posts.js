const router = require('express').Router();
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const slugify = require('slugify');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'blog-hero-images' }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

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
      title,
      content,
      summary,
      allowLikes: String(allowLikes) !== 'false',
      allowComments: String(allowComments) !== 'false',
      author: req.user?.id,
      slug: slugify(title, { lower: true, strict: true })
    };

    if (!newPostData.author) {
      return res.status(401).json({ msg: 'User authentication required.' });
    }

    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file);
        newPostData.heroImage = uploadResult.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        return res.status(500).json({ error: 'Failed to upload hero image.' });
      }
    }

    const newPost = new Post(newPostData);
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    console.error('Error creating post:', err);
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'A post with this title already exists. Please choose a different title.' });
    }
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
            allowLikes: String(allowLikes) !== 'false',
            allowComments: String(allowComments) !== 'false',
            slug: slugify(title, { lower: true, strict: true })
        };

        if (req.file) {
            try {
                const uploadResult = await uploadToCloudinary(req.file);
                updatedData.heroImage = uploadResult.secure_url;
            } catch (uploadErr) {
                console.error('Cloudinary upload error:', uploadErr);
                return res.status(500).json({ error: 'Failed to upload hero image.' });
            }
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
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ msg: 'User authentication required.' });
    }

    const alreadyLiked = post.likes.some((id) => id.toString() === userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();
    await post.populate('likes', 'firstName lastName');
    res.json(post.likes.map((like) => like._id ? like._id.toString() : like.toString()));
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
