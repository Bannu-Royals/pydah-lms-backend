const jwt = require('jsonwebtoken');

const checkAdminAuth = (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if it's an admin token
        if (!decoded.admin) {
            return res.status(401).json({ msg: 'Not authorized as admin' });
        }

        req.admin = decoded.admin;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = checkAdminAuth;
