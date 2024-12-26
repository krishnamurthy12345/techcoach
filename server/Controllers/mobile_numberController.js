const getConnection = require('../Models/database');

const postMobileInfo = async (req, res) => {
    const { mobile_number } = req.body; 
    let conn;
    try {
        conn = await getConnection();
        const userId = req.user.id; 

        const existingNumber = await conn.query(
            'SELECT * FROM techcoach_lite.techcoach_mobile_number_info WHERE user_id = ?',
            [userId]
        );

        if (existingNumber.length > 0) {
            return res.status(400).json({ message: 'Mobile number already exists for this user' });
        }

        const result = await conn.query(
            'INSERT INTO techcoach_lite.techcoach_mobile_number_info (user_id, mobile_number) VALUES (?, ?)',
            [userId, mobile_number]
        );

        const resultId = result.insertId.toString();

        return res.status(201).json({ message: 'Mobile number saved successfully', id: resultId });
    } catch (error) {
        console.error('Error posting the mobile number:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        if (conn) conn.release();
    }
};


const getMobileInfo = async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const userId = req.user.id; 

        const mobileInfo = await conn.query(
            'SELECT mobile_number FROM techcoach_lite.techcoach_mobile_number_info WHERE user_id = ?',
            [userId]
        );

        if (mobileInfo.length === 0) {
            return res.status(404).json({ message: 'No mobile number found for this user' });
        }

        return res.status(200).json({ mobile_number: mobileInfo[0].mobile_number });
    } catch (error) {
        console.error('Error fetching the mobile number:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        if (conn) conn.release();
    }
};


module.exports = { postMobileInfo,getMobileInfo}