const getConnection = require('../Models/database');

const crypto = require('crypto');

const postInfo = async (req, res) => {
  const { decision_name, user_statement, tags, decision_reason_text, decision_due_date, decision_taken_date } = req.body;
  let conn;
  // console.log('Request Headers:', req.headers);
  console.log(decision_name);
  // console.log('key from encrypt', req.user.key);
  try {
    conn = await getConnection();
    await conn.beginTransaction();

    // Get current user's ID and name (assuming it's available in req.user)
    const userId = req.user.id;
    const userName = req.user.name;

    const currentDate = new Date().toISOString().slice(0, 10);
    const formattedDueDate = decision_due_date ? new Date(decision_due_date).toISOString().slice(0, 10) : null;
    const formattedTakenDate = decision_taken_date ? new Date(decision_taken_date).toISOString().slice(0, 10) : null;

    function encryptText(text, key) {
      const cipher = crypto.createCipher('aes-256-cbc', key);
      let encryptedText = cipher.update(text, 'utf8', 'hex');
      encryptedText += cipher.final('hex');
      return encryptedText;
    }

    // Ensure decision_reason_text is converted to a string if it's an object
    console.log("text",decision_reason_text);
    const decisionReasonTexts = decision_reason_text.map(item => item.decision_reason_text);
    //const decisionReasonTextString = Array.isArray(decision_reason_text) ? decision_reason_text.join(', ') : decision_reason_text;
    console.log("decision reason encrypt", decisionReasonTexts);

    // Array to store encrypted decision reason texts
    const encryptedReasonTexts = [];

    for (const reasonText of decisionReasonTexts) {
      const encryptedReasonText = encryptText(reasonText, req.user.key);
      encryptedReasonTexts.push(encryptedReasonText);
    }

    const encryptedDesicionName = encryptText(decision_name, req.user.key);
    const encrypedUserStatement = encryptText(user_statement, req.user.key);

    const decisionResult = await conn.query(
      "INSERT INTO techcoach_lite.techcoach_decision (decision_name, created_by, creation_date, decision_due_date, decision_taken_date, user_statement, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [encryptedDesicionName, userName, currentDate, formattedDueDate, formattedTakenDate, encrypedUserStatement, userId]
    );
    console.log(decisionResult);
    const decisionId = decisionResult.insertId;
    console.log(decisionId);

    // Processing tags
    const tagsArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',') : []);
    for (const tagName of tagsArray) {
      const tag = await conn.query(
        "INSERT INTO techcoach_lite.techcoach_tag (tag_name) VALUES (?) ON DUPLICATE KEY UPDATE tag_name = tag_name",
        [tagName.trim()]
      );

      const tagId = tag.insertId || tag.tag_id;

      await conn.query(
        "INSERT INTO techcoach_lite.techcoach_decision_tag (decision_id, tag_id) VALUES (?, ?)",
        [decisionId, tagId]
      );
    }

    // Processing decision_reason_text
    for (const encryptedReasonText of encryptedReasonTexts) {
      await conn.query(
        "INSERT INTO techcoach_lite.techcoach_reason (decision_id, decision_reason_text) VALUES (?, ?)",
        [decisionId, encryptedReasonText]
      );
    }

    // Commit transaction and send success response
    await conn.commit();
    res.status(200).json({ message: 'Data inserted successfully' });

  } catch (error) {
    console.error('Error inserting data:', error);
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



const getInfo = async (req, res) => {
  const { id } = req.params;
  let conn;

  try {
    conn = await getConnection();

    const decisionData = await conn.query(
      `SELECT 
          d.*, 
          GROUP_CONCAT(DISTINCT t.tag_name) AS tags,
          (
              SELECT JSON_ARRAYAGG(
                  JSON_OBJECT(
                      'id', r.reason_id, 
                      'decision_reason_text', r.decision_reason_text
                  )
              )
              FROM techcoach_lite.techcoach_reason r
              WHERE d.decision_id = r.decision_id
              GROUP BY r.decision_id
          ) AS decision_reason_text
      FROM 
          techcoach_lite.techcoach_decision d
      LEFT JOIN 
          techcoach_lite.techcoach_decision_tag dt ON d.decision_id = dt.decision_id
      LEFT JOIN 
          techcoach_lite.techcoach_tag t ON dt.tag_id = t.tag_id
      LEFT JOIN 
          techcoach_lite.techcoach_reason r ON d.decision_id = r.decision_id
      WHERE
          d.decision_id = ?
      `, [id]
    );

    // Check if decisionData is defined and not empty
    if (!decisionData || decisionData.length === 0) {
      console.error('Decision not found for ID:', id);
      return res.status(404).json({ error: 'Decision not found' });
    }

    // Define decryptText function
    const decryptText = (text, key) => {
      const decipher = crypto.createDecipher('aes-256-cbc', key);
      let decryptedText = decipher.update(text, 'hex', 'utf8');
      decryptedText += decipher.final('utf8');
      return decryptedText;
    };

    // Decrypt decision data
    const decryptedDecisionData = decisionData.map(decision => {
      // Decrypt any encrypted fields here
      return {
        decision_id: decision.decision_id,
        decision_name: decryptText(decision.decision_name, req.user.key),
        user_statement: decryptText(decision.user_statement, req.user.key),
        decision_due_date: decision.decision_due_date,
        decision_taken_date: decision.decision_taken_date,
        tags: decision.tags ? decision.tags.split(',') : [],
        decision_reason_text: Array.isArray(decision.decision_reason_text)
          ? decision.decision_reason_text.map(reason => ({
            id: reason.id,
            decision_reason_text: decryptText(reason.decision_reason_text, req.user.key)
          }))
          : typeof decision.decision_reason_text === 'string'
            ? decision.decision_reason_text.split(',').map(reason => decryptText(reason, req.user.key))
            : []
      };
    });

    res.status(200).json({ decisions: decryptedDecisionData });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};


const getallInfo =  async (req, res) => {
  let conn;
  console.log('qawqaw')
  console.log(req.user)

  try {
    conn = await getConnection();

    const decisionData = await conn.query(
      `SELECT 
            d.*, 
            GROUP_CONCAT(DISTINCT t.tag_name) AS tags,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', r.reason_id, 
                        'decision_reason_text', r.decision_reason_text
                    )
                )
                FROM techcoach_lite.techcoach_reason r
                WHERE d.decision_id = r.decision_id
                GROUP BY r.decision_id
            ) AS decision_reason_text
        FROM 
            techcoach_lite.techcoach_decision d
        LEFT JOIN 
            techcoach_lite.techcoach_decision_tag dt ON d.decision_id = dt.decision_id
        LEFT JOIN 
            techcoach_lite.techcoach_tag t ON dt.tag_id = t.tag_id
        LEFT JOIN 
            techcoach_lite.techcoach_reason r ON d.decision_id = r.decision_id
        GROUP BY 
             d.decision_id;
        `

    );
    console.log(decisionData)
    // Check if decisionData is defined and not empty
    if (!decisionData || decisionData.length === 0) {
      console.error('No decisions found');
      return res.status(404).json({ error: 'Decision not found' });
    }
    // Define decryptText function
    const decryptText = (text, key) => {
      const decipher = crypto.createDecipher('aes-256-cbc', key);
      let decryptedText = decipher.update(text, 'hex', 'utf8');
      decryptedText += decipher.final('utf8');
      return decryptedText;
    };

    const decryptedDecisions = decisionData.map(decision => ({
      ...decision,
      decision_name: decryptText(decision.decision_name, req.user.key),
      user_statement: decryptText(decision.user_statement, req.user.key),
      tags: decision.tags ? decision.tags.split(',') : [],
      decision_reason_text: Array.isArray(decision.decision_reason_text)
        ? decision.decision_reason_text.map(reason => ({
          id: reason.id,
          decision_reason_text: decryptText(reason.decision_reason_text, req.user.key)
        }))
        : typeof decision.decision_reason_text === 'string'
          ? decision.decision_reason_text.split(',').map(reason => decryptText(reason, req.user.key))
          : []
    }));

    res.status(200).json({ decisions: decryptedDecisions });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};


const putInfo = async (req, res) => {
  const { id } = req.params;
  const { decision_name, created_by, creation_date, decision_due_date, decision_taken_date, user_statement, tags, decision_reason_text } = req.body;
  let conn;

  try {
    conn = await getConnection();
    await conn.beginTransaction();

    // Format dates
    const formattedCreationDate = creation_date ? new Date(creation_date).toISOString().slice(0, 10) : null;
    const formattedDueDate = decision_due_date ? new Date(decision_due_date).toISOString().slice(0, 10) : null;
    const formattedTakenDate = decision_taken_date ? (isValidDate(decision_taken_date) ? new Date(decision_taken_date).toISOString().slice(0, 10) : null) : null;

    // Function to check if a value is a valid date
    function isValidDate(dateString) {
      const regEx = /^\d{4}-\d{2}-\d{2}$/;
      return dateString.match(regEx) !== null;
    }
    
    // Function to encrypt text
    function encryptText(text, key) {
      const cipher = crypto.createCipher('aes-256-cbc', key);
      let encryptedText = cipher.update(text, 'utf8', 'hex');
      encryptedText += cipher.final('hex');
      return encryptedText;
    }
    // Encrypt decision_name and user_statement
    const encryptedDecisionName = encryptText(decision_name, req.user.key);
    const encryptedUserStatement = encryptText(user_statement, req.user.key);

    // Update the decision record
    await conn.query(
      "UPDATE techcoach_lite.techcoach_decision SET decision_name = ?, created_by = ?, creation_date = ?, decision_due_date = ?, decision_taken_date = ?, user_statement = ? WHERE decision_id = ?",
      [encryptedDecisionName, created_by, formattedCreationDate, formattedDueDate, formattedTakenDate, encryptedUserStatement, id]
    );

    // Handle tags
    if (tags) {
      // Delete existing tags associated with the decision
      await conn.query(
        "DELETE FROM techcoach_lite.techcoach_decision_tag WHERE decision_id = ?",
        [id]
      );

      // Insert new tags for the decision
      const tagsArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',') : []);
      for (const tagName of tagsArray) {
        const tag = await conn.query(
          "INSERT INTO techcoach_lite.techcoach_tag (tag_name) VALUES (?) ON DUPLICATE KEY UPDATE tag_name = VALUES(tag_name)",
          [tagName.trim()]
        );

        const tagId = tag.insertId || tag.tag_id;

        await conn.query(
          "INSERT INTO techcoach_lite.techcoach_decision_tag (decision_id, tag_id) VALUES (?, ?)",
          [id, tagId]
        );
      }
    }

    // Handle decision_reason_text
    if (decision_reason_text) {
      // Delete existing reasons associated with the decision
      await conn.query(
        "DELETE FROM techcoach_lite.techcoach_reason WHERE decision_id = ?",
        [id]
      );

      // Encrypt decision reason texts
      const encryptedReasonTexts = decision_reason_text.map(reasonObj => encryptText(reasonObj.decision_reason_text, req.user.key));

      // Insert new reasons for the decision
      for (const encryptedReasonText of encryptedReasonTexts) {
        await conn.query(
          "INSERT INTO techcoach_lite.techcoach_reason (decision_id, decision_reason_text) VALUES (?, ?)",
          [id, encryptedReasonText]
        );
      }
    }

    // Commit transaction and send success response
    await conn.commit();
    res.status(200).json({ message: 'Data updated successfully' });

  } catch (error) {
    console.error('Error updating data:', error);
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



const deleteInfo = async (req, res) => {
  const { id } = req.params;
  let conn;

  try {
    conn = await getConnection();
    await conn.beginTransaction();


    await conn.query(
      "DELETE FROM techcoach_lite.techcoach_decision_tag WHERE decision_id = ?",
      [id]
    );

    await conn.query(
      "DELETE FROM techcoach_lite.techcoach_reason WHERE decision_id = ?",
      [id]
    );

    await conn.query(
      "DELETE FROM techcoach_lite.techcoach_decision WHERE decision_id = ?",
      [id]
    );

    // Commit transaction and send success response
    await conn.commit();
    res.status(200).json({ message: 'Data deleted successfully' });

  } catch (error) {
    console.error('Error deleting data:', error);
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


const getall = async (req, res, next) => {
  let conn;
  console.log('aaa');
  console.log(req.user, "sgcjcsdjy");
  // console.log('key get from:', req.user.key);
  try {
    conn = await getConnection();
    const user = req.user;

    if (!user) {
      throw new Error('Missing user parameter in query');
    }

    console.log('User:', user);

    const decisionData = await conn.query(
      `SELECT d.*, GROUP_CONCAT(DISTINCT t.tag_name) AS tag_name, GROUP_CONCAT(DISTINCT r.decision_reason_text) AS decision_reason_text
      FROM techcoach_lite.techcoach_decision d
      JOIN techcoach_lite.techcoach_decision_tag dt ON d.decision_id = dt.decision_id
      JOIN techcoach_lite.techcoach_tag t ON dt.tag_id = t.tag_id
      JOIN techcoach_lite.techcoach_reason r ON d.decision_id = r.decision_id
      WHERE d.user_id=${user.id}
      GROUP BY d.decision_id
      ORDER BY d.creation_date DESC;`
    );

    // console.log('vvvvvv', decisionData);

    // Define decryptText function
    const decryptText = (text, key) => {
      try {
        // console.log('Key length:', key);
        const decipher = crypto.createDecipher('aes-256-cbc', key);
        let decryptedText = decipher.update(text, 'hex', 'utf8');
        decryptedText += decipher.final('utf8');
        return decryptedText;
      } catch (error) {
        console.error('Error decrypting text:', error);
        return null; // Return null or handle the error as appropriate for your application
      }
    };

    // Define decryptReasonText function
    const decryptReasonText = (reason, key) => {
      try {
        // console.log('Key length:', key);
        const decipher = crypto.createDecipher('aes-256-cbc', key);
        let decryptedText = decipher.update(reason, 'hex', 'utf8');
        decryptedText += decipher.final('utf8');
        return decryptedText;
      } catch (error) {
        console.error('Error decrypting reason text:', error);
        return null; // Return null or handle the error as appropriate for your application
      }
    };

    const decryptedDecisionData = decisionData.map(decision => ({
      decision_id: decision.decision_id,
      decision_name: decryptText(decision.decision_name, req.user.key),
      user_statement: decryptText(decision.user_statement, req.user.key),
      decision_due_date: decision.decision_due_date,
      decision_taken_date: decision.decision_taken_date,
      tagsArray: decision.tag_name ? decision.tag_name.split(',') : [], // Splitting tag names into an array
      decision_reason_text: decision.decision_reason_text
        ? decision.decision_reason_text.split(',').map(reason => decryptReasonText(reason, req.user.key))
        : [],
    }));

    console.log("hhhh", decryptedDecisionData);
    await conn.commit();

    res.status(200).json({ decisionData: decryptedDecisionData });

  } catch (err) {
    console.error('Error processing query parameters:', err);
    if (conn) {
      await conn.rollback(); // Rollback the transaction in case of error
    }
    res.status(500).send({ message: 'Internal Server Error' }); // Handle the error gracefully
  } finally {
    if (conn) {
      conn.release(); // Release the connection in any case
    }
  }
};





module.exports = { postInfo, getallInfo, getInfo, putInfo, deleteInfo, getall };
