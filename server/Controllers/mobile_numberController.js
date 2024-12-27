const getConnection = require('../Models/database');

const postMobileInfo = async (req, res) => {
    const { mobile_number, is_whatsapp } = req.body;

    if (!mobile_number) {
        return res.status(400).json({ message: 'Mobile number is required' });
    }
    if (is_whatsapp === undefined) {
        return res.status(400).json({ message: 'is_whatsapp field is required' });
    }

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
            'INSERT INTO techcoach_lite.techcoach_mobile_number_info (user_id, mobile_number, is_whatsapp) VALUES (?, ?, ?)',
            [userId, mobile_number, is_whatsapp]
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


const postRatingInfo = async (req, res) => {
    const { decision_id, rating_score } = req.body; // Assuming 'rating' is not used; otherwise, include it.
    let conn;

    try {
        conn = await getConnection(); // Establish database connection
        const userId = req.user.id; // Get the user ID from the request (assuming middleware sets req.user)

        // Query to insert rating information
        const query = `
            INSERT INTO techcoach_lite.techcoach_decision_ratings
            (decision_id, user_id, rating_score, rating_date)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)`;

        // Execute the query
        await conn.query(query, [decision_id, userId, rating_score]);

        // Respond with success message
        return res.status(201).json({ message: 'Rating submitted successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while submitting the rating.' });
    } finally {
        if (conn) {
            conn.release(); // Ensure connection is released
        }
    }
};


module.exports = { postMobileInfo,getMobileInfo,postRatingInfo}