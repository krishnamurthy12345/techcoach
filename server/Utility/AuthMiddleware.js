const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authMiddleware = (req, res, next) => {
    // console.log('req.headers :', req.headers.authorization);
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('Authorization header missing or invalid');
        }

        const token = authHeader.split(' ')[1];
        // console.log(token);

        if (!token) {
            throw new Error('Authentication failed');
        }
        const verified = jwt.verify(token, JWT_SECRET_KEY);
        req.user = verified;
        // console.log(req.user, "jkdhvjkdhvjkhdk");
        next();
    } catch (err) {
        console.error('Error verifying token:', err);
        res.status(400).send({ message: 'Invalid token !' });
    }
};

module.exports = authMiddleware;