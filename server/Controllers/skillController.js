const getConnection = require('../Models/database');

const postSkill = async (req, res) => {
  const { skills } = req.body;
  let conn;

  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const userId = req.user.id;
    console.log('User ID from:', userId);

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ error: 'Skills array is required and must not be empty' });
    }

    for (const skill of skills) {
      const { skill_name, rating, comments } = skill;

      // Fetch the skill_id based on the skill_name
      const rows = await conn.query(
        "SELECT skill_id FROM techcoach_lite.techcoach_soft_skill WHERE skill_name = ?",
        [skill_name]
      );

      if (rows.length === 0) {
        throw new Error(`Skill name '${skill_name}' not found in techcoach_soft_skill table`);
      }

      const skillId = rows[0].skill_id;

      // Insert into techcoach_soft_skill_value using the skill_id
      await conn.query(
        "INSERT INTO techcoach_lite.techcoach_soft_skill_value (skill_id, rating, comments, user_id) VALUES (?,?,?,?)",
        [skillId, rating, comments || null, userId]
      );
    }

    await conn.commit();
    res.status(200).json({ message: 'Skill data inserted successfully' });
  } catch (error) {
    console.log('Error inserting skill data:', error);
    if (conn) {
      await conn.rollback();
    }
    res.status(500).json({ error: 'An error occurred while processing your request' });
  } finally {
    if (conn) conn.release();
  }
};

const getMasterSkills = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const rows = await conn.query("SELECT skill_id, skill_name,description FROM techcoach_lite.techcoach_soft_skill");
    
    // console.log('Fetched master skills:', rows); 
    if (rows.length > 0) {
      res.status(200).json({ skills: rows });
    } 
  } catch (error) {
    console.log('Error fetching master skills:', error);
    res.status(500).json({ error: 'An error occurred while fetching master skills' });
  } finally {
    if (conn) conn.release();
  }
};


const getAllSkill = async (req, res) => {
  let conn;

  try {
    conn = await getConnection();

    const userId = req.user.id;
    const rows = await conn.query(
      `SELECT 
             tsv.id, 
             tsv.skill_id, 
             tsv.rating, 
             tsv.comments, 
             ts.skill_name 
      FROM 
            techcoach_lite.techcoach_soft_skill_value tsv
      JOIN 
            techcoach_lite.techcoach_soft_skill ts 
      ON 
            tsv.skill_id = ts.skill_id
      WHERE 
            tsv.user_id = ?`,
      [userId]
    );

    res.status(200).json({ skills: rows });
  } catch (error) {
    console.log('Error fetching skill data:', error);
    res.status(500).json({ error: 'An error occurred while fetching skill data' });
  } finally {
    if (conn) conn.release();
  }
};


const getSkill = async (req, res) => {
  const { id } = req.params;
  const { skillId, skillName } = req.query;
  const userId = req.user.id;
  let conn;

  try {
    conn = await getConnection();
    let rows;

    if (id) {
      rows = await conn.query(
        `SELECT 
            tsv.id, 
            tsv.skill_id, 
            tsv.rating, 
            tsv.comments, 
            ts.skill_name 
        FROM 
            techcoach_lite.techcoach_soft_skill_value tsv
        JOIN 
            techcoach_lite.techcoach_soft_skill ts 
        ON 
            tsv.skill_id = ts.skill_id
        WHERE 
            tsv.user_id = ? AND tsv.id = ?`,
        [userId, id]
      );
    } else if (skillId) {
      rows = await conn.query(
        `SELECT 
            tsv.id, 
            tsv.skill_id, 
            tsv.rating,
            tsv.comments, 
            ts.skill_name 
        FROM 
            techcoach_lite.techcoach_soft_skill_value tsv
        JOIN 
            techcoach_lite.techcoach_soft_skill ts 
        ON 
            tsv.skill_id = ts.skill_id
        WHERE 
            tsv.user_id = ? AND tsv.skill_id = ?`,
        [userId, skillId]
      );
    } else if (skillName) {
      rows = await conn.query(
        `SELECT 
            tsv.id, 
            tsv.skill_id, 
            tsv.rating, 
            tsv.comments, 
            ts.skill_name 
        FROM 
            techcoach_lite.techcoach_soft_skill_value tsv
        JOIN 
            techcoach_lite.techcoach_soft_skill ts 
        ON 
            tsv.skill_id = ts.skill_id
        WHERE 
            tsv.user_id = ? AND ts.skill_name = ?`,
        [userId, skillName]
      );
    } else {
      rows = await conn.query(
        `SELECT 
            tsv.id, 
            tsv.skill_id, 
            tsv.rating, 
            tsv.comments, 
            ts.skill_name 
        FROM 
            techcoach_lite.techcoach_soft_skill_value tsv
        JOIN 
            techcoach_lite.techcoach_soft_skill ts 
        ON 
            tsv.skill_id = ts.skill_id
        WHERE 
            tsv.user_id = ?`,
        [userId]
      );
    }

    res.status(200).json({ skills: rows });
  } catch (error) {
    console.log('Error fetching skill data:', error);
    res.status(500).json({ error: 'An error occurred while fetching skill data' });
  } finally {
    if (conn) conn.release();
  }
};


const putSkill = async (req, res) => {
  const { id } = req.params;
  const skillData = req.body.skills[0];
  const { skill_id, rating, comments } = skillData;
  const userId = req.user.id;
  let conn;

  console.log(`Updating skill with ID: ${id}`);
  console.log(`Data to update:`, { skill_id, rating, comments });
  console.log(`User ID: ${userId}`);

  try {
    conn = await getConnection();

    // Validate input data
    if (!skill_id || rating === undefined || !comments) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if skill_id exists in techcoach_soft_skill table
    const skillCheck = await conn.query(
      "SELECT COUNT(*) as count FROM techcoach_lite.techcoach_soft_skill WHERE skill_id = ?",
      [skill_id]
    );

    if (skillCheck.count === 0) {
      return res.status(400).json({ error: 'Invalid skill_id' });
    }

    // Update the skill data
    const result = await conn.query(
      "UPDATE techcoach_lite.techcoach_soft_skill_value SET skill_id = ?, rating = ?, comments = ? WHERE user_id = ? AND id = ?",
      [skill_id, rating, comments, userId, id]
    );

    console.log('Update result:', result);

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Skill not found or no changes made' });
    } else {
      res.status(200).json({ message: 'Skill updated successfully' });
    }
  } catch (error) {
    console.log('Error updating skill data:', error);
    res.status(500).json({ error: 'An error occurred while updating skill data' });
  } finally {
    if (conn) conn.release();
  }
};


const deleteAllSkill = async (req, res) => {
  let conn;


  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const userId = req.user.id;
    console.log('Deleting skill for user:', userId);

    // Delete the skill
    const result = await conn.query(
      "DELETE FROM techcoach_lite.techcoach_soft_skill_value WHERE  user_id = ?",
      [userId]
    );

    await conn.commit();
    res.status(200).json({ message: 'Skill data deleted successfully' });
  } catch (error) {
    console.log('Error deleting skill data:', error);
    if (conn) {
      await conn.rollback();
    }
    res.status(500).json({ error: 'An error occurred while deleting skill data' });
  } finally {
    if (conn) conn.release();
  }
};


const deleteSkill = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  let conn;

  console.log(`Deleting skill with ID: ${id}`);
  console.log(`User ID: ${userId}`);

  if (!id || !userId) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  try {
    conn = await getConnection();

    // Check if the skill exists before attempting to delete
    const skill = await conn.query(
      "SELECT * FROM techcoach_lite.techcoach_soft_skill_value WHERE user_id = ? AND id = ?",
      [userId, id]
    );

    if (skill.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Delete skill from the database
    const result = await conn.query(
      "DELETE FROM techcoach_lite.techcoach_soft_skill_value WHERE user_id = ? AND id = ?",
      [userId, id]
    );

    console.log('Delete result:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Skill not found or already deleted' });
    }

    res.status(200).json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.log('Error deleting skill data:', error);
    res.status(500).json({ error: 'An error occurred while deleting skill data' });
  } finally {
    if (conn) conn.release();
  }
};

module.exports = { postSkill,getMasterSkills, getAllSkill, getSkill, putSkill, deleteAllSkill, deleteSkill }