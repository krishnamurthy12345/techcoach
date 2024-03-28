const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('../Middleware/passportConfig');

const router = express.Router();

JWT_SECRET_KEY=process.env.JWT_SECRET_KEY


router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    const token = jwt.sign({ id: req.user.id, email: req.user.email }, JWT_SECRET_KEY);
    req.user.token = token;
    res.redirect(`http://localhost:3000/dashboard?token=${req.user.token}`);
});

module.exports = router;
