const auth = require('./auth');
const User = require('../models/user.model');

const adminAuth = (req, res, next) => {
    auth(req, res, async () => {
        try {
            const user = await User.findById(req.user);

            if (!user) {
                return res.status(404).json({ msg: 'User not found.' });
            }

            if (user.role && user.role.trim() === 'admin') {
                console.log('Admin role confirmed. Granting access.');
                next();
            } else {
                console.log(`Admin role check failed. User role is: '${user.role}'`);
                return res.status(401).json({ msg: 'Admin authorization denied.' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
};

module.exports = adminAuth;