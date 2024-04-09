const getConnection = require('../Models/database');

const postInfo = async (req, res) => {
  const { decision_name, decision_reason, created_by, creation_date, decision_due_date, decision_taken_date, user_statement, tags, decision_reason_text, user_id } = req.body;
  let conn;
  console.log('Request Headers:', req.headers);
  console.log(decision_name)
  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const id  = req.user.id;
    console.log(id) // assuming 'user' is the key for user information


    const currentDate = new Date().toISOString().slice(0, 10);
    const formattedDueDate = decision_due_date ? new Date(decision_due_date).toISOString().slice(0, 10) : null;
    const formattedTakenDate = decision_taken_date ? new Date(decision_taken_date).toISOString().slice(0, 10) : null;

    const decisionResult = await conn.query(
      "INSERT INTO techcoach_lite.techcoach_decision (decision_name, created_by, creation_date, decision_due_date, decision_taken_date, user_statement, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [decision_name, created_by, currentDate, formattedDueDate, formattedTakenDate, user_statement, id]
    );
    console.log(decisionResult)
    const decisionId = decisionResult.insertId;
    console.log(decisionId)

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
    if (Array.isArray(decision_reason_text)) {
      for (const reasonObj of decision_reason_text) {
        const reason = reasonObj.decision_reason_text;
        await conn.query(
          "INSERT INTO techcoach_lite.techcoach_reason (decision_id, decision_reason_text) VALUES (?, ?)",
          [decisionId, reason]
        );
      }
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


// const getallInfo = async (req, res) => {
//     let conn;
//     console.log('aaa')
//     try {
//         conn = await getConnection();

//         // Execute query to fetch decision data
//         const decisionRows = await conn.query(
//             "SELECT * FROM techcoach_lite.techcoach_decision"
//         );

//         // Execute query to fetch associated tags for each decision
//         for (const decisionRow of decisionRows) {
//             const tagRows = await conn.query(
//                 "SELECT t.tag_name FROM techcoach_lite.techcoach_tag t INNER JOIN techcoach_lite.techcoach_decision_tag dt ON t.tag_id = dt.tag_id WHERE dt.decision_id = ?",
//                 [decisionRow.decision_id]
//             );
//             decisionRow.tags = Array.isArray(tagRows) ? tagRows.map(tagRow => tagRow.tag_name) : [];
//         }

//         // Execute query to fetch associated reasons for each decision
//         for (const decisionRow of decisionRows) {
//             const reasonRows = await conn.query(
//                 "SELECT r.decision_reason_text FROM techcoach_lite.techcoach_reason r INNER JOIN techcoach_lite.techcoach_reason dr ON r.reason_id = dr.reason_id WHERE dr.decision_id = ?",
//                 [decisionRow.decision_id]
//             );
//             decisionRow.reasons = Array.isArray(reasonRows) ? reasonRows.map(reasonRow => reasonRow.decision_reason_text) : [];
//         }

//         res.status(200).json({ decisions: decisionRows });
//     } catch (error) {
//         console.error('Error retrieving data:', error);
//         res.status(500).json({ error: 'An error occurred while processing your request' });
//     } finally {
//         if (conn) {
//             conn.release();
//         }
//     }
// };





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
        // Assign individual ID to the decision
        const decisions = decisionData;
        res.status(200).json({ decisions });
        console.log(decisions)
      } catch (error) {
        console.error('Error fetching data:', error);
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
      console.error('Decision not found for ID:',id);
      return res.status(404).json({ error: 'Decision not found' });
    }
    // Assign individual ID to the decision
   // Assigning decision_id to id property
   const decisions = decisionData;
   res.status(200).json({ decisions });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};



// const putInfo = async (req, res) => {
//     const { id } = req.params;
//     const { decision_name, decision_reason, created_by, creation_date, decision_due_date, decision_taken_date, user_statement, tags, decision_reason_text } = req.body;
//     let conn;
// console.log('xvxv')
//     try {
//         conn = await getConnection();

//         await conn.beginTransaction();

//         const formattedCreationDate = new Date(creation_date).toISOString().slice(0, 19).replace('T', ' ');
//         const formattedDueDate = new Date(decision_due_date).toISOString().slice(0, 19).replace('T', ' ');
//         const formattedTakenDate = new Date(decision_taken_date).toISOString().slice(0, 19).replace('T', ' ');

//         // Update decision data
//         await conn.query(
//             "UPDATE techcoach_lite.techcoach_decision SET decision_name = ?, decision_reason = ?, created_by = ?, creation_date = ?, decision_due_date = ?, decision_taken_date = ?, user_statement = ? WHERE decision_id = ?",
//             [decision_name, decision_reason, created_by, formattedCreationDate, formattedDueDate, formattedTakenDate, user_statement, id]
//         );

//         // Remove existing tags associated with the decision
//         await conn.query(
//             "DELETE FROM techcoach_lite.techcoach_decision_tag WHERE decision_id = ?",
//             [id]
//         );

//         // Ensure tags is always an array
//         const tagsArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',') : []);

//         // Insert new tags and associate them with the decision
//         for (const tagName of tagsArray) {
//             // Insert tag data if not exist
//             const tag = await conn.query(
//                 "INSERT INTO techcoach_lite.techcoach_tag (tag_name) VALUES (?) ON DUPLICATE KEY UPDATE tag_name = tag_name",
//                 [tagName]
//             );

//             const tagId = tag.insertId || tag.tag_id;

//             // Associate the tag with the decision
//             await conn.query(
//                 "INSERT INTO techcoach_lite.techcoach_decision_tag (decision_id, tag_id) VALUES (?, ?)",
//                 [id, tagId]
//             );
//         }

//         // Remove existing reasons associated with the decision
//         await conn.query(
//             "DELETE FROM techcoach_lite.techcoach_reason WHERE decision_id = ?",
//             [id]
//         );

//         // Insert new reasons and associate them with the decision
//         for (const reason of decision_reason_text) {
//             await conn.query(
//                 "INSERT INTO techcoach_lite.techcoach_reason (decision_id, decision_reason_text) VALUES (?, ?)",
//                 [id, reason.reason_text]
//             );
//         }

//         await conn.commit();
//         res.status(200).json({ message: 'Data updated successfully' });
//     } catch (error) {
//         console.error('Error updating data:', error);
//         if (conn) {
//             await conn.rollback();
//         }
//         res.status(500).json({ error: 'An error occurred while processing your request' });
//     } finally {
//         if (conn) {
//             conn.release();
//         }
//     }
// };

const putInfo = async (req, res) => {
  const { id } = req.params;
  const { decision_name, decision_reason, created_by, creation_date, decision_due_date, decision_taken_date, user_statement, tags, decision_reason_text } = req.body;
  let conn;
  console.log("tags",tags)

  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const formattedCreationDate = new Date(creation_date).toISOString().slice(0, 10);
    const formattedDueDate = decision_due_date ? new Date(decision_due_date).toISOString().slice(0, 10) : null;
    const formattedTakenDate = decision_taken_date ? new Date(decision_taken_date).toISOString().slice(0, 10) : null;

    // Format decision_reason array into a string
    const formattedDecisionReason = decision_reason.join(', ');

    // Update the decision record
    await conn.query(
      "UPDATE techcoach_lite.techcoach_decision SET decision_name = ?, decision_reason = ?, created_by = ?, creation_date = ?, decision_due_date = ?, decision_taken_date = ?, user_statement = ? WHERE decision_id = ?",
      [decision_name, formattedDecisionReason, created_by, formattedCreationDate, formattedDueDate, formattedTakenDate, user_statement, id]
    );

    // Delete existing tags associated with the decision
    await conn.query(
      "DELETE FROM techcoach_lite.techcoach_decision_tag WHERE decision_id = ?",
      [id]
    );

    // Insert new tags for the decision
    const tagsArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',') : []);
    for (const tagName of tagsArray) {
      const tag = await conn.query(
        "INSERT INTO techcoach_lite.techcoach_tag (tag_name) VALUES (?) ON DUPLICATE KEY UPDATE tag_name = tag_name",
        [tagName]
      );

      const tagId = tag.insertId || tag.tag_id;

      await conn.query(
        "INSERT INTO techcoach_lite.techcoach_decision_tag (decision_id, tag_id) VALUES (?, ?)",
        [id, tagId]
      );
    }

    // Delete existing reasons associated with the decision
    await conn.query(
      "DELETE FROM techcoach_lite.techcoach_reason WHERE decision_id = ?",
      [id]
    );

    // Insert new reasons for the decision
    if (Array.isArray(decision_reason_text)) {
      for (const reasonObj of decision_reason_text) {
        const reason = reasonObj.decision_reason_text;
        await conn.query(
          "INSERT INTO techcoach_lite.techcoach_reason (decision_id, decision_reason_text) VALUES (?, ?)",
          [id, reason]
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



// const deleteInfo = async (req, res) => {
//     const decision_id = req.params.id;
//     let conn;

//     try {
//         conn = await getConnection();
//         await conn.beginTransaction();

//         // Delete associated tags
//         await conn.query(
//             "DELETE FROM techcoach_lite.techcoach_decision_tag WHERE decision_id = ?",
//             [decision_id]
//         );

//         // Delete associated reason
//         await conn.query(
//             "DELETE FROM techcoach_lite.techcoach_reason WHERE decision_id = ?",
//             [decision_id]
//         );

//         // Delete decision
//         await conn.query(
//             "DELETE FROM techcoach_lite.techcoach_decision WHERE decision_id = ?",
//             [decision_id]
//         );

//         await conn.commit();
//         res.status(200).json({ message: 'Data deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting data:', error);
//         if (conn) {
//             await conn.rollback();
//             conn.release();
//         }
//         res.status(500).json({ error: 'An error occurred while processing your request' });
//     } finally {
//         if (conn) {
//             conn.release();
//         }
//     }
// };

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
  console.log(req.user,"sgcjcsdjy")
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
      GROUP BY d.decision_id;`

      // `select * from techcoach_lite.techcoach_decision d where d.user_id=${user.id}`

    )
    console.log(decisionData)

    await conn.commit();
    res.status(200).json({decisionData})
    
  } catch (err) {
      console.error('Error processing query parameters:', err);
      res.status(400).send({ message: 'Invalid query parameters!' });
  }
};



module.exports = { postInfo, getallInfo, getInfo, putInfo, deleteInfo, getall };
