const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const adminAuth = async (req, res, next) => {
  try {
    // The 'auth' middleware has already run and placed the user ID on req.user
    if (!req.user) {
      return res.status(401).json({ msg: 'Authentication error, user not found.' });
    }

    // THE FIX: Find the user by the ID directly from req.user,
    // not req.user.id, because req.user is just the ID string.
    const user = await User.findById(req.user);

    if (!user) {
      return res.status(401).json({ msg: 'Authentication error, user not found in database.' });
    }

    // Check if the user has the 'admin' role
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. User is not an admin.' });
    }

    // If the user is an admin, proceed to the next middleware or route handler
    next();

  } catch (err) {
    console.error('Admin Auth Error:', err.message);
    res.status(500).json({ error: 'Server error during admin authentication.' });
  }
};

module.exports = adminAuth;