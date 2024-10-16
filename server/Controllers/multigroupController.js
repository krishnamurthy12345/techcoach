const getConnection = require('../Models/database');
const crypto = require('crypto');
const axios = require('axios');

const getUserList = async (req, res) => {
    let conn;
    try {

        const userId = req.user.id;
        // console.log("user id from get user list", userId);
        conn = await getConnection();
        await conn.beginTransaction();

        const tasks = await conn.query(`
      SELECT * FROM techcoach_lite.techcoach_users WHERE user_id != ?;
    `, [userId]);

        await conn.commit();
        res.status(200).json({ message: 'User List Fetched successfully', tasks });
    } catch (error) {
        console.error('Error inserting data:', error);
        if (conn) 
            await conn.rollback();
          
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

const decisionCircleCreation = async (req, res) => {
    const { group_name, members } = req.body;
    const user_id = req.user.id;

    console.log('Request Body:', req.body);


    if (!group_name || !members || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ error: 'Invalid input data.' });
    }

    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const groupResult = await conn.query(
            `SELECT id FROM techcoach_lite.techcoach_decision_group WHERE group_name = ?`,
            [group_name]
        );

        if (groupResult.length === 0) {
            return res.status(404).json({ error: 'Group not found.' });
        }

        const group_id = groupResult[0].id;

        for (const member of members) {
            const member_id = member.user_id;
            await conn.query(
                `INSERT INTO techcoach_lite.techcoach_decision_group_member (group_id, member_id, status) VALUES (?,?,'active')`,
                [group_id, member_id]
            );
        }
        await conn.commit();
        res.status(200).json({ message: 'Members added successfully to the decision circle', group_name });
    } catch (error) {
        console.error('Error in adding members to Decision Circle:', error.message);
        if (conn) {
            await conn.rollback();
          }
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};

const getUserDecisionCircles = async (req, res) => {
    const user_id = req.user.id;
    console.log('Retrieved user_id:', user_id);

    let conn;

    try {
        conn = await getConnection();
        const circles = await conn.query(
            `SELECT g.group_name, g.id
             FROM techcoach_lite.techcoach_decision_group g
             JOIN techcoach_lite.techcoach_decision_group_member m ON g.id = m.group_id
             WHERE m.member_id = ?`,
            [user_id]
        );

        console.log('Query result:', circles);
        res.status(200).json({ decisionCircles: circles });
    } catch (error) {
        console.error('Error fetching user decision circles:', error);
        res.status(500).json({ error: 'An error occurred while fetching decision circles.' });
    } finally {
        if (conn) conn.release();
    }
};

const getAllGroups = async (req, res) => {
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        // Query to get all groups
        const groupQuery = `
            SELECT id, group_name
            FROM techcoach_lite.techcoach_decision_group
            WHERE user_id = ?  
        `;

        const groupResult = await conn.query(groupQuery, [req.user.id]);

        await conn.commit();
        res.status(200).json(groupResult);
    } catch (error) {
        console.error('Error fetching all groups:', error.message);
        if (conn) {
            await conn.rollback();
          }
        res.status(500).json({ error: 'An error occurred while fetching group details' });
    } finally {
        if (conn) conn.release();
    }
};

const getUsersForGroup = async (req, res) => {
    const { groupId } = req.params;
    let conn;
    console.log('Group ID', groupId);

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        // Query to get group details
        const groupQuery = `
            SELECT id, group_name, user_id
            FROM techcoach_lite.techcoach_decision_group
            WHERE id = ?
        `;

        const groupResult = await conn.query(groupQuery, [groupId]);

        if (groupResult.length === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Query to get members of the group
        const membersQuery = `
            SELECT techcoach_lite.techcoach_users.user_id, techcoach_lite.techcoach_users.displayname, techcoach_lite.techcoach_users.email, techcoach_lite.techcoach_decision_group_member.status
            FROM techcoach_lite.techcoach_decision_group_member
            JOIN techcoach_lite.techcoach_users ON techcoach_lite.techcoach_decision_group_member.member_id = techcoach_lite.techcoach_users.user_id
            WHERE techcoach_lite.techcoach_decision_group_member.group_id = ?
        `;

        const membersResult = await conn.query(membersQuery, [groupId]);

        await conn.commit();
        res.status(200).json({ group: groupResult, members: membersResult });
    } catch (error) {
        console.error('Error fetching users for the group', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while fetching group details' });
    } finally {
        if (conn) conn.release();
    }
};

const removeUsersFromGroup = async (req, res) => {
    const { groupId, userId } = req.params;
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const groupQuery = `
            SELECT id
            FROM techcoach_lite.techcoach_decision_group
            WHERE id = ?
        `;
        const groupResult = await conn.query(groupQuery, [groupId]);

        if (groupResult.length === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const memberCheckQuery = `
            SELECT member_id
            FROM techcoach_lite.techcoach_decision_group_member
            WHERE group_id = ? AND member_id = ?
        `;
        const memberCheckResult = await conn.query(memberCheckQuery, [groupId, userId]);

        if (memberCheckResult.length === 0) {
            return res.status(404).json({ error: 'User is not a member of the group' });
        }

        const removeMemberQuery = `
            DELETE FROM techcoach_lite.techcoach_decision_group_member
            WHERE group_id = ? AND member_id = ?
        `;
        await conn.query(removeMemberQuery, [groupId, userId]);

        await conn.commit();
        res.status(200).json({ message: 'User removed from the group successfully' });
    } catch (error) {
        console.error('Error removing user from the group', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while removing the user from the group' });
    } finally {
        if (conn) conn.release();
    }
};

const sendDecisionCircleInvitation = async (req, res) => {
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

const decisionshareDecisionCircle = async (req, res) => {
    const { group_id, decision_id } = req.body;

    if (!group_id || !decision_id) {
        return res.status(400).json({ error: 'group_id and decision_id are required' });
    }

    let conn;
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const query = `INSERT INTO techcoach_lite.techcoach_decision_group_share_decisions (group_id, decision_id) VALUES (?, ?)`;

        // Execute the query
        const result = await conn.query(query, [group_id, decision_id]);

        console.log('Query Result:', result); // Log the result for debugging

        // Commit the transaction to save changes
        await conn.commit();

        // Send success response
        res.status(200).json({
            message: 'Decision Shared Successfully',
            sharedDecision: {
                group_id,
                decision_id,
            },
        });
    } catch (error) {
        console.error('Error Sharing Decision:', error);

        // Rollback the transaction if there's an error
        if (conn) await conn.rollback();

        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        // Release the connection back to the pool
        if (conn) await conn.release();
    }
};

const getdecisionSharedDecisionCircle = async (req, res) => {
    const userId = req.user.id;
    const { groupId } = req.params;
    let conn;
    // console.log('User ID:', userId); 
    // console.log('Group ID:', groupId);

    const decryptText = (text, key) => {
        if (!text) return text;
        try {
            const decipher = crypto.createDecipher('aes-256-cbc', key);
            let decryptedText = decipher.update(text, 'hex', 'utf8');
            decryptedText += decipher.final('utf8');
            return decryptedText;
        } catch (error) {
            console.error('Error decrypting text:', error);
            return null;
        }
    };

    try {
        conn = await getConnection();

        const sharedDecisionsQuery = `
        SELECT 
          tgsd.decision_id,
          td.decision_name,
          td.user_statement,
          td.decision_taken_date,
          td.decision_due_date,
          tg.group_name,
          tg.type_of_group,
          tu.displayname AS shared_by,
          tu.email AS shared_by_email
        FROM techcoach_lite.techcoach_decision_group_share_decisions tgsd
        JOIN techcoach_lite.techcoach_decision td ON tgsd.decision_id = td.decision_id
        JOIN techcoach_lite.techcoach_decision_group tg ON tgsd.group_id = tg.id
        JOIN techcoach_lite.techcoach_users tu ON td.user_id = tu.user_id
        WHERE tg.user_id = ? AND tg.id = ?
      `;

        const sharedDecisions = await conn.query(sharedDecisionsQuery, [userId, groupId]);
        // console.log('Shared Decisions Query Result:', sharedDecisions);


        if (!Array.isArray(sharedDecisions)) {
            res.status(500).json({ error: 'Unexpected data format: sharedDecisions is not an array' });
            return;
        }

        if (sharedDecisions.length === 0) {
            res.status(200).json({ message: 'No shared decisions found', decisionCount: 0 });
            return;
        }

        // Decrypt decision_name and user_statement for each decision
        const decryptedDecisionData = await Promise.all(sharedDecisions.map(async (decision) => {
            const decryptedDecisionName = decryptText(decision.decision_name, req.user.key);
            const decryptedUserStatement = decryptText(decision.user_statement, req.user.key);
            // console.log('Decrypted Decision Name:', decryptedDecisionName); // Log decryption result
            // console.log('Decrypted User Statement:', decryptedUserStatement);

            // Fetch decision reasons for each decision
            const decisionReasons = await conn.query(`
          SELECT decision_reason_text 
          FROM techcoach_lite.techcoach_decision_reason 
          WHERE decision_id = ?
        `, [decision.decision_id]);

            // Decrypt each decision reason
            const decryptedReasons = decisionReasons.map(reason => decryptText(reason.decision_reason_text, req.user.key));

            return {
                ...decision,
                decision_name: decryptedDecisionName,
                user_statement: decryptedUserStatement,
                decision_reason: decryptedReasons
            };
        }));

        const decisionIds = decryptedDecisionData.map(decision => decision.decision_id);

        const decisionTags = await conn.query(
            `SELECT dt.decision_id, t.tag_name, t.tag_type 
             FROM techcoach_lite.techcoach_decision_tag_linked_info dt
             JOIN techcoach_lite.techcoach_tag_info t ON dt.tag_id = t.id
             WHERE dt.decision_id IN (?)`,
            [decisionIds]
        );

        // Attach tags to corresponding decisions
        decryptedDecisionData.forEach(decision => {
            decision.tags = decisionTags
                .filter(tag => tag.decision_id === decision.decision_id)
                .map(tag => ({ tag_name: tag.tag_name, tag_type: tag.tag_type }));
        });


        // Return the results
        res.status(200).json({
            message: 'Shared Decisions Fetched Successfully',
            results: decryptedDecisionData,
            decisionCount: decryptedDecisionData.length
        });

    } catch (error) {
        console.error('Error fetching shared decisions:', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while fetching shared decisions' });
    } finally {
        if (conn) conn.release();
    }
};

const getMemberSharedDecisions = async (req, res) => {
    const userId = req.user.id;
    const { groupId } = req.params;
    let conn;

    const decryptText = (text, key) => {
        try {
            const decipher = crypto.createDecipher('aes-256-cbc', key);
            let decryptedText = decipher.update(text, 'hex', 'utf8');
            decryptedText += decipher.final('utf8');
            return decryptedText;
        } catch (error) {
            console.error('Error decrypting text:', error);
            return 'Decryption failed';
        }
    };

    const encryptText = (text, key) => {
        try {
            const cipher = crypto.createCipher('aes-256-cbc', key);
            let encryptedText = cipher.update(text, 'utf8', 'hex');
            encryptedText += cipher.final('hex');
            return encryptedText;
        } catch (error) {
            console.error('Error encrypting text:', error);
            return null;
        }
    };

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        // Fetch decisions shared with the group
        const decisionQuery = `
            SELECT 
              tgsd.decision_id,
              td.decision_name,
              td.user_statement,
              td.decision_taken_date,
              td.decision_due_date,
              tg.group_name,
              tg.type_of_group,
              tu.displayname AS shared_by,
              tu.email AS shared_by_email
            FROM techcoach_lite.techcoach_decision_group_share_decisions tgsd
            JOIN techcoach_lite.techcoach_decision td ON tgsd.decision_id = td.decision_id
            JOIN techcoach_lite.techcoach_decision_group tg ON tgsd.group_id = tg.id
            JOIN techcoach_lite.techcoach_users tu ON td.user_id = tu.user_id
            WHERE tg.id = ?`;
        
        const getDecisions = await conn.query(decisionQuery, [groupId]);
        console.log('weee',getDecisions);

        if (!Array.isArray(getDecisions) || !getDecisions.length) {
            return res.status(200).json({ message: 'No decisions found', results: [], decisionCount: 0 });
        }

        const decisionDetailsMap = new Map();

        // Loop through decisions, decrypt fields and fetch additional data
        for (const decision of getDecisions) {
            const { decision_id, shared_by, shared_by_email } = decision;

            // Key generation for decryption (you might need to modify this logic)
            const keyData = undefined + shared_by + shared_by_email;
            const encryptedKey = encryptText(keyData, process.env.PUBLIC_KEY);

            // Decrypt fields
            decision.decision_name = decryptText(decision.decision_name, encryptedKey);
            decision.user_statement = decryptText(decision.user_statement, encryptedKey);

            // Fetch and decrypt decision reasons
            const decisionReasonQuery = `
                SELECT decision_reason_text 
                FROM techcoach_lite.techcoach_decision_reason 
                WHERE decision_id = ?`;

            const decisionReasons = await conn.query(decisionReasonQuery, [decision_id]);

            decision.reasons = decisionReasons.map(reason => 
                decryptText(reason.decision_reason_text, encryptedKey)
            );

            decisionDetailsMap.set(decision_id, decision);
        }

        // Extract decision IDs for querying tags
        const decisionIds = [...decisionDetailsMap.keys()];

        if (decisionIds.length > 0) {
            // Fetch tags associated with the decisions
            const tagQuery = `
                SELECT dt.decision_id, t.tag_name, t.tag_type 
                FROM techcoach_lite.techcoach_decision_tag_linked_info dt
                JOIN techcoach_lite.techcoach_tag_info t ON dt.tag_id = t.id
                WHERE dt.decision_id IN (?)`;

            const decisionTags = await conn.query(tagQuery, [decisionIds]);

            // Attach tags to corresponding decisions
            decisionTags.forEach(tag => {
                const decision = decisionDetailsMap.get(tag.decision_id);
                if (decision) {
                    if (!decision.tags) {
                        decision.tags = [];
                    }
                    decision.tags.push({ tag_name: tag.tag_name, tag_type: tag.tag_type });
                }
            });
        }

        const decryptedResults = [...decisionDetailsMap.values()];

        res.status(200).json({
            message: 'Group members and decisions fetched successfully',
            results: decryptedResults,
            decisionCount: decryptedResults.length
        });

        await conn.commit();
    } catch (error) {
        console.error('Error fetching group members with decisions:', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while fetching group members and decisions' });
    } finally {
        if (conn) conn.release();
    }
};


const getSharedDecisionCircleCount = async (req, res) => {
    const userId = req.user.id;
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const decisionCountQuery = `
        SELECT COUNT(*) AS decisionCount
        FROM techcoach_lite.techcoach_decision_group_share_decisions tgsd
        JOIN techcoach_lite.techcoach_decision_group tg ON tgsd.group_id = tg.id
        WHERE tg.user_id = ?
      `;

        const decisionCountResult = await conn.query(decisionCountQuery, [userId]);

        if (!decisionCountResult) {
            res.status(500).json({ error: 'Failed to retrieve decision count' });
            return;
        }

        const decisionCount = decisionCountResult.decisionCount || 0;

        await conn.commit();

        // Return the decision count
        res.status(200).json({
            message: 'Decision count fetched successfully',
            decisionCount
        });
    } catch (error) {
        console.error('Error fetching decision count:', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while fetching the decision count' });
    } finally {
        if (conn) conn.release();
    }
};

// const decisionCirclePostComment = async (req, res) => {
//     const { decision, memberId, comment } = req.body;
//     console.log('request body',req.body);
//     let conn;

//  const truncateText = (text, maxLength) => {
//     if (!text || text.length <= maxLength) return text; 
//     const firstPart = text.substring(0, 10);
//     const lastPart = text.substring(text.length - 10);
//     return `${firstPart}...${lastPart}`;
// };


//     try {
//         conn = await getConnection();
//         await conn.beginTransaction();

//         // Fetch the group member details
//         const groupMemberQuery = 'SELECT * FROM techcoach_lite.techcoach_users WHERE user_id = ?';
//         const groupMemberRows = await conn.query(groupMemberQuery, [memberId]);
//         const groupMemberDetails = groupMemberRows[0];
//         console.log('seseee',groupMemberDetails);

//         const { decision_name, decision_due_date, creation_date } = decision;
//         const truncatedComment = truncateText(comment, 20);

//         // Fetch users from the group
//         const groupId = decision.group_id; // Assuming decision has group_id
//         const usersQuery = `
//             SELECT techcoach_users.email, techcoach_users.displayname
//             FROM techcoach_lite.techcoach_decision_group_member
//             JOIN techcoach_lite.techcoach_users ON techcoach_lite.techcoach_decision_group_member.member_id = techcoach_lite.techcoach_users.user_id
//             WHERE techcoach_decision_group_member.group_id = ?
//         `;
//         const usersResult = await conn.query(usersQuery, [groupId]);
//         console.log('awuerr',usersResult);

//         // Loop through the users and send the email to each one
//         const zeptoMailApiUrl = 'https://api.zeptomail.in/v1.1/email';
//         const zeptoMailApiKey = 'PHtE6r1cReDp2m599RcG4aC8H5L3M45/+ONleQcSttwWWfEGSU1UrN8swDDjr08uV/cTE6OSzNpv5++e4e2ALWvqY2pIVGqyqK3sx/VYSPOZsbq6x00ZslQcfkbeUYHsd9Zs0ifRu92X';

//         for (const user of usersResult) {
//             const htmlBody = `
//                 <div style="font-family: Arial, sans-serif; color: #333;">
//                     <p>Dear ${user.displayname},</p>
//                     <p>A comment has been posted on the decision titled "<strong>${decision_name}</strong>":</p>
//                     <p><strong>Creation Date:</strong> ${new Date(creation_date).toLocaleDateString()}</p>
//                     <p><strong>Due Date:</strong> ${new Date(decision_due_date).toLocaleDateString()}</p>
//                     <p><strong>Comment by ${groupMemberDetails.displayname}</strong></p>
//                     <p><em>${truncatedComment}</em></p>
//                     <p>Regards,</p>
//                     <p>Team @ Decision Coach</p>
//                 </div>
//             `;

//             const emailPayload = {
//                 from: {
//                     address: "Decision-Coach@www.careersheets.in"
//                 },
//                 to: [
//                     {
//                         email_address: {
//                             address: user.email
//                         }
//                     }
//                 ],
//                 subject: "Comment Posted on Your Shared Decision Circle",
//                 htmlbody: htmlBody
//             };

//             // Send email to the user
//             await axios.post(zeptoMailApiUrl, emailPayload, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Zoho-enczapikey ${zeptoMailApiKey}`
//                 }
//             });
//         }

//         await conn.commit();
//         res.status(200).json({ message: 'Mail sent to all group members successfully!' });
//     } catch (error) {
//         if (conn) await conn.rollback();
//         console.error('Error in sending mail on post comment to Decision Circle:', error);
//         res.status(500).json({ error: 'An error occurred while sending mail to the group' });
//     } finally {
//         if (conn) conn.release();
//     }
// };

const decisionCirclePostComment = async (req, res) => {
    // console.log("Request body:", req.body.decision);

    const { decision, memberId, comment, email } = req.body;

    let conn;

 const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text; 
    const firstPart = text.substring(0, 10);
    const lastPart = text.substring(text.length - 10);
    return `${firstPart}...${lastPart}`;
};

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const groupMemberQuery = 'SELECT * FROM techcoach_lite.techcoach_users WHERE user_id = ?';
        const groupMemberRows = await conn.query(groupMemberQuery, [memberId]);
        const groupMemberDetails = groupMemberRows[0];
        console.log("Group member details:", groupMemberDetails);

        const { decision_name, decision_due_date, creation_date } = decision;

        const truncatedCommentText = truncateText(comment, 20);

        const htmlBody = `<div style="font-family: Arial, sans-serif; color: #333;">
            <p>Dear ${decision.userDetails.displayname},</p>
            <p>A comment has been posted on the decision titled "<strong>${decision_name}</strong>":</p>
            <p><strong>Creation Date:</strong> ${new Date(creation_date).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(decision_due_date).toLocaleDateString()}</p>
            <p><strong>Comment by ${groupMemberDetails.displayname}:</strong></p>
            <p><em>${truncatedCommentText}</em></p>
            <p>Regards,</p>
            <p>Team @ Decision Coach</p>
        </div>`;

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
            subject: "Comment Posted on Your Shared Decision",
            htmlbody: htmlBody
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
        console.error('Error in sending mail on Post comment to inner circle:', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};

const getSharedDecisionCircleDetails = async (req, res) => {
    const { id } = req.user;
    let conn;

    const decryptText = (text, key) => {
        try {
            const decipher = crypto.createDecipher('aes-256-cbc', key);
            let decryptedText = decipher.update(text, 'hex', 'utf8');
            decryptedText += decipher.final('utf8');
            return decryptedText;
        } catch (error) {
            console.error('Error decrypting text:', error);
            return null;
        }
    };

    const encryptText = (text, key) => {
        try {
            const cipher = crypto.createCipher('aes-256-cbc', key);
            let encryptedText = cipher.update(text, 'utf8', 'hex');
            encryptedText += cipher.final('hex');
            return encryptedText;
        } catch (error) {
            console.error('Error encrypting text:', error);
            return null;
        }
    };

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const groups = await conn.query(
            `SELECT * FROM techcoach_lite.techcoach_decision_group WHERE user_id = ?`,
            [id]
        );

        if (groups.length === 0) {
            await conn.commit();
            return res.status(200).json({ message: 'No groups found for this user' });
        }

        const groupIds = groups.map(group => group.id);

        const sharedDecisions = await conn.query(
            `SELECT * FROM techcoach_lite.techcoach_decision_group_share_decisions WHERE group_id IN (?)`,
            [groupIds]
        );

        if (sharedDecisions.length === 0) {
            await conn.commit();
            return res.status(200).json({ message: 'No shared decisions found for these groups' });
        }

        const groupMembers = sharedDecisions.map(sd => sd.groupMember);
        const decisionIds = sharedDecisions.map(sd => sd.decisionId);

        const tasks = await conn.query(
            `SELECT * FROM techcoach_lite.techcoach_users WHERE user_id IN (?)`,
            [groupMembers]
        );

        const currentUser = (await conn.query(
            `SELECT * FROM techcoach_lite.techcoach_users WHERE user_id = ?`,
            [id]
        ))[0];

        // console.log("ssssssssssssss", currentUser);

        const decisions = await conn.query(
            `SELECT * FROM techcoach_lite.techcoach_decision WHERE decision_id IN (?)`,
            [decisionIds]
        );

        const keyData = undefined + currentUser.displayname + currentUser.email;
        const encryptedKey = encryptText(keyData, process.env.PUBLIC_KEY);

        // Decrypt decision details
        decisions.forEach(decision => {
            decision.decision_name = decryptText(decision.decision_name, encryptedKey);
            decision.user_statement = decryptText(decision.user_statement, encryptedKey);
        });

        // Fetch and link tag information
        const decisionTags = await conn.query(
            `SELECT dt.decision_id, t.tag_name, t.tag_type 
             FROM techcoach_lite.techcoach_decision_tag_linked_info dt
             JOIN techcoach_lite.techcoach_tag_info t ON dt.tag_id = t.id
             WHERE dt.decision_id IN (?)`,
            [decisionIds]
        );

        decisions.forEach(decision => {
            decision.tags = decisionTags
                .filter(tag => tag.decision_id === decision.decision_id)
                .map(tag => ({ tag_name: tag.tag_name, tag_type: tag.tag_type }));
        });

        await conn.commit();
        res.status(200).json({ sharedDecisions, tasks, decisions });
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Error in fetching shared decision details', error);
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


// Decision-Circle comment Controller

// const postComment = async (req, res) => {
//     const { comment, groupId, decision_id, MemberID } = req.body; 
//     console.log('Request Body:', req.body);


//     let conn;
//     try {
//         conn = await getConnection();
//         await conn.beginTransaction();

//         // Prepare the query
//         const insertComment = `
//         INSERT INTO techcoach_lite.techcoach_decision_conversations 
//         (group_id, member_id, comment, decision_id, created_at) 
//         VALUES (?, ?, ?, ?, NOW());
//     `;

//         // Pass member_id to the query parameters
//         await conn.query(insertComment, [groupId, MemberID, comment, decision_id]);

//         console.log('Insert the comment result:', commentResult);

//         await conn.commit();
//         res.status(200).json({ 
//             message: 'Comment posted successfully', 
//             commentId: commentResult.insertId 
//         });
//     } catch (error) {
//         console.error('Error processing request:', error);
//         if (conn) await conn.rollback();
//         res.status(500).json({ error: 'An error occurred while processing your request' });
//     } finally {
//         if (conn) conn.release();
//     }
// };

// const getComment = async(req,res)=>{
//     const { id } = req.params;
//     let conn;
//     try {
//         conn = await getConnection();

//         const commentQuery = `
//        SELECT
//             td.id,
//             td.group_id,
//             td.member_id,
//             td.decision_id,
//             td.comment,
//             td.created_at,
//             td.parentCommentId,
//             td.updated_at,
//             tu.user_id,
//             tu.displayname,
//             tu.email
//         FROM
//             techcoach_lite.techcoach_decision_conversations td 
//         LEFT JOIN
//             techcoach_lite.techcoach_users tu
//         ON
//             td.member_id = tu.user_id
//         WHERE 
//             td.decision_id = ?
//         `;
//         const comments = await conn.query(commentQuery,[id]);

//         if (comments.length === 0) {
//             return res.status(404).json({ message: 'No comments found for this decision' });
//         }

//         res.status(200).json(comments);
//     } catch (error) {
//         console.error('Error Fetching comments:',error);
//         res.status(500).json({ error: 'An error occured while fetching comments'})
//     } finally {
//         if (conn) conn.release();
//     }

// }

// const getShareDecisionComment = async(req,res)=>{
//     const user_id = req.user.id;
//     const { id } = req.params;
//     let conn;
//     try {
//         conn = await getConnection();

//         const commentQuery = `
//        SELECT
//             td.id,
//             td.group_id,
//             td.member_id,
//             td.decision_id,
//             td.comment,
//             td.created_at,
//             td.parentCommentId,
//             td.updated_at,
//             tu.user_id,
//             tu.displayname,
//             tu.email
//         FROM
//             techcoach_lite.techcoach_decision_conversations td 
//         LEFT JOIN
//             techcoach_lite.techcoach_users tu
//         ON
//             td.member_id = tu.user_id
//         WHERE 
//             td.decision_id = ?
//         `;
//         const comments = await conn.query(commentQuery,[id]);

//         comments.forEach(comment =>{
//             if (comment.member_id === user_id) {
//                 comment.type_of_member = 'author';
//             } else {
//                 comment.type_of_member = 'member';
//             }
//         });

//         res.status(200).json(comments);
//     } catch (error) {
//         console.error('Error Fetching comments:',error);
//         res.status(500).json({ error: 'An error occured while fetching comments'})
//     } finally {
//         if (conn) conn.release();
//     }

// }

// const postReplyDecisionComment = async (req, res) => {
//     // console.log("request body from post reply", req.body);
//     const {commentId, reply, groupId, decisionId} = req.body;

//     const userId = req.user.id;

//     let conn;
//     try {
//         conn = await getConnection();
//         await conn.beginTransaction();

//         const query = await conn.query(
//             `INSERT INTO techcoach_lite.techcoach_decision_conversations (group_id, member_id, comment, created_at, parentCommentId, decision_id) 
//              VALUES (?, ?, ?, NOW(),?, ?)`,
//             [groupId, userId, reply, commentId, decisionId]
//         );

//         console.log("putttttttttttttt", query);

//         await conn.commit();
//         res.status(200).json({ message: 'Shared Decision Fetched successfully' });
//     } catch (error) {
//         console.error('Error in fetching shared decisions', error);
//         res.status(500).json({ error: 'An error occurred while processing your request' });
//     } finally {
//         if (conn) conn.release();
//     }
// };

// const editComments = async (req, res) => {
//     // console.log("reqqqqqqqqqq body editt", req.body);

//     const {commentId, editedContent} = req.body;

//     let conn;

//     try {
//         conn = await getConnection();
//         await conn.beginTransaction();

//         await conn.query(`
//             UPDATE techcoach_lite.techcoach_decision_conversations
//             SET comment = ?, updated_at = NOW()
//             WHERE id = ?
//         `, [editedContent, commentId]);

//         await conn.commit();

//         res.status(200).json({ message: 'Comments updated successfully' });
//     } catch (error) {
//         console.error('Error updating Comments:', error);
//         await conn.rollback();
//         res.status(500).json({ error: 'An error occurred while processing your request' });
//     } finally {
//         if (conn) conn.release();
//     }
// };

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

// const getComments = async (req, res) => {
//     const { group_id,decision_id } = req.params; 

//     try {
//       const conn = await getConnection();

//       const comments = await conn.query(`
//         SELECT * FROM techcoach_lite.techcoach_decision_conversations
//         WHERE group_id = ? AND decision_id = ?
//         ORDER BY created_at DESC
//       `, [group_id,decision_id]);

//       res.status(200).json(comments);
//     } catch (error) {
//       console.error('Error fetching comments:', error);
//       res.status(500).json({ message: 'Server error while fetching comments' });
//     }
// };

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


module.exports = {
    getUserList,
    decisionCircleCreation,
    getUserDecisionCircles,
    getAllGroups,
    getUsersForGroup,
    removeUsersFromGroup,
    sendDecisionCircleInvitation,
    decisionshareDecisionCircle,
    getdecisionSharedDecisionCircle,
    getMemberSharedDecisions,
    getSharedDecisionCircleCount,
    getSharedDecisionCircleDetails,
    decisionCirclePostComment,

    // groupNames controller
    postdecisionGroup,
    getAlldecisionGroup,
    getDecisionGroup,
    putDecisionGroup,
    deleteDecisionGroup,

    //   Group Conversations Controller
    // postComment,
    // getComment,
    // getShareDecisionComment,
    // postReplyDecisionComment,
    // editComments,

    postComment,
    getComments,
    updateComment,
    replyToComment,
    deleteComment,
};