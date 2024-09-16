const getConnection = require('../Models/database');
const crypto = require('crypto');
const axios = require('axios');

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
    const { type_of_group = 'decision_circle', members } = req.body;

    console.log('Request Body:', req.body);

    // Validate input data
    if (type_of_group || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ error: 'Invalid input data.' });
    }

    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();
        
        const user_id = req.user.id;

        // Insert group data
        const groupResult = await conn.query(
            `INSERT INTO techcoach_lite.techcoach_decision_group (user_id, created_at,type_of_group) VALUES (?,  NOW(), ?)`,
            [user_id, type_of_group]
        );

        const groupId = groupResult.insertId ? groupResult.insertId.toString() : groupResult[0].insertId.toString();

        // Insert group members
        for (const member of members) {
            if (!member.user_id) {
                throw new Error('Member user_id is missing');
            }
            const memberId = member.user_id;
            await conn.query(
                `INSERT INTO techcoach_lite.techcoach_decision_group_member (group_id, member_id, status) VALUES (?, ?, ?)`,
                [groupId, memberId, '']
            );
        }

        await conn.commit();
        res.status(200).json({ message: 'Decision Circle Created successfully', groupId });
    } catch (error) {
        console.error('Error in creating Decision Circle:', error.message);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};

const checkDecisionCircleExists = async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const query = `
            SELECT COUNT(*) AS count 
            FROM techcoach_lite.techcoach_decision_group
            WHERE user_id = ?
        `;
        const userId = req.user.id;
        const [result] = await conn.query(query, [userId]);

        //console.log("count", result);

        const count = result.count;
        const exists = count > 0n ? true : false;

        await conn.commit();
        res.status(200).json({ message: 'Decision Circle fetched', exists });
    } catch (error) {
        console.error('Error in Decision Circle fetching', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};

const decisionCircleAddInvitation = async (req, res) => {
    // console.log("Request body invitation:", req.user);
    // console.log("Request body invitation:", req.body);

    const { email } = req.body;
    const { email: senderEmail } = req.user;

    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const groupMemberQuery = 'SELECT * FROM techcoach_lite.techcoach_users WHERE email = ?';
        const groupMemberRows = await conn.query(groupMemberQuery, [senderEmail]);
        const groupMemberDetails = groupMemberRows[0];
        console.log("Group member details:", groupMemberDetails);

        const emailPayload = {
            from: {
                address: "Decision-Coach@www.careersheets.in"
            },
            to: [
                {
                    email_address: {
                        address: email
                    }
                }
            ],
            subject: `You are invited to an Decision Circle`,
            htmlbody: `<div style="font-family: Arial, sans-serif; color: #333;">
                <p>Hi,</p>
                <p>You are receiving this notification as is inviting you to become part of their decision circle.</p>
                <p>Decision Coach application enables confidential collaboration between people who trust each other to support in making important decisions.</p>
                <p>Accessing Decision Coach is simple. Use this Google email account to sign up and you are all set. And it is free.</p>
                <p>If you are already a user of Decision Coach then just sign in.</p>
                <p style="text-align: center;">
                    <a href="https://decisioncoach.onrender.com" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Click here to access the application</a>
                </p>
                <p style="text-align: center;">
                    <a href="https://decisioncoach.onrender.com" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Click Decision Circle to accept the invite</a>
                </p>
                <p>Regards,</p>
                <p>Team @ Decision Coach</p>
            </div>`
        };

        const zeptoMailApiUrl = 'https://api.zeptomail.in/v1.1/email'; 
        const zeptoMailApiKey = 'PHtE6r1cReDp2m599RcG4aC8H5L3M45/+ONleQcSttwWWfEGSU1UrN8swDDjr08uV/cTE6OSzNpv5++e4e2ALWvqY2pIVGqyqK3sx/VYSPOZsbq6x00ZslQcfkbeUYHsd9Zs0ifRu92X'; 

        await axios.post(zeptoMailApiUrl, emailPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Zoho-enczapikey ${zeptoMailApiKey}`
            }
        });

        await conn.commit();
        res.status(200).json({ message: 'Mail Sent Successfully' });
    } catch (error) {
        console.error('Error in sending mail on invite to inner circle:', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};

const getDecisionCircleDetails = async (req, res) => {
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const userId = req.user.id;

        const groupQuery = `
            SELECT id, user_id, type_of_group, created_at
            FROM techcoach_lite.techcoach_decision_group
            WHERE user_id = ?
        `;
        
        const [groupResult] = await conn.query(groupQuery, [userId]);

        console.log("Group Result", groupResult);

        if (groupResult === undefined) {
            return res.status(200).json({ error: 'No groups found for this user' });
        }

        const groupId = groupResult.id;

        const groupMemberQuery = `
            SELECT member_id, status
            FROM techcoach_lite.techcoach_decision_group_member
            WHERE group_id = ?
        `;

        const groupMemberResult = await conn.query(groupMemberQuery, [groupId]);

        console.log("Group Member Result", groupMemberResult);

        if (groupMemberResult.length === 0) {
            return res.status(200).json({ group: groupResult, error: 'No members found for this group' });
        }

        const memberDetailsQuery = `
            SELECT user_id, displayname, email 
            FROM techcoach_lite.techcoach_users 
            WHERE user_id = ?
        `;

        const memberDetailsPromises = groupMemberResult.map(async (member) => {
            const memberDetailsResult = await conn.query(memberDetailsQuery, [member.member_id]);
            if (memberDetailsResult.length > 0) {
                // Assuming only one result per user_id
                const memberDetail = memberDetailsResult[0];
                return { ...memberDetail, status: member.status };
            }
            return null;
        });

        const memberDetailsResult = (await Promise.all(memberDetailsPromises)).filter(Boolean);

        console.log("Member Details Result", memberDetailsResult);

        await conn.commit();
        res.status(200).json({ group: groupResult, members: memberDetailsResult });
    } catch (error) {
        console.error('Error fetching Decision Circle details', error);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ error: 'An error occurred while fetching the group details' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

const removeMemberFromDecision = async (req, res) => {
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
        console.error('Error in removing member from Decision circle', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};

const getAddMemberNameList = async (req, res) => {
    const { existingMemberIds } = req.body;
    // console.log("request body from add member", existingMemberIds);

    const userId = req.user.id;

    let conn;
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        let query;
        let queryParams = [];

        if (existingMemberIds.length === 0) {
            query = `
                SELECT * 
                FROM techcoach_lite.techcoach_users 
                WHERE user_id != ?
            `;
            queryParams = [userId];
        } else {
            query = `
                SELECT * 
                FROM techcoach_lite.techcoach_users 
                WHERE user_id NOT IN (?) AND user_id != ?
            `;
            queryParams = [existingMemberIds, userId];
        }

        const result = await conn.query(query, queryParams);

        console.log("Resulssssssssssst:", result);

        await conn.commit();
        res.status(200).json({ message: 'Members fetched successfully', result });
    } catch (error) {
        console.error('Error in fetching potential members', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
}

const addMemberInDecisionCircle = async(req, res) =>{

    // console.log("request body from add member list", req.body.data);
    const {userId, groupId}  = req.body.data;
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const query = `
        INSERT INTO techcoach_lite.techcoach_decision_group_member (group_id, member_id, status) VALUES (?, ?,?)
    `;

    const result = await conn.query(query, [groupId, userId, '']);

        //console.log("result from Add member query", result);

        await conn.commit();
        res.status(200).json({ message: 'Member added sucessfully'});
    } catch (error) {
        console.error('Error in adding member to inner circle', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
}

const shareDecisionInDecisionCircle = async (req, res) => {
    const { decisionId, groupId, memberId } = req.body;
    // console.log("req body frommmm share decisionnnnnnn", req.body);
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        await conn.query(`
            INSERT INTO techcoach_lite.techcoach_decision_group_shared_decisions (groupId, groupMember, decisionId)
            VALUES (?, ?, ?)
        `, [groupId, memberId, decisionId]);    

        await conn.commit();

        res.status(200).json({ message: 'Decision shared successfully' });
    } catch (error) {
        console.error('Error sharing decision:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};

const getSharedMemberss = async (req, res) => {
    const { groupId, decisionId } = req.body;
    // console.log("reqqqqqqqqqq body", req.body);
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const result = await conn.query(`
            SELECT groupMember FROM techcoach_lite.techcoach_decision_group_shared_decisions WHERE groupId = ? AND decisionId = ?
        `, [groupId, decisionId]);

        await conn.commit();

        console.log("result from fetched members", result);

        res.status(200).json({ message: 'Shared Members Fetched Successfully', result });
    } catch (error) {
        console.error('Error fetching shared members:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};

const getDecisionCircleAcceptNotification = async (req, res) => {
    let conn;
    let userId = req.user.id;

    // console.log("User Id:", userId);
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const notAcceptedMembersQuery = `
            SELECT *
            FROM techcoach_lite.techcoach_decision_group_member
            WHERE member_id = ? AND status = ''
        `;
        const notAcceptedMembersResult = await conn.query(notAcceptedMembersQuery, [userId]);

        // console.log("Not Accepted Members:", notAcceptedMembersResult);

        if (notAcceptedMembersResult.length > 0) {
            const groupIds = notAcceptedMembersResult.map(member => member.group_id);

            console.log("kkkkkkkkkkkkkk", groupIds);

            const acceptedMembersQuery = `
                SELECT *
                FROM techcoach_lite.techcoach_decision_group_member
                WHERE group_id IN (?) AND status = 'Accepted'
            `;
            
            const acceptedMembersResult = await conn.query(acceptedMembersQuery, [groupIds]);

            console.log("Accepted Members:", acceptedMembersResult);

            const groupDetailsMap = {};

            for (const member of notAcceptedMembersResult) {
                const groupId = member.group_id;

                console.log("iddddddddddddd", groupId);

                const groupQuery = `
                    SELECT created_by
                    FROM techcoach_lite.techcoach_decision_group
                    WHERE id = ?
                `;
                const groupResult = await conn.query(groupQuery, [groupId]);

                if (groupResult.length > 0) {
                    const createdBy = groupResult[0].created_by;

                    console.log("ssssssssss", createdBy);

                    const userQuery = `
                        SELECT *
                        FROM techcoach_lite.techcoach_users
                        WHERE user_id = ?`;
                    
                    const userResult = await conn.query(userQuery, [createdBy]);
                    groupDetailsMap[groupId] = {
                        createdBy,
                        userDetails: userResult.length > 0 ? userResult[0] : null
                    };
                }
            }

            const acceptedDetailsMap = {};

            for (const member of acceptedMembersResult) {
                const createdBy = member.member_id;

                const userQuery = `
                    SELECT *
                    FROM techcoach_lite.techcoach_users
                    WHERE user_id = ?
                `;
                const userResult = await conn.query(userQuery, [createdBy]);

                console.log("Accepted Members Details:", userResult);

                acceptedDetailsMap[member.group_id] = {
                    userDetails: userResult.length > 0 ? userResult[0] : null
                };
            }

            console.log("Group Details Map:", groupDetailsMap);

            await conn.commit();

            res.status(200).json({
                message: 'Not Accepted Members Fetched Successfully',
                notAcceptedMembers: notAcceptedMembersResult,
                acceptedMembers: acceptedMembersResult,
                acceptedDetails: acceptedDetailsMap,
                groupDetails: groupDetailsMap
            });
        } else {
            await conn.commit();
            res.status(200).json({
                message: 'No Not Accepted Members Found',
                notAcceptedMembers: [],
                acceptedMembers: [],
                acceptedDetails: {},
                groupDetails: {}
            });
        }
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Error fetching members:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};

const acceptOrRejectDecisionCircle = async (req, res) => {
    // console.log("reqqqqqqqqqq body", req.body);

    const { groupId, status } = req.body.data; 
    const userId = req.user.id;
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        await conn.query(`
            UPDATE techcoach_lite.techcoach_decision_group_member
            SET status = ? 
            WHERE group_id = ? AND member_id = ?
        `, [status, groupId, userId]);

        await conn.commit();

        res.status(200).json({ message: 'Notification status updated successfully' });
    } catch (error) {
        console.error('Error updating notification status:', error);
        await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};

const decisionCircleInvitation = async (req, res) => {
  const { email } = req.body;
  const { email: senderEmail } = req.user;
  let conn;

  try {
      conn = await getConnection();
      await conn.beginTransaction();

      const groupMemberQuery = 'SELECT * FROM techcoach_lite.techcoach_users WHERE email = ?';
      const groupMemberRows = await conn.query(groupMemberQuery, [senderEmail]);
      const groupMemberDetails = groupMemberRows[0];
      console.log("Group member details:", groupMemberDetails);

      const emailPayload = {
          from: {
              address: "Decision-Coach@www.careersheets.in"
          },
          to: [
              {
                  email_address: {
                      address: email
                  }
              }
          ],
          subject: `Join ${groupMemberDetails.displayname}'s Decision Circle`,
          htmlbody: `<div style="font-family: Arial, sans-serif; color: #333;">
              <p>Hi ,</p>
              <p>${groupMemberDetails.displayname} wants to add you as a member of their Decision circle in the Decision Coach app.</p>
              <p>Please join the Decision Coach application and provide your inputs on decisions.</p>
              <p style="text-align: center;">
                  <a href="https://decisioncoach.onrender.com" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Click here to access the application</a>
              </p>
              <p>Regards,</p>
              <p>Team @ Decision Coach</p>
          </div>`
      };

      const zeptoMailApiUrl = 'https://api.zeptomail.in/v1.1/email';
      const zeptoMailApiKey = 'PHtE6r1cReDp2m599RcG4aC8H5L3M45/+ONleQcSttwWWfEGSU1UrN8swDDjr08uV/cTE6OSzNpv5++e4e2ALWvqY2pIVGqyqK3sx/VYSPOZsbq6x00ZslQcfkbeUYHsd9Zs0ifRu92X';

      const emailResponse = await axios.post(zeptoMailApiUrl, emailPayload, {
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Zoho-enczapikey ${zeptoMailApiKey}`
          }
      });

      console.log("Email sent response:", emailResponse.data);

      await conn.commit();
      res.status(200).json({ message: 'Mail Sent Successfully' });
  } catch (error) {
      console.error('Error in sending mail on invite to Decision circle:', error);
      if (conn) await conn.rollback();
      res.status(500).json({ error: 'An error occurred while processing your request' });
  } finally {
      if (conn) conn.release();
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
        res.status(500).json({ error: 'An error occurred while deleting the decision group' });
    } finally {
        if (conn) conn.release();
    }
};


module.exports = {
    getUserList,
    decisionCircleCreation,
    checkDecisionCircleExists,
    getDecisionCircleDetails,
    removeMemberFromDecision,
    getAddMemberNameList,
    addMemberInDecisionCircle,
    shareDecisionInDecisionCircle,
    getSharedMemberss,
    getDecisionCircleAcceptNotification,
    acceptOrRejectDecisionCircle,
    decisionCircleInvitation,
    decisionCircleAddInvitation,
    // groupNames controller
    postdecisionGroup,
    getAlldecisionGroup,
    getDecisionGroup,
    putDecisionGroup,
    deleteDecisionGroup
  };