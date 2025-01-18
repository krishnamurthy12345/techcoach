const getConnection = require('../Models/database');

const postCommentRating = async(req,res) =>{
    const{comment_id,rating_score} = req.body;
    let conn;

    try {
        conn = await getConnection();
        const userId = req.user.id;

        const query = `
        INSERT INTO techcoach_lite.techcoach_decision_comments_rating
        (comment_id,user_id,rating_score,rating_date)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)`;

        await conn.query(query,[comment_id,userId,rating_score]);

        return res.status(201).json({ message:'Rating Submitted Successfully'});

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while submitting the rating.'})

    } finally {
        if (conn) {
            conn.release();
        }
    }

}

const getCommentRating = async(req,res) =>{
    const { id } = req.params;

    let conn;
    try {
        conn = await getConnection();
        const userId = req.user.id;

        const commentRatingInfo = await conn.query(
            `SELECT 
            r.rating_score,
            r.comment_id,
            r.rating_date,
            u.displayname
            FROM 
             techcoach_lite.techcoach_decision_comments_rating r
            INNER JOIN 
             techcoach_lite.techcoach_users u ON r.user_id = u.user_id
            WHERE r.user_id = ? AND r.comment_id = ?`,
            [userId, id]
        );

        if(commentRatingInfo.length === 0) {
            return res.status(404).json({ message:'No rating found for this user and comment.'});
        }
        return res.status(200).json({ commentsRatings : commentRatingInfo});
    } catch (error) {
        console.error('Error fetching the ratings:', error);
        return res.status(500).json({message: 'Internal Server Error'});
    } finally {
        if (conn) conn.release();
    }
}

const putCommentRating = async(req,res) =>{
    const { rating_score } = req.body;
    const { id } = req.params;
    console.log('Received commentId:', req.params);
    let conn;
    try {
        conn = await getConnection();
        const userId = req.user.id;

        const existingCommentRating = await conn.query(
            `SELECT * FROM techcoach_lite.techcoach_decision_comments_rating
            WHERE user_id = ? AND comment_id = ? `,
            [userId,id]
        );

        if(existingCommentRating.length === 0) {
            return res.status(404).json({ message: 'Rating not found for this user and decision.'});
        }

        const query = `
        UPDATE techcoach_lite.techcoach_decision_comments_rating
        SET rating_score = ?, rating_date = CURRENT_TIMESTAMP
        WHERE user_id = ? AND comment_id = ? `;

        await conn.query(query,[rating_score, userId, id]);

        return res.status(200).json({ message: 'Rating updated Successfully.'});
    } catch (error) {
        console.error('Error updating the rating:',error);
        return res.status(500).json({ message: 'An error occurred while updating the rating.'});
    } finally {
        if (conn) { conn.release() }
    }
}

const getOverallCommentRating = async (req, res) => {
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
                techcoach_lite.techcoach_decision_comments_rating r
             LEFT JOIN 
                techcoach_lite.techcoach_users u
             ON 
                r.user_id = u.user_id
             WHERE 
                r.comment_id = ?`,
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

module.exports = {postCommentRating,getCommentRating,putCommentRating,getOverallCommentRating}