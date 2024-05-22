const getConnection = require('../Models/database');

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
    //console.log("Request from creation of inner circle", req.body);

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
                `INSERT INTO techcoach_lite.techcoach_group_members (group_id, member_id) VALUES (?, ?)`,
                [groupId, memberId]
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

        console.log("Result:", result);
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

module.exports = { getAddMemberNameList };



const addMemberInInnerCircle = async(req, res) =>{

    //console.log("request body from add member list", req.body.data);
    const {userId, groupId}  = req.body.data;
    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const query = `
        INSERT INTO techcoach_lite.techcoach_group_members (group_id, member_id) VALUES (?, ?)
    `;

    const result = await conn.query(query, [groupId, userId]);

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
    console.log("req body", req.body);
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        await conn.query(`
            INSERT INTO techcoach_lite.techcoach_shared_decisions (groupId, groupMember, decisionId, status)
            VALUES (?, ?, ?, 'Not Accepted')
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
            SELECT groupMember, status FROM techcoach_lite.techcoach_shared_decisions WHERE groupId = ? AND decisionId = ?
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


const getInnerCircleAcceptNotification = async (req, res) => {
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const userId = req.user.id;

        // Fetch shared decisions for the user
        const sharedDecisionsQuery = `
            SELECT * FROM techcoach_lite.techcoach_shared_decisions WHERE groupMember = ?
        `;
        const sharedDecisions = await conn.query(sharedDecisionsQuery, [userId]);

        // Extract decision IDs
        const decisionIds = sharedDecisions.map(decision => decision.decisionId);

        if (decisionIds.length > 0) {
            // Fetch decisions with details
            const decisionsQuery = `
                SELECT * FROM techcoach_lite.techcoach_decision WHERE decision_id IN (?)
            `;
            const decisions = await conn.query(decisionsQuery, [decisionIds]);

            // Combine shared decisions with their details
            const sharedDecisionsWithDetails = sharedDecisions.map(sharedDecision => {
                const decisionDetail = decisions.find(decision => decision.decision_id === sharedDecision.decisionId);
                return {
                    ...sharedDecision,
                    decisionDetail
                };
            });

            // Fetch group details and the associated creator's user details
            const groupIds = sharedDecisions.map(decision => decision.groupId);
            const groupDetailsQuery = `
                SELECT * FROM techcoach_lite.techcoach_groups WHERE id IN (?)
            `;
            const groupDetails = await conn.query(groupDetailsQuery, [groupIds]);

            // Extract creator IDs
            const creatorIds = groupDetails.map(group => group.created_by);

            // Fetch creator details for each creator ID
            const creatorDetails = await Promise.all(creatorIds.map(async (creatorId) => {
                const creatorDetailQuery = `
                    SELECT * FROM techcoach_lite.techcoach_task WHERE user_id = ?
                `;
                const [creatorDetail] = await conn.query(creatorDetailQuery, [creatorId]);
                return creatorDetail;
            }));

            console.log("result notification", sharedDecisionsWithDetails);
            await conn.commit();
            res.status(200).json({ message: 'Shared Members, Decisions, and Creators Fetched Successfully', sharedDecisionsWithDetails, creatorDetails });
        } else {
            await conn.commit();
            res.status(200).json({ message: 'No shared decisions found for the user', sharedDecisionsWithDetails: [], creatorDetails: [] });
        }
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('Error fetching shared members, decisions, and creators:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    } finally {
        if (conn) conn.release();
    }
};



const updateInnerCircleAcceptStatus = async (req, res) => {
    const { groupId, decisionId } = req.body;
    console.log("reqqqqqqqqqq body", req.body);
    let conn;

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const result = await conn.query(`
            SELECT groupMember, status FROM techcoach_lite.techcoach_shared_decisions WHERE groupId = ? AND decisionId = ?
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
    updateInnerCircleAcceptStatus
};