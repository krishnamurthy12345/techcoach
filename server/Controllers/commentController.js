const getConnection = require('../Models/database');

const postComment = async (req, res) => {
    const { group_id, member_id, comment, decision_id, parentCommentId } = req.body;

    console.log('Request Body:', req.body);
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const group = await conn.query('SELECT id FROM techcoach_lite.techcoach_decision_group WHERE id = ?', [group_id]);
        if (group.length === 0) {
            return res.status(400).json({ message: 'Invalid group_id, group does not exist' });
        }

        const decision = await conn.query('SELECT decision_id FROM techcoach_lite.techcoach_decision WHERE decision_id = ?', [decision_id]);
        if (decision.length === 0) {
            return res.status(400).json({ message: 'Invalid decision_id, decision does not exist' });
        }

        const member = await conn.query('SELECT user_id FROM techcoach_lite.techcoach_users WHERE user_id = ?', [member_id]);
        console.log('Fetched member check:', member);
        if (member.length === 0) {
            return res.status(400).json({ message: 'Invalid member_id, member does not exist' });
        }


        if (parentCommentId) {
            const parentComment = await conn.query('SELECT id FROM techcoach_lite.techcoach_decision_conversations WHERE id = ?', [parentCommentId]);
            if (parentComment.length === 0) {
                return res.status(400).json({ message: 'Invalid parentCommentId, parent comment does not exist' });
            }
        }

        const sql = `
        INSERT INTO techcoach_lite.techcoach_decision_conversations 
        (group_id, member_id, comment, decision_id, parentCommentId, created_at)
        VALUES (?, ?, ?, ?, ?, NOW());
      `;
        const params = [group_id, member_id, comment, decision_id, parentCommentId || null];

        await conn.query(sql, params);

        await conn.commit();

        res.status(200).json({ message: 'Comment added successfully!' });

    } catch (error) {
        if (conn) {
            await conn.rollback();
        }
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error while adding comment', error: error.message });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

const getComments = async (req, res) => {
    const { group_id, decision_id } = req.params;
    let conn;

    try {
        const conn = await getConnection();

        const comments = await conn.query(`
        SELECT
                td.id,
                td.group_id,
                td.member_id,
                td.decision_id,
                td.comment,
                td.created_at,
                td.parentCommentId,
                td.updated_at,
                tu.user_id,
                tu.displayname,
                tu.email
            FROM
                techcoach_lite.techcoach_decision_conversations td 
            LEFT JOIN
                techcoach_lite.techcoach_users tu ON td.member_id = tu.user_id
            WHERE 
                td.group_id = ? AND td.decision_id = ?

      `, [group_id, decision_id]);

        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ message: 'Server error while fetching comments' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

const updateComment = async (req, res) => {
    const { commentId, comment } = req.body;
    let conn;

    try {
        const conn = await getConnection();

        const sql = `
        UPDATE techcoach_lite.techcoach_decision_conversations
        SET comment = ?, updated_at = NOW()
        WHERE id = ?
      `;

        const result = await conn.query(sql, [comment, commentId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        res.status(200).json({ message: 'Comment updated successfully!' });
    } catch (error) {
        console.error('Error updating comment:', error);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ message: 'Server error while updating comment' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

const replyToComment = async (req, res) => {
    const { group_id, member_id, comment, decision_id, parentCommentId } = req.body;
    let conn;


    try {
        const conn = await getConnection();
        await conn.beginTransaction();

        // Validate the parent comment ID
        const parentComment = await conn.query('SELECT id FROM techcoach_lite.techcoach_decision_conversations WHERE id = ?', [parentCommentId]);
        if (!parentComment || parentComment.length === 0) {
            return res.status(400).json({ message: 'Invalid parentCommentId, parent comment does not exist' });
        }

        const sql = `
        INSERT INTO techcoach_lite.techcoach_decision_conversations (group_id, member_id, comment, decision_id, parentCommentId, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
        const params = [group_id, member_id, comment, decision_id, parentCommentId];

        await conn.query(sql, params);
        await conn.commit();

        res.status(200).json({ message: 'Reply added successfully!' });
    } catch (error) {
        console.error('Error adding reply:', error);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ message: 'Server error while adding reply' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

const deleteComment = async (req, res) => {
    const { commentId } = req.params;
    let conn;

    try {
        const conn = await getConnection();

        const result = await conn.query('DELETE FROM techcoach_lite.techcoach_decision_conversations WHERE id = ?', [commentId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        res.status(200).json({ message: 'Comment deleted successfully!' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ message: 'Server error while deleting comment' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// group name Controllers
const postdecisionGroup = async (req, res) => {
    const { type_of_group = 'decision_circle', group_name } = req.body;

    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const user_id = req.user.id;

        // Insert into the decision group table
        const groupResult = await conn.query(
            `INSERT INTO techcoach_lite.techcoach_decision_group (user_id, type_of_group, created_at, group_name) VALUES (?, ?, NOW(), ?)`,
            [user_id, type_of_group, group_name]
        );

        console.log('Group Result:', groupResult);  // Log the result to inspect its structure

        // Use groupResult.insertId if the result is an object
        const groupId = groupResult.insertId ? groupResult.insertId.toString() : groupResult[0].insertId.toString();
        await conn.commit();

        res.status(200).json({ message: 'Decision Group Created successfully', groupId });
    } catch (error) {
        console.error('Error in creating Decision Group:', error);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

const getAlldecisionGroup = async (req, res) => {
    let conn;
    try {
        conn = await getConnection();

        const user_id = req.user.id;

        // Fetch group_name and type_of_group from the decision group table
        const query = 'SELECT id, group_name, type_of_group, created_at FROM techcoach_lite.techcoach_decision_group WHERE user_id = ?';
        const rows = await conn.query(query, [user_id]);

        // Check if any rows are returned
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No decision groups found' });
        }

        // Return the results as JSON
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching decision group', error);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ error: 'An error occurred while fetching decision groups' });
    } finally {
        if (conn) conn.release();
    }
};

const getDecisionGroup = async (req, res) => {
    const { id } = req.params;

    let conn;
    try {
        conn = await getConnection();

        const rows = await conn.query(
            `SELECT id, group_name, type_of_group FROM techcoach_lite.techcoach_decision_group WHERE id = ?`,
            [id]
        );

        // Check if any rows are returned
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Decision group not found' });
        }

        // Return the results as JSON
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching decision group by ID:', error);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ error: 'An error occurred while fetching the decision group' });
    } finally {
        if (conn) conn.release();
    }
};

const putDecisionGroup = async (req, res) => {
    const { id } = req.params;
    const { group_name } = req.body;

    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();


        const existingGroup = await conn.query(
            `SELECT * FROM techcoach_lite.techcoach_decision_group WHERE id = ?`,
            [id]
        );

        if (existingGroup.length === 0) {
            return res.status(404).json({ message: 'Decision group not found' });
        }

        // Update the decision group data
        await conn.query(
            `UPDATE techcoach_lite.techcoach_decision_group SET group_name = ? WHERE id = ?`,
            [group_name, id]
        );

        await conn.commit();

        res.status(200).json({ message: 'Decision group updated successfully' });
    } catch (error) {
        console.error('Error updating decision group:', error);
        await conn.rollback();
        res.status(500).json({ error: 'An error occurred while updating the decision group' });
    } finally {
        if (conn) conn.release();
    }
};

const deleteDecisionGroup = async (req, res) => {
    const { id } = req.params; // Get id from URL parameters

    let conn;
    try {
        conn = await getConnection();

        // Check if the decision group exists before deleting
        const existingRows = await conn.query(
            `SELECT * FROM techcoach_lite.techcoach_decision_group WHERE id = ?`,
            [id]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({ message: 'Decision group not found' });
        }

        // Delete the decision group
        await conn.query(
            `DELETE FROM techcoach_lite.techcoach_decision_group WHERE id = ?`,
            [id]
        );

        res.status(200).json({ message: 'Decision group deleted successfully' });
    } catch (error) {
        console.error('Error deleting decision group:', error);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ error: 'An error occurred while deleting the decision group' });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = {
    // Conversation Controllers
    postComment,
    getComments,
    updateComment,
    replyToComment,
    deleteComment,

    // groupNames controller
    postdecisionGroup,
    getAlldecisionGroup,
    getDecisionGroup,
    putDecisionGroup,
    deleteDecisionGroup,
}