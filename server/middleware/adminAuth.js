const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ msg: 'No authentication token, authorization denied.' });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res.status(401).json({ msg: 'Token verification failed, authorization denied.' });
    }
    
    // Find the user and check their role
    const user = await User.findById(verified.id);
    if (user && user.role === 'admin') {
      req.user = verified.id; // Pass user id to the next middleware/route handler
      next();
    } else {
      return res.status(403).json({ msg: 'Admin access required.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = adminAuth;