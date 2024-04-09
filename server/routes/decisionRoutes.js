const express = require('express');
const jwt = require('jsonwebtoken');
const getConnection = require('../Models/database');
const { postInfo, getallInfo, getInfo, putInfo, deleteInfo,getall } = require('../Controllers/decisionControllers');

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
        console.log(req.user,"jkdhvjkdhvjkhdk")
        next();
    } catch (err) {
        console.error('Error verifying token:', err);
        res.status(400).send({ message: 'Invalid token !' });

    }
};


router.use(authMiddleware);

router.get('/',getall)
router.post('/details', postInfo);
router.get('/details', getallInfo);
router.get('/details/:id', getInfo);
router.put('/details/:id', putInfo);
router.delete('/details/:id', deleteInfo);

module.exports = router;
