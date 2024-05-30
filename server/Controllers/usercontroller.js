const getConnection = require('../Models/database');


const getUserList = async (req, res) => {
  let conn;
  try {
    const userId = req.user.id;
    console.log("User ID from getUserList:", userId);

    conn = await getConnection();
    await conn.beginTransaction();


    const tasks = await conn.query(`
        SELECT * FROM techcoach_lite.techcoach_task WHERE user_id = ?;
      `, [userId]);

    await conn.commit();

    res.status(200).json({ message: 'User List Fetched successfully', tasks });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  } finally {
    if (conn) conn.release();
  }
};

const postGeneralProfile = async (req, res) => {
  const { YearBorn, Gender, Communication, skill, attitude, strength, weakness, opportunity, threat } = req.body;
  console.log(req.body, 'General Profile Data');

  let conn;
  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const userId = req.user.id;  
    console.log("User ID from getUserList:", userId);

    const res1 = await conn.query(
      "INSERT INTO techcoach_lite.techcoach_personal_info (dob, gender, user_id) VALUES (?, ?, ?)",
      [YearBorn, Gender, userId]
    );

    console.log("res1", res1);

    const headersAndValues = [
      { headerName: 'Skill', headerValue: skill },
      { headerName: 'Communication', headerValue: Communication },
      { headerName: 'Attitude', headerValue: attitude },
      { headerName: 'Strength', headerValue: strength },
      { headerName: 'Weakness', headerValue: weakness },
      { headerName: 'Opportunity', headerValue: opportunity },
      { headerName: 'Threat', headerValue: threat }
    ];

    for (const { headerName, headerValue } of headersAndValues) {
      if (headerValue && headerValue.length > 0) {
        const headerRows = await conn.query(
          "SELECT header_id FROM techcoach_lite.techcoach_personal_header WHERE header_name = ?",
          [headerName]
        );

        const headerId = headerRows[0]?.header_id;

        console.log("header idddddddd", headerId);

        if (!headerId) {
          throw new Error(`Header ID not found for header name: ${headerName}`);
        }

        if (Array.isArray(headerValue)) {
          for (const value of headerValue) {
            await conn.query(
              "INSERT INTO techcoach_lite.techcoach_header_value (user_id, header_id, header_value) VALUES (?, ?, ?)",
              [userId, headerId, value]
            );
          }
        } else {
          await conn.query(
            "INSERT INTO techcoach_lite.techcoach_header_value (user_id, header_id, header_value) VALUES (?, ?, ?)",
            [userId, headerId, headerValue]
          );
        }
      }
    }

    await conn.commit();
    res.status(200).json({ message: 'General profile data inserted successfully' });
  } catch (error) {
    console.error('Error inserting general profile data:', error);
    if (conn) {
      await conn.rollback();
    }
    res.status(500).json({ error: 'An error occurred while processing your request' });
  } finally {
    if (conn) conn.release();
  }
};



const getProfile = async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const userId = req.user.id;

    const personalInfoResult = await conn.query(
      "SELECT dob, gender, created_at FROM techcoach_lite.techcoach_personal_info WHERE user_id = ?",
      [userId]
    );

    if (personalInfoResult.length === 0) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const personalInfo = personalInfoResult[0];

    const headerValuesResult = await conn.query(
      `SELECT h.header_name, v.header_value 
       FROM techcoach_lite.techcoach_header_value v 
       JOIN techcoach_lite.techcoach_personal_header h ON v.header_id = h.header_id 
       WHERE v.user_id = ?`,
      [userId]
    );

    const profileDetails = headerValuesResult.reduce((acc, { header_name, header_value }) => {
      const key = header_name.toLowerCase();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(header_value);
      return acc;
    }, {});

    const fullProfile = { 
      YearBorn: personalInfo.dob, 
      Gender: personalInfo.gender, 
      ...profileDetails 
    };

    res.status(200).json(fullProfile);
  } catch (error) {
    console.error('Error retrieving profile data:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  } finally {
    if (conn) conn.release();
  }
};



const putProfile = async (req, res) => {
  const {
    dob, gender,
    skills, communication, attitudes,
    strengths, weaknesses, opportunities, threats
  } = req.body;

  let conn;
  try {
    conn = await getConnection();
    await conn.beginTransaction();

    const userId = req.user.id;
    
    // Update personal info
    await conn.query(
      "UPDATE techcoach_lite.techcoach_personal_info SET dob = ?, gender = ? WHERE user_id = ?",
      [dob, gender, userId]
    );

    // Define headers and values
    const headersAndValues = [
      { headerName: 'Skill', headerValue: skills },
      { headerName: 'Communication', headerValue: communication },
      { headerName: 'Attitude', headerValue: attitudes },
      { headerName: 'Strength', headerValue: strengths },
      { headerName: 'Weakness', headerValue: weaknesses },
      { headerName: 'Opportunity', headerValue: opportunities },
      { headerName: 'Threat', headerValue: threats },
    ];

    // Iterate over headers and update or insert values
    for (const { headerName, headerValue } of headersAndValues) {
      if (headerValue) {
        const headerRow = await conn.query(
          "SELECT header_id FROM techcoach_lite.techcoach_personal_header WHERE header_name = ?",
          [headerName]
        );

        const headerId = headerRow[0]?.header_id; // Use optional chaining to handle potential empty results

        // Check if the header value already exists for the user
        const [existingValue] = await conn.query(
          "SELECT id FROM techcoach_lite.techcoach_header_Value WHERE user_id = ? AND header_id = ?",
          [userId, headerId]
        );

        const existingValueLength = existingValue.length > 0 ? existingValue.length : 0;

        if (existingValueLength > 0) {
          // Update the existing value
          await conn.query(
            "UPDATE techcoach_lite.techcoach_header_Value SET header_value = ? WHERE user_id = ? AND header_id = ?",
            [headerValue, userId, headerId]
          );
        } else {
          // Insert a new value
          await conn.query(
            "INSERT INTO techcoach_lite.techcoach_header_Value (user_id, header_id, header_value) VALUES (?, ?, ?)",
            [userId, headerId, headerValue]
          );
        }
      }
    }

    await conn.commit();
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile data:', error);
    if (conn) {
      await conn.rollback();
    }
    res.status(500).json({ error: 'An error occurred while processing your request' });
  } finally {
    if (conn) conn.release();
  }
};


module.exports = { getUserList, postGeneralProfile, getProfile,  putProfile };