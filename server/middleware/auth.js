// server/middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); // Import the User model

module.exports = async function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // --- START: The Fix ---
        // Find the user by the ID from the token's payload.
        // The .select('-password') ensures the user's password hash is not included.
        req.user = await User.findById(decoded.user.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ msg: 'Token is not valid' });
        }
        // --- END: The Fix ---

        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};