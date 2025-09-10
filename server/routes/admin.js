const router = require('express').Router();
const User = require('../models/user.model');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const bcrypt = require('bcryptjs');

// TEST ROUTE - to verify admin routes are working
router.get('/test', (req, res) => {
    res.json({ msg: 'Admin routes are working!' });
});

// GET ALL USERS (For admin use)
router.get('/users', [auth, adminAuth], async (req, res) => {
    try {
        console.log('Admin users route called by user:', req.user?.id);
        const users = await User.find({}, '-password')
            .sort({ createdAt: -1 });

        console.log(`Found ${users.length} users`);
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ msg: 'Server error while fetching users.' });
    }
});

// CREATE NEW CUSTOMER (Admin only)
router.post('/create-customer', [auth, adminAuth], async (req, res) => {
    try {
        const { firstName, lastName, email, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'A user with this email already exists.' });
        }

        // Generate a temporary password (customer will need to reset it)
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone: phone || '',
            isAdmin: false,
            needsPasswordReset: true,
            createdByAdmin: true
        });

        const savedUser = await newUser.save();

        // Remove password from response
        const userResponse = savedUser.toObject();
        delete userResponse.password;

        console.log(`New customer created by admin: ${email}`);
        
        // TODO: Send welcome email with password reset instructions

        res.status(201).json({
            msg: 'Customer created successfully',
            user: userResponse,
            tempPassword: tempPassword // Only for admin to see initially
        });
    } catch (err) {
        console.error('Error creating customer:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: 'Please fill out all required fields.', details: err.errors });
        }
        res.status(500).json({ msg: 'Server error while creating customer.' });
    }
});

// GET USER BY ID (Admin only)
router.get('/users/:id', [auth, adminAuth], async (req, res) => {
    try {
        const user = await User.findById(req.params.id, '-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ msg: 'Server error while fetching user.' });
    }
});

// UPDATE USER (Admin only)
router.patch('/users/:id', [auth, adminAuth], async (req, res) => {
    try {
        const { firstName, lastName, email, phone, isAdmin } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { firstName, lastName, email, phone, isAdmin },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({ msg: 'User updated successfully', user: updatedUser });
    } catch (err) {
        console.error('Error updating user:', err);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Email already exists' });
        }
        res.status(500).json({ msg: 'Server error while updating user.' });
    }
});

// DELETE USER (Admin only)
router.delete('/users/:id', [auth, adminAuth], async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ msg: 'Server error while deleting user.' });
    }
});

module.exports = router;
