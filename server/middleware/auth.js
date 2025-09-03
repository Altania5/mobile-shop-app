const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.user && decoded.user.id) {
            req.user = decoded.user;
        } else if (decoded.id) {
            req.user = decoded;
        } else {
            return res.status(400).json({ msg: 'Token is not valid (missing user ID)' });
        }

        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
}

module.exports = auth;