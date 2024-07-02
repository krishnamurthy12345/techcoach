const getConnection = require('../Models/database');
const crypto = require('crypto');

const PUBLIC_KEY = process.env.PUBLIC_KEY;

const createUserKey = async (req, res, next) => {
    // console.log('Request User Id:', req.user.email);

    try {
        const conn = await getConnection();
        const [userData] = await conn.query('SELECT displayName, email FROM techcoach_lite.techcoach_task WHERE email = ?', req.user.email);
        // console.log('assss', userData);
        if (conn) { conn.release(); }

        if (!userData || userData.length === 0) {
            throw new Error('User not found');
        }

        const user = userData;
        // console.log("dataaa", user);
        const keyData = undefined + user.displayName + user.email;

        // console.log("dataaaa", keyData);   

        function encryptText(text, key) {
            const cipher = crypto.createCipher('aes-256-cbc', key);
            let encryptedText = cipher.update(text, 'utf8', 'hex');
            encryptedText += cipher.final('hex');
            return encryptedText;
        }

        const encryptedKey = encryptText(keyData, PUBLIC_KEY);
        // console.log('Encrypted key using username, email, id:', encryptedKey);

        req.user.key = encryptedKey;
        // console.log('Ukkkkkkkkkkkkkkser:', req.user.key);
        next();
    } catch (error) {
        console.error('Error creating user key:', error);
        res.status(500).json({ error: 'An error occurred while creating user key' });
    }
};

module.exports = createUserKey;


