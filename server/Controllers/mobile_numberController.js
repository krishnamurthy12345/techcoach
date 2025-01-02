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
    const { decision_id, rating_score } = req.body; 
    let conn;

    try {
        conn = await getConnection(); 
        const userId = req.user.id; 

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


const getRatingInfo = async (req, res) => {
    const { id } = req.params; 

    let conn;
    try {
        conn = await getConnection();
        const userId = req.user.id;

        const ratingInfo = await conn.query(
            `SELECT rating_score,decision_id,rating_date
             FROM techcoach_lite.techcoach_decision_ratings 
             WHERE user_id = ? AND decision_id = ?`,
            [userId, id]
        );

        if (ratingInfo.length === 0) {
            return res.status(404).json({ message: 'No ratings found for this user and decision.' });
        }

        return res.status(200).json({ ratings: ratingInfo });
    } catch (error) {
        console.error('Error fetching the ratings:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        if (conn) conn.release();
    }
};


const putRatingInfo = async (req, res) => {
    const { rating_score } = req.body; 
    const { id } = req.params;
    console.log('Received decisionId:', req.params);
    let conn;

    try {
        conn = await getConnection();
        const userId = req.user.id;

        // Check if the rating exists
        const existingRating = await conn.query(
            `SELECT * FROM techcoach_lite.techcoach_decision_ratings 
             WHERE user_id = ? AND decision_id = ?`,
            [userId, id]
        );

        if (existingRating.length === 0) {
            return res.status(404).json({ message: 'Rating not found for this user and decision.' });
        }

        // Update the rating
        const query = `
            UPDATE techcoach_lite.techcoach_decision_ratings
            SET rating_score = ?, rating_date = CURRENT_TIMESTAMP
            WHERE user_id = ? AND decision_id = ?`;

        await conn.query(query, [rating_score, userId, id]); // Use `id` for `decision_id`

        return res.status(200).json({ message: 'Rating updated successfully.' });
    } catch (error) {
        console.error('Error updating the rating:', error);
        return res.status(500).json({ message: 'An error occurred while updating the rating.' });
    } finally {
        if (conn) {
            conn.release(); // Ensure connection is released
        }
    }
};


const getOverallRating = async (req, res) => {
    const { id } = req.params;
    let conn;

    try {
        conn = await getConnection();

        // Query to fetch ratings with user details
        const ratings = await conn.query(
            `SELECT 
                r.rating_score, 
                r.user_id, 
                u.displayname 
             FROM 
                techcoach_lite.techcoach_decision_ratings r
             LEFT JOIN 
                techcoach_lite.techcoach_users u
             ON 
                r.user_id = u.user_id
             WHERE 
                r.decision_id = ?`,
            [id]
        );

        if (ratings.length === 0) {
            return res.status(404).json({ message: 'No ratings found for this decision.' });
        }

        // Calculate the average rating
        const totalRatings = ratings.length;
        const totalScore = ratings.reduce((sum, rating) => sum + rating.rating_score, 0);
        const averageRating = totalScore / totalRatings;

        // Return the overall rating details
        return res.status(200).json({
            totalRatings,
            averageRating: averageRating.toFixed(2),
            ratings: ratings.map((rating) => ({
                userId: rating.user_id,
                displayName: rating.displayname || "Anonymous",
                score: rating.rating_score,
            })),
        });
    } catch (error) {
        console.error('Error fetching overall rating:', error);
        return res.status(500).json({ message: 'An error occurred while fetching the overall rating.' });
    } finally {
        if (conn) conn.release();
    }
};



module.exports = { postMobileInfo,getMobileInfo,postRatingInfo,getRatingInfo,putRatingInfo,getOverallRating}