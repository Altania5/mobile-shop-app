const router = require('express').Router();
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    
    try {
        // Check if user already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }
        
        // Create new user with verification token
        const user = new User({
            firstName,
            lastName,
            email,
            password
        });
        
        // Generate email verification token
        const verificationToken = user.generateEmailVerificationToken();
        
        // Save user
        await user.save();
        
        // Send verification email
        const { sendVerificationEmail } = require('../services/emailVerificationService');
        await sendVerificationEmail(user, verificationToken);
        
        res.status(201).json({ 
            msg: 'Registration successful! Please check your email to verify your account.' 
        });
        
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }
        res.status(500).json({ msg: 'Server error during registration' });
    }
});

// @route   GET /api/users/verify-email/:token
// @desc    Verify user's email address
// @access  Public
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        // Find user with matching token that hasn't expired
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ msg: 'Invalid or expired verification token' });
        }
        
        // Update user verification status
        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        
        await user.save();
        
        // Send welcome email
        const { sendWelcomeEmail } = require('../services/emailVerificationService');
        await sendWelcomeEmail(user);
        
        res.json({ msg: 'Email verified successfully! Welcome to MobileTech Solutions.' });
        
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error during verification' });
    }
});

// @route   POST /api/users/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ msg: 'Email is required' });
        }
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        if (user.isEmailVerified) {
            return res.status(400).json({ msg: 'Email is already verified' });
        }
        
        // Generate new verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save();
        
        // Resend verification email
        const { sendVerificationEmail } = require('../services/emailVerificationService');
        await sendVerificationEmail(user, verificationToken);
        
        res.json({ msg: 'Verification email sent! Please check your inbox.' });
        
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error while resending verification' });
    }
});

// @route   POST api/users/login
// @desc    Authenticate user
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'User does not exist' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        // *** THE FIX: Create a payload with a 'user' object inside ***
        // This matches what the auth.js middleware expects.
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );
    } catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
});


// @route   GET /api/users/me
// @desc    Get current user's data
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const userResponse = user.toObject();
        // Temporary bypass for testing - always return true for hasCardOnFile
        // TODO: Remove this bypass when Square payment is fully configured
        userResponse.hasCardOnFile = true; // !!user.squareCustomerId;
        res.json(userResponse);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/users/change-password
// @desc    Change user's password
// @access  Private
router.post('/change-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect current password.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ msg: 'New password must be at least 6 characters long.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });

        res.json({ msg: 'Password updated successfully.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET /api/users
// @desc    Get all users (for admin)
// @access  Admin
router.get('/', adminAuth, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;