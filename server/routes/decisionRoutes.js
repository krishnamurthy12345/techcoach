const express = require('express');
const jwt = require('jsonwebtoken');
const getConnection = require('../Models/database');
const crypto = require('crypto');
const { postInfo, getallInfo, getInfo, putInfo, deleteInfo, getall } = require('../Controllers/decisionControllers');

const router = express.Router();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const PUBLIC_KEY = process.env.PUBLIC_KEY;

const authMiddleware = (req, res, next) => {
    console.log('req.headers :', req.headers.authorization);
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('Authorization header missing or invalid');
        }

        const token = authHeader.split(' ')[1];
        console.log(token);

        if (!token) {
            throw new Error('Authentication failed');
        }
        const verified = jwt.verify(token, JWT_SECRET_KEY)
        req.user = verified;
        console.log(req.user, "jkdhvjkdhvjkhdk")
        next();
    } catch (err) {
        console.error('Error verifying token:', err);
        res.status(400).send({ message: 'Invalid token !' });

    }
};

const createUserKey = async (req, res, next) => {
    console.log('Request User Id:', req.user.email);

    try {
        const conn = await getConnection();
        const userData = await conn.query('SELECT displayName, email FROM techcoach_lite.techcoach_task WHERE email = ?', req.user.email);
        console.log('assss',userData);


        if (!userData || userData.length === 0) {
            throw new Error('User not found');
        }

        const user = userData[0];
        const keyData = user.id + user.displayName + user.email;

        function encryptText(text, key) {
            const cipher = crypto.createCipher('aes-256-cbc', key);
            let encryptedText = cipher.update(text, 'utf8', 'hex');
            encryptedText += cipher.final('hex');
            return encryptedText;
        }

        const encryptedKey = encryptText(keyData, PUBLIC_KEY);
        // console.log('Encrypted key using username, email, id:', encryptedKey);

        req.user.key = encryptedKey;
        console.log('Ukkkkkkkkkkkkkkser:', req.user.key);
        next();
    } catch (error) {
        console.error('Error creating user key:', error);
        res.status(500).json({ error: 'An error occurred while creating user key' });
    }
};

router.use(authMiddleware);
router.use(createUserKey);

router.get('/', getall)
router.post('/details', postInfo);
router.get('/details', getallInfo);
router.get('/details/:id', getInfo);
router.put('/details/:id', putInfo);
router.delete('/details/:id', deleteInfo);

module.exports = router;
