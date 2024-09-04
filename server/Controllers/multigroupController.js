const getConnection = require('../Models/database');

const getUserList = async (req, res) => {
  try {

    const userId = req.user.id;
    // console.log("user id from get user list", userId);
    conn = await getConnection();
    await conn.beginTransaction();

    const tasks = await conn.query(`
        SELECT * FROM techcoach_lite.techcoach_users WHERE user_id != ?;
      `, [userId]);

    await conn.commit();
    if (conn) conn.release();
    res.status(200).json({ message: 'User List Fetched successfully', tasks });
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

const decisionCircleCreation = async (req, res) => {
  const { type_of_group,members, group_name } = req.body;
  let conn;
  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const created_by = req.user.id;
    const groupResult = await conn.query(
      `INSERT INTO techcoach_lite.techcoach_decision_group (created_by, type_of_group,created_at,group_name) VALUES (?,?,NOW(),?)`,
      [created_by,type_of_group, group_name]
    )

    const groupId = Number(groupResult.insertId);
    console.log('groupResult', groupResult);

    for (const member of members) {
      const memberId = member.user_id;

      const [userResult] = await conn.query(
        `SELECT COUNT(*) as count FROM techcoach_lite.techcoach_users WHERE user_id = ?`,
        [memberId]
      );

      if (userResult.count === 0) {
        throw new Error(`User with ID ${memberId} does not exist.`);
      }

      await conn.query(
        `INSERT INTO techcoach_lite.techcoach_decision_group_member(group_id,member_id,status) VALUES (?,?,?)`,
        [groupId, memberId, '']
      )
    }
    await conn.commit();
    res.status(200).json({ message: 'Decision Circle Created successfully', groupId ,group_name});

  } catch (error) {
    console.error('Error in creating Decision Circle', error);
    res.status(500).json({ error: 'An error Occured while processing your request' });
  } finally {
    if (conn) {
      conn.release();
    }
  }
}

const checkDecisionCircleExists = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const userId = req.user.id;
    
    const query = `
      SELECT COUNT(*) AS count 
      FROM techcoach_lite.techcoach_decision_group 
      WHERE created_by = ?`;

    const [result] = await conn.query(query, [userId]);
    console.log('Count:', result);

    if (result.count > 0) {
      res.status(200).json({ message: 'Decision Circle exists for this user.' });
    } else {
      res.status(200).json({ message: 'No existing Decision Circle found for this user.' });
    }
  } catch (error) {
    console.error('Error in checking Decision Circle existence:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  } finally {
    if (conn) conn.release();
  }
};


const removeMemberFromCircle = async (req, res) => {
  //console.log("request from remove", req.body);

  const { userId, group_id } = req.body;

  let conn;
  try {
      conn = await getConnection();
      await conn.beginTransaction();

      console.log("request from remove", req.body);

      const query = `
          DELETE FROM techcoach_lite.techcoach_decision_group_member
          WHERE member_id = ? AND group_id = ?
      `;
      const result = await conn.query(query, [userId, group_id]);

      console.log("result from delete query", result);

      await conn.commit();
      res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
      console.error('Error in removing member from inner circle', error);
      res.status(500).json({ error: 'An error occurred while processing your request' });
  } finally {
      if (conn) conn.release();
  }
};



module.exports = { 
  getUserList, 
  decisionCircleCreation,
  checkDecisionCircleExists,
  removeMemberFromCircle 
}