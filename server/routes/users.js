const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
let User = require('../models/user.model');

// --- REGISTRATION ---
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters.' });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ msg: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });

    const savedUser = await newUser.save();
    res.json(savedUser);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields.' });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      // Use a generic message to prevent exposing whether an email exists
      return res.status(400).json({ msg: 'Invalid credentials. Please try again.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials. Please try again.' });
    }

    // --- START: The Fix - More Robust Token Creation ---
    if (!process.env.JWT_SECRET) {
        console.error('FATAL ERROR: JWT_SECRET is not defined in the .env file.');
        return res.status(500).json({ msg: 'Server configuration error.' });
    }

    const token = jwt.sign(
      { id: user._id, firstName: user.firstName, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '5h' } // It's good practice to add an expiration
    );
    // --- END: The Fix ---

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    // This will now log the specific error to your server's console
    console.error('Login Error:', err.message);
    res.status(500).json({ msg: 'A server error occurred during login.' });
  }
});

module.exports = router;