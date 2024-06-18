const getConnection = require('../Models/database');
const crypto = require('crypto');
const axios = require('axios');

const getUserList = async (req, res) => {
  try {

    const userId = req.user.id;
    console.log("user id from get user list", userId);
    conn = await getConnection();
    await conn.beginTransaction();

    const tasks = await conn.query(`
      SELECT * FROM techcoach_lite.techcoach_task WHERE user_id != ?;
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

const innerCircleCreation = async (req, res) => {
    console.log("Request from creation of inner circle", req.body);

    const { type_of_group, members } = req.body;

    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();
        
        const created_by = req.user.id;
        //console.log("user id from circle creation", created_by);

        const groupResult = await conn.query(
            `INSERT INTO techcoach_lite.techcoach_groups (created_by, type_of_group, created_at) VALUES (?, ?, NOW())`,
            [created_by, type_of_group]
        );

        //console.log("Result from groups", groupResult);

        const insertId = groupResult.insertId.toString(); 
        const numericPart = insertId.split('n')[0];
        const groupId = parseInt(numericPart);

        for (const member of members) {
            const memberId = member.user_id;
            await conn.query(
                `INSERT INTO techcoach_lite.techcoach_group_members (group_id, member_id, status) VALUES (?, ?,?)`,
                [groupId, memberId,'']
            );
        }

        await conn.commit();
        //console.log('Inner Circle Created successfully');
        res.status(200).json({ message: 'Inner Circle Created successfully', groupId });
    } catch (error) {
        console.error('Error in creating Inner Circle', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

const checkInnerCircleExists = async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const query = `
            SELECT COUNT(*) AS count 
            FROM techcoach_lite.techcoach_groups 
            WHERE created_by = ?
        `;
        const userId = req.user.id;
        const [result] = await conn.query(query, [userId]);

        //console.log("count", result);

        const count = result.count;
        const exists = count > 0n ? true : false;

        await conn.commit();
        res.status(200).json({ message: 'Inner Circle fetched', exists });
    } catch (error) {
        console.error('Error in Inner Circle fetching', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};

const getInnerCircleDetails = async (req, res) => {
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const userId = req.user.id;

        const groupQuery = `
            SELECT id, created_by, type_of_group, created_at
            FROM techcoach_lite.techcoach_groups
            WHERE created_by = ?
        `;
        
        const [groupResult] = await conn.query(groupQuery, [userId]);

        console.log("Group Result", groupResult);

        if (groupResult === undefined) {
            return res.status(200).json({ error: 'No groups found for this user' });
        }

        const groupId = groupResult.id;

        const groupMemberQuery = `
            SELECT member_id, status
            FROM techcoach_lite.techcoach_group_members
            WHERE group_id = ?
        `;

        const groupMemberResult = await conn.query(groupMemberQuery, [groupId]);

        console.log("Group Member Result", groupMemberResult);

        if (groupMemberResult.length === 0) {
            return res.status(200).json({ group: groupResult, error: 'No members found for this group' });
        }

        const memberDetailsQuery = `
            SELECT user_id, displayname, email 
            FROM techcoach_lite.techcoach_task 
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
        console.error('Error fetching Inner Circle details', error);
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


const removeMemberFromInner = async (req, res) => {
    //console.log("request from remove", req.body);

    const { userId, group_id } = req.body;

    let conn;
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        console.log("request from remove", req.body);

        const query = `
            DELETE FROM techcoach_lite.techcoach_group_members
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

const getAddMemberNameList = async (req, res) => {
    const { existingMemberIds } = req.body;
    console.log("request body from add member", existingMemberIds);

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
                FROM techcoach_lite.techcoach_task 
                WHERE user_id != ?
            `;
            queryParams = [userId];
        } else {
            query = `
                SELECT * 
                FROM techcoach_lite.techcoach_task 
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

const addMemberInInnerCircle = async(req, res) =>{

    console.log("request body from add member list", req.body.data);
    const {userId, groupId}  = req.body.data;
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const query = `
        INSERT INTO techcoach_lite.techcoach_group_members (group_id, member_id, status) VALUES (?, ?,?)
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

const shareDecisionInInnerCircle = async (req, res) => {
    const { decisionId, groupId, memberId } = req.body;
    console.log("req body frommmm share decisionnnnnnn", req.body);
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        await conn.query(`
            INSERT INTO techcoach_lite.techcoach_shared_decisions (groupId, groupMember, decisionId)
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

const getSharedMembers = async (req, res) => {
    const { groupId, decisionId } = req.body;
    console.log("reqqqqqqqqqq body", req.body);
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const result = await conn.query(`
            SELECT groupMember FROM techcoach_lite.techcoach_shared_decisions WHERE groupId = ? AND decisionId = ?
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


/* const getInnerCircleAcceptNotification = async (req, res) => {
    let conn;

    let userId = req.user.id;

    console.log("user Id", userId);
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const notAcceptedMembersQuery = `
            SELECT *
            FROM techcoach_lite.techcoach_group_members
            WHERE member_id = ? AND status = ''
        `;
        const notAcceptedMembersResult = await conn.query(notAcceptedMembersQuery, [userId]);

        console.log("notification", notAcceptedMembersResult);
        await conn.commit();

        console.log("Result from fetched not accepted members:", notAcceptedMembersResult);

        res.status(200).json({ 
            message: 'Not Accepted Members Fetched Successfully', 
            notAcceptedMembers: notAcceptedMembersResult 
        });
    } catch (error) {
        console.error('Error fetching not accepted members:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
}; */

const getInnerCircleAcceptNotification = async (req, res) => {
    let conn;
    let userId = req.user.id;

    console.log("User Id:", userId);
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const notAcceptedMembersQuery = `
            SELECT *
            FROM techcoach_lite.techcoach_group_members
            WHERE member_id = ? AND status = ''
        `;
        const notAcceptedMembersResult = await conn.query(notAcceptedMembersQuery, [userId]);

        console.log("Not Accepted Members:", notAcceptedMembersResult);

        if (notAcceptedMembersResult.length > 0) {
            const groupIds = notAcceptedMembersResult.map(member => member.group_id);

            console.log("kkkkkkkkkkkkkk", groupIds);

            const acceptedMembersQuery = `
                SELECT *
                FROM techcoach_lite.techcoach_group_members
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
                    FROM techcoach_lite.techcoach_groups
                    WHERE id = ?
                `;
                const groupResult = await conn.query(groupQuery, [groupId]);

                if (groupResult.length > 0) {
                    const createdBy = groupResult[0].created_by;

                    console.log("ssssssssss", createdBy);

                    const userQuery = `
                        SELECT *
                        FROM techcoach_lite.techcoach_task
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
                    FROM techcoach_lite.techcoach_task
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


const acceptOrRejectInnerCircle = async (req, res) => {
    console.log("reqqqqqqqqqq body", req.body);

    const { groupId, status } = req.body.data; 
    const userId = req.user.id;
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        await conn.query(`
            UPDATE techcoach_lite.techcoach_group_members 
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

const getSharedDecisions = async (req, res) => {
    const userId = req.user.id;
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

        const sharedDecisions = await conn.query(`
            SELECT * FROM techcoach_lite.techcoach_shared_decisions 
            WHERE groupMember = ?
        `, [userId]);

        const results = [];
        let decisionCount = 0;

        for (const sharedDecision of sharedDecisions) {
            const { decisionId, groupId } = sharedDecision;

            const decisionDetailsQuery = await conn.query(`
                SELECT decision_id,
                       user_id,
                       decision_name,
                       decision_reason,
                       created_by,
                       creation_date,
                       decision_due_date,
                       decision_taken_date,
                       user_statement
                FROM techcoach_lite.techcoach_decision
                WHERE decision_id = ?
            `, [decisionId]);

            if (decisionDetailsQuery.length === 0) {
                continue;
            }

            const decisionDetails = decisionDetailsQuery[0];

            const userQuery = await conn.query(`
                SELECT user_id, displayname, email 
                FROM techcoach_lite.techcoach_task 
                WHERE user_id = ?
            `, [decisionDetails.user_id]);

            if (userQuery.length > 0) {
                decisionDetails.userDetails = userQuery[0];
            } else {
                decisionDetails.userDetails = null;
            }

            const groupDetails = await conn.query(`
                SELECT created_by 
                FROM techcoach_lite.techcoach_groups 
                WHERE id = ?
            `, [groupId]);

            if (groupDetails.length === 0) {
                continue;
            }

            const groupUserDetailsQuery = await conn.query(`
                SELECT user_id, displayname, email 
                FROM techcoach_lite.techcoach_task 
                WHERE user_id = ?
            `, [groupDetails[0].created_by]);

            if (groupUserDetailsQuery.length === 0) {
                continue;
            }

            const groupUserDetails = groupUserDetailsQuery[0];
            const keyData = undefined + groupUserDetails.displayname + groupUserDetails.email;
            const encryptedKey = encryptText(keyData, process.env.PUBLIC_KEY);

            decisionDetails.decision_name = decryptText(decisionDetails.decision_name, encryptedKey);
            decisionDetails.user_statement = decryptText(decisionDetails.user_statement, encryptedKey);

            const decisionReasonQuery = await conn.query(`
                SELECT decision_reason_text 
                FROM techcoach_lite.techcoach_reason 
                WHERE decision_id = ?
            `, [decisionId]);

            if (decisionReasonQuery.length > 0) {
                decisionDetails.reasons = decisionReasonQuery.map(reasonEntry => 
                    decryptText(reasonEntry.decision_reason_text, encryptedKey)
                );
            } else {
                decisionDetails.reasons = [];
            }

            const sharedInfo = await conn.query(`
                SELECT d.id, d.groupId, d.groupMember, d.decisionId, d.comment, d.created_at, d.parentCommentId, d.updated_at,
                       t.user_id, t.displayname, t.email
                FROM techcoach_lite.techcoach_conversations d
                LEFT JOIN techcoach_lite.techcoach_task t
                ON d.groupMember = t.user_id
                WHERE groupId = ? AND decisionId = ? AND groupMember = ?
            `, [groupId, decisionId, userId]);

            const commentIds = sharedInfo.map(comment => comment.id);

            if (commentIds.length > 0) {
                const replies = await conn.query(`
                    SELECT d.id, d.groupId, d.groupMember, d.decisionId, d.comment, d.created_at, d.parentCommentId, d.updated_at,
                           t.user_id, t.displayname, t.email
                    FROM techcoach_lite.techcoach_conversations d
                    LEFT JOIN techcoach_lite.techcoach_task t
                    ON d.groupMember = t.user_id
                    WHERE parentCommentId IN (?)
                `, [commentIds]);

                sharedInfo.forEach(comment => {
                    comment.replies = replies.filter(reply => reply.parentCommentId === comment.id);
                });
            }

            results.push({
                sharedDecision,
                decisionDetails,
                groupDetails: groupDetails[0],
                groupUserDetails,
                comments: sharedInfo
            });

            decisionCount++;
        }

        await conn.commit();

        if (decisionCount === 0) {
            res.status(200).json({ message: 'No decisions fetched', results: [], decisionCount });
        } else {
            res.status(200).json({ message: 'Shared Notification Fetched Successfully', results, decisionCount });
        }
    } catch (error) {
        console.error('Error fetching Shared Notification:', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};


const postCommentForDecision = async (req, res) => {
    console.log("Request body", req.body);

    const { decisionId, groupMemberID, groupId, commentText } = req.body.data;

    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const updateCommentResult = await conn.query(
            `INSERT INTO techcoach_lite.techcoach_conversations (groupId, groupMember, comment, created_at, decisionId) 
             VALUES (?, ?, ?, NOW(), ?)`,
            [groupId, groupMemberID, commentText, decisionId]
        );

        console.log("Inserted comment ID", updateCommentResult.insertId);

        await conn.commit();

        res.status(200).json({ message: 'Comment posted and shared decision updated successfully' });
    } catch (error) {
        console.error('Error processing request:', error);
        if (conn) await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};


const getComments = async (req, res) => {
    const decisionId = req.query.decisionId;
    let userId = req.user.id;
    let conn;

    try {
        conn = await getConnection();
        const commentsQuery = `
            SELECT 
                d.id,
                d.groupId,
                d.groupMember,
                d.decisionId,
                d.comment,
                d.created_at,
                d.parentCommentId,
                d.updated_at,
                t.user_id,
                t.displayname,
                t.email
            FROM 
                techcoach_lite.techcoach_conversations d
            LEFT JOIN 
                techcoach_lite.techcoach_task t
            ON 
                d.groupMember = t.user_id
            WHERE 
                d.decisionId = ?
        `;

        const comments = await conn.query(commentsQuery, [decisionId]);

        // Map through the comments and add type_of_user property
        const updatedComments = comments.map(comment => ({
            ...comment,
            type_of_user: comment.groupMember === userId ? 'author' : 'member'
        }));

        console.log("comments", updatedComments);

        res.status(200).json({ comments: updatedComments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'An error occurred while fetching comments' });
    } finally {
        if (conn) conn.release();
    }
};


const getSharedComments = async (req, res) => {
    const userId = req.user.id;

    console.log("request from shared comments fetch", req.body);
    const { decisionId } = req.body;
    let conn;
    try {
        conn = await getConnection();
        const commentsQuery = `SELECT 
            d.id,
            d.groupId,
            d.groupMember,
            d.decisionId,
            d.comment,
            d.created_at,
            d.parentCommentId,
            d.updated_at,
            t.user_id,
            t.displayname,
            t.email
        FROM 
            techcoach_lite.techcoach_conversations d
        LEFT JOIN 
            techcoach_lite.techcoach_task t
        ON 
            d.groupMember = t.user_id
        WHERE 
            d.decisionId = ?`;

        const comments = await conn.query(commentsQuery, [decisionId]);

        console.log("comments", comments);

        comments.forEach(comment => {
            if (comment.groupMember === userId) {
                comment.type_of_member = 'author';
            } else {
                comment.type_of_member = 'member';
            }
        });

        res.status(200).json({ comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'An error occurred while fetching comments' });
    } finally {
        if (conn) conn.release();
    }
};


const removeCommentsAdded = async (req, res) => {
    console.log("request from remove", req.body);

    const { commentId } = req.body;

    let conn;
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        console.log("request from remove", req.body);

        const query = `
            DELETE FROM techcoach_lite.techcoach_conversations
            WHERE id=?
        `;
        const result = await conn.query(query, [commentId]);

        console.log("result from delete query", result);

        await conn.commit();
        res.status(200).json({ message: 'Comment removed successfully' });
    } catch (error) {
        console.error('Error in removing comment', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};

const postReplyComment = async (req, res) => {
    console.log("request body from post reply", req.body);
    const {commentId, reply, groupId, decisionId} = req.body;

    const userId = req.user.id;

    let conn;
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const query = await conn.query(
            `INSERT INTO techcoach_lite.techcoach_conversations (groupId, groupMember, comment, created_at, parentCommentId, decisionId) 
             VALUES (?, ?, ?, NOW(),?, ?)`,
            [groupId, userId, reply, commentId, decisionId]
        );

        console.log("putttttttttttttt", query);

        await conn.commit();
        res.status(200).json({ message: 'Shared Decision Fetched successfully' });
    } catch (error) {
        console.error('Error in fetching shared decisions', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};

const editCommentsAdded = async (req, res) => {
    console.log("reqqqqqqqqqq body editt", req.body);

    const {commentId, editedContent} = req.body.data;

    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        await conn.query(`
            UPDATE techcoach_lite.techcoach_conversations
            SET comment = ?, updated_at = NOW()
            WHERE id = ?
        `, [editedContent, commentId]);

        await conn.commit();

        res.status(200).json({ message: 'Comments updated successfully' });
    } catch (error) {
        console.error('Error updating Comments:', error);
        await conn.rollback();
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};


const innerCirclePostComment = async (req, res) => {
    console.log("Request body:", req.body.decision);

    const { decision, groupMemberID, commentText, email } = req.body;

    let conn;

    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        const firstPart = text.substring(0, 10);
        const lastPart = text.substring(text.length - 10);
        return `${firstPart}...${lastPart}`;
    };

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const groupMemberQuery = 'SELECT * FROM techcoach_lite.techcoach_task WHERE user_id = ?';
        const groupMemberRows = await conn.query(groupMemberQuery, [groupMemberID]);
        const groupMemberDetails = groupMemberRows[0];
        console.log("Group member details:", groupMemberDetails);

        const { decision_name, decision_due_date, creation_date } = decision;

        const truncatedCommentText = truncateText(commentText, 20);

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


/* const innerCircleDecisionShare = async (req, res) => {
    console.log("Request body invitation:", req.body);

    const { memberEmail, decisionSummary } = req.body;

    const memberId = req.user.id;



    const emailPayload = {
        from: {
            address: "Decision-Coach@www.careersheets.in"
        },
        to: [
            {
                email_address: {
                    address: memberEmail
                }
            }
        ],
        subject: `Help ${memberName} decide`,
        htmlbody: `<div style="font-family: Arial, sans-serif; color: #333;">
            <p>Dear ${memberName},</p>
            <p>This is to notify that a decision has been shared with you to provide your inputs.</p>
            <p>Please login and add comments. You can choose to notify them by email at the time of posting comment.</p>
            <p>Here are the details of the decision:</p>
            <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
                <p><strong>Decision Name:</strong> ${decisionSummary.decisionName}</p>
                <p><strong>Due Date:</strong> ${decisionSummary.dueDate}</p>
                <p><strong>Taken Date:</strong> ${decisionSummary.takenDate}</p>
            </div>
            <p style="text-align: center;">
                <a href="https://decisioncoach.onrender.com" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Click here to access the application</a>
            </p>
            <p>Regards,</p>
            <p>Team @ Decision Coach</p>
        </div>`
    };

    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const memberNameQuery = 'SELECT displayname FROM techcoach_lite.techcoach_task WHERE user_id = ?';
        const memberName = await conn.query(memberNameQuery, [memberId]);

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
}; */

const innerCircleDecisionShare = async (req, res) => {
    console.log("Request body invitation:", req.body);

    const { memberEmail, decisionSummary } = req.body;
    const memberId = req.user.id;

    let conn;

    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        const firstPart = text.substring(0, 10);
        const lastPart = text.substring(text.length - 10);
        return `${firstPart}...${lastPart}`;
    };

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const memberNameQuery = 'SELECT * FROM techcoach_lite.techcoach_task WHERE email = ?';
        const rows = await conn.query(memberNameQuery, [memberEmail]);

        console.log("ssssssssssss", rows)
        
        if (!rows || rows.length === 0) {
            throw new Error('Member not found');
        }
        
        const memberName = rows[0].displayname;


        const subjectNameQuery = 'SELECT * FROM techcoach_lite.techcoach_task WHERE user_id = ?';
        const subjectNameRows = await conn.query(subjectNameQuery, [memberId]);

        
        if (!subjectNameRows || subjectNameRows.length === 0) {
            throw new Error('Member not found');
        }
        
        const subjectName = subjectNameRows[0].displayname;

        const truncatedDecisionText = truncateText(decisionSummary.decisionName, 20);

        const emailPayload = {
            from: {
                address: "Decision-Coach@www.careersheets.in"
            },
            to: [
                {
                    email_address: {
                        address: memberEmail
                    }
                }
            ],
            subject: `Help ${subjectName} decide`,
            htmlbody: `<div style="font-family: Arial, sans-serif; color: #333;">
                <p>Dear ${memberName},</p>
                <p>This is to notify that a decision has been shared with you to provide your inputs.</p>
                <p>Please login and add comments. You can choose to notify them by email at the time of posting comment.</p>
                <p>Here are the details of the decision:</p>
                <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
                    <p><strong>Decision Name:</strong> ${truncatedDecisionText}</p>
                    <p><strong>Due Date:</strong> ${decisionSummary.dueDate}</p>
                    <p><strong>Taken Date:</strong> ${decisionSummary.takenDate}</p>
                </div>
                <p style="text-align: center;">
                    <a href="https://decisioncoach.onrender.com" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Click here to access the application</a>
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


const innerCircleInvitation = async (req, res) => {
    console.log("Request body invitation:", req.user);
    console.log("Request body invitation:", req.body);

    const { email } = req.body;
    const { email: senderEmail } = req.user;

    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const groupMemberQuery = 'SELECT * FROM techcoach_lite.techcoach_task WHERE email = ?';
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
            subject: `Join ${groupMemberDetails.displayname}'s Inner Circle`,
            htmlbody: `<div style="font-family: Arial, sans-serif; color: #333;">
                <p>Hi ,</p>
                <p>${groupMemberDetails.displayname} wants to add you as a member of their inner circle in the Decision Coach app.</p>
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

const getSharedDecisionDetails = async (req, res) => {
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
            `SELECT * FROM techcoach_lite.techcoach_groups WHERE created_by = ?`,
            [id]
        );

        if (groups.length === 0) {
            await conn.commit();
            return res.status(200).json({ message: 'No groups found for this user' });
        }

        const groupIds = groups.map(group => group.id);

        const sharedDecisions = await conn.query(
            `SELECT * FROM techcoach_lite.techcoach_shared_decisions WHERE groupId IN (?)`,
            [groupIds]
        );

        if (sharedDecisions.length === 0) {
            await conn.commit();
            return res.status(200).json({ message: 'No shared decisions found for these groups' });
        }

        const groupMembers = sharedDecisions.map(sd => sd.groupMember);
        const decisionIds = sharedDecisions.map(sd => sd.decisionId);

        const tasks = await conn.query(
            `SELECT * FROM techcoach_lite.techcoach_task WHERE user_id IN (?)`,
            [groupMembers]
        );

        const currentUser = (await conn.query(
            `SELECT * FROM techcoach_lite.techcoach_task WHERE user_id = ?`,
            [id]
        ))[0];

        console.log("ssssssssssssss", currentUser);

        const decisions = await conn.query(
            `SELECT * FROM techcoach_lite.techcoach_decision WHERE decision_id IN (?)`,
            [decisionIds]
        );

        const keyData = undefined + currentUser.displayname + currentUser.email; 
        const encryptedKey = encryptText(keyData, process.env.PUBLIC_KEY);

        decisions.forEach(decision => {
            decision.decision_name = decryptText(decision.decision_name, encryptedKey);
            decision.user_statement = decryptText(decision.user_statement, encryptedKey);
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


module.exports = {
    getUserList,
    innerCircleCreation,
    checkInnerCircleExists,
    getInnerCircleDetails,
    removeMemberFromInner,
    getAddMemberNameList,
    addMemberInInnerCircle,
    shareDecisionInInnerCircle,
    getSharedMembers,
    getInnerCircleAcceptNotification,
    acceptOrRejectInnerCircle,
    getSharedDecisions,
    postCommentForDecision,
    getComments,
    getSharedComments,
    removeCommentsAdded,
    postReplyComment,
    editCommentsAdded,
    innerCirclePostComment, 
    innerCircleDecisionShare,
    innerCircleInvitation,
    getSharedDecisionDetails
};