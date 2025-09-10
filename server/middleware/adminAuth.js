const auth = require('./auth');
const User = require('../models/user.model');

const adminAuth = (req, res, next) => {
    auth(req, res, async () => {
        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({ msg: 'User not found.' });
            }

            if ((user.role && user.role.trim() === 'admin') || user.isAdmin === true) {
                console.log('Admin access confirmed. Granting access.');
                next();
            } else {
                console.log(`Admin access denied. User role: '${user.role}', isAdmin: ${user.isAdmin}`);
                return res.status(401).json({ msg: 'Admin authorization denied.' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
};

module.exports = adminAuth;