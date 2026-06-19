const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const token = req.cookies?.jwt;

    if (!token) {
        return res.status(401).json({ msg: 'Not authenticated' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        if (!req.user?.id) {
            return res.status(401).json({ msg: 'Token is invalid' });
        }

        next();
    } catch {
        res.status(401).json({ msg: 'Session expired. Please log in again.' });
    }
}

module.exports = auth;
