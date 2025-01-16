const getConnection = require('../Models/database');

const postReactions = async (req, res) => {
    const { comment_id, emoji_id } = req.body;
    let conn;
    try {
      conn = await getConnection(); 
      await conn.beginTransaction(); 
  
      const userId = req.user.id;
      console.log("User Id from request:", userId);
  
      const checkQuery = `
        SELECT reaction_id FROM techcoach_lite.techcoach_comment_reactions
        WHERE comment_id = ? AND user_id = ? AND emoji_id = ?
      `;
      const existingReaction = await conn.execute(checkQuery, [comment_id, userId, emoji_id]);
  
      if (existingReaction.length > 0) {
        return res.status(409).json({ message: 'Reaction already exists' });
      }
  
      const insertQuery = `
        INSERT INTO techcoach_lite.techcoach_comment_reactions (comment_id, user_id, emoji_id)
        VALUES (?, ?, ?)
      `;
      await conn.execute(insertQuery, [comment_id, userId, emoji_id]);
  
      await conn.commit();
      res.status(201).json({ message: 'Reaction added successfully!' });
    } catch (error) {
      if (conn) await conn.rollback(); 
      console.error('Error Adding reaction:', error);
      res.status(500).json({ message: 'Failed to add reaction', error: error.message });
    } finally {
      if (conn) await conn.release(); 
    }
};

const getReactions = async (req, res) => {
    const { comment_id } = req.params;
    let conn;
    try {
      conn = await getConnection(); 
  
      const query = `
        SELECT r.reaction_id, r.comment_id, r.user_id, e.emoji_symbol,e.emoji_id, e.emoji_name, r.reacted_at, u.displayname,u.email
        FROM techcoach_lite.techcoach_comment_reactions AS r
        INNER JOIN techcoach_lite.techcoach_emojis AS e ON r.emoji_id = e.emoji_id
        INNER JOIN techcoach_lite.techcoach_users AS u ON r.user_id = u.user_id
        WHERE r.comment_id = ?
      `;
  
      const reactions = await conn.execute(query, [comment_id]);
  
      if (reactions.length === 0) {
        return res.status(404).json({ message: 'No reactions found for this comment' });
      }
  
      res.status(200).json({ message: 'Reactions retrieved successfully', data: reactions });
    } catch (error) {
      console.error('Error fetching reactions:', error);
      res.status(500).json({ message: 'Failed to fetch reactions', error: error.message });
    } finally {
      if (conn) await conn.release(); 
    }
};

const getAllReactionsByDecision = async (req, res) => {
    const { id } = req.params;
    let conn;
    try {
      conn = await getConnection(); 
  
      const query = `
        SELECT 
          r.reaction_id, 
          r.comment_id, 
          c.comment, 
          r.user_id, 
          e.emoji_id,
          e.emoji_symbol, 
          e.emoji_name, 
          r.reacted_at,
          u.displayname
        FROM 
          techcoach_lite.techcoach_comment_reactions AS r
        INNER JOIN 
          techcoach_lite.techcoach_emojis AS e ON r.emoji_id = e.emoji_id
        INNER JOIN 
          techcoach_lite.techcoach_conversations AS c ON r.comment_id = c.id
        INNER JOIN
          techcoach_lite.techcoach_users AS u ON r.user_id = u.user_id  
        WHERE 
          c.decisionId = ?
      `;
  
      const reactions = await conn.execute(query, [id]);
  
      if (reactions.length === 0) {
        return res.status(404).json({ message: 'No reactions found for this decision' });
      }
  
      res.status(200).json({ message: 'Reactions retrieved successfully', data: reactions });
    } catch (error) {
      console.error('Error fetching reactions:', error);
      res.status(500).json({ message: 'Failed to fetch reactions', error: error.message });
    } finally {
      if (conn) await conn.release(); 
    }
};

const removeReaction = async (req, res) => {
    const { comment_id, emoji_id } = req.params;
    console.log('nanan',comment_id);
    console.log('jjaja',emoji_id);
    let conn;
    try {
      conn = await getConnection(); 
  
      const userId = req.user.id; 
  
      const deleteQuery = `
        DELETE FROM techcoach_lite.techcoach_comment_reactions
        WHERE comment_id = ? AND user_id = ? AND emoji_id = ?
      `;
  
      const result = await conn.execute(deleteQuery, [comment_id, userId, emoji_id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'No reaction found to remove' });
      }
  
      res.status(200).json({ message: 'Reaction removed successfully' });
    } catch (error) {
      console.error('Error removing reaction:', error);
      res.status(500).json({ message: 'Failed to remove reaction', error: error.message });
    } finally {
      if (conn) await conn.release(); 
    }
}; 

const getMasterEmojis = async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        
        const rows = await conn.execute(`
            SELECT emoji_id, emoji_symbol, emoji_name 
            FROM techcoach_lite.techcoach_emojis
        `);

        res.status(200).json({ emojis: rows });
    } catch (error) {
        console.error('Error fetching master emojis:', error);
        res.status(500).json({ error: 'An error occurred while fetching master emojis', details: error.message });
    } finally {
        if (conn) conn.release();
    }
};

// const editReaction = async (req, res) => {
//   const { comment_id, emoji_id } = req.params;
//   console.log('Comment ID:', comment_id);
//   console.log('New Emoji ID:', emoji_id);
  
//   let conn;
//   try {
//     conn = await getConnection();
//     await conn.beginTransaction();

//     const userId = req.user.id;

//     // Check if the reaction exists
//     const checkQuery = `
//       SELECT reaction_id FROM techcoach_lite.techcoach_comment_reactions
//       WHERE comment_id = ? AND user_id = ?
//     `;
//     const existingReaction = await conn.execute(checkQuery, [comment_id, userId]);

//     if (existingReaction.length === 0) {
//       return res.status(404).json({ message: 'No reaction found to edit' });
//     }

//     // Update the reaction
//     const updateQuery = `
//       UPDATE techcoach_lite.techcoach_comment_reactions
//       SET emoji_id = ?
//       WHERE comment_id = ? AND user_id = ?
//     `;
//     const result = await conn.execute(updateQuery, [emoji_id, comment_id, userId]);

//     if (result.affectedRows === 0) {
//       return res.status(400).json({ message: 'Failed to update reaction' });
//     }

//     await conn.commit();
//     res.status(200).json({ message: 'Reaction updated successfully' });
//   } catch (error) {
//     if (conn) await conn.rollback();
//     console.error('Error editing reaction:', error);
//     res.status(500).json({ message: 'Failed to edit reaction', error: error.message });
//   } finally {
//     if (conn) await conn.release();
//   }
// };



module.exports = { postReactions, getReactions, getAllReactionsByDecision, removeReaction,getMasterEmojis}