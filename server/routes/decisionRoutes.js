const express = require('express');
const jwt = require('jsonwebtoken');
const getConnection = require('../Models/database');
const { postInfo, getallInfo, getInfo, putInfo, deleteInfo } = require('../Controllers/decisionControllers');

const router = express.Router();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authMiddleware = (req, res, next) => {
    console.log('req.headers :', req.headers.authorization);
    try {
        const token = req.headers.authorization.split(' ')[1];
        console.log(token);

        if (!token) {
            throw new Error('Authentication failed');
        }
        const verified = jwt.verify(token, "111")
        req.user = verified;
        next();
    } catch (err) {
        console.error('Error verifying token:', err);
        res.status(400).send({ message: 'Invalid token !' });

    }
};

// const authorizationToken = (req, res, next) => {
//     const authHeader = req.headers['authorizationToken']
//     const token = authHeader && authHeader.split(' ')[1];
//     if (!token)
//         return res.sendstatus(401);
//     jwt.verify(token, JWT_SECRET_KEY),
//         (err, user) => {
//             if (err) {
//                 return res.sendstatus(403);
//             }
//             req.user = user;
//             next()
//         }
// }


router.use(authMiddleware);

router.post('/details', postInfo);
router.get('/details', getallInfo);
router.get('/details/:id', getInfo);
router.put('/details/:id', putInfo);
router.delete('/details/:id', deleteInfo);

module.exports = router;
