const getConnection = require('../Models/database');
const crypto = require('crypto');

const postSkillLink = async (req, res) => {
    const { decision_id, skill_id, skill_name } = req.body; 
    let conn;

    if (!decision_id || (!skill_id && !skill_name)) {
        return res.status(400).json({ error: 'decision_id and either skill_id or skill_name are required' });
    }

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const userId = req.user.id;
        console.log('User ID from:', userId);
        
        let skillId = skill_id;

        if (skill_name && !skill_id) {
            const rows = await conn.query(
                "SELECT skill_id FROM techcoach_lite.techcoach_soft_skill WHERE skill_name = ?",
                [skill_name]
            );
      
            if (rows.length === 0) {
                await conn.rollback();
                return res.status(400).json({ error: `Skill name '${skill_name}' not found` });
            }
            skillId = rows[0].skill_id;
        }

        const decisionRows = await conn.query("SELECT * FROM techcoach_lite.techcoach_decision WHERE decision_id = ?", [decision_id]);
        if (decisionRows.length === 0) {
            await conn.rollback();
            return res.status(400).json({ error: 'Invalid decision_id' });
        }

        // Perform the insert, including user_id
        await conn.query(
            "INSERT INTO techcoach_lite.techcoach_decision_skill_linked_info (decision_id, skill_id, user_id) VALUES (?, ?, ?)",
            [decision_id, skillId, userId]
        );

        await conn.commit();
        res.status(200).json({ message: 'Record inserted successfully' });
    } catch (err) {
        console.error('Error inserting data:', err);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.release();
    }
};

const postProfileLink = async (req, res) => {
    const { decision_id, header_ids } = req.body;
    let conn;

    // Validate that header_ids is an array
    if (!Array.isArray(header_ids)) {
        return res.status(400).json({ error: 'header_ids should be an array' });
    }
    console.log('header_ids:', header_ids);

    try {
        conn = await getConnection();
        await conn.beginTransaction();

        const userId = req.user.id;
        console.log('User ID from:', userId);

        // Validate the single decision_id
        const decisionRows = await conn.query("SELECT * FROM techcoach_lite.techcoach_decision WHERE decision_id = ?", [decision_id]);
        if (decisionRows.length === 0) {
            await conn.rollback();
            return res.status(400).json({ error: 'Invalid decision_id' });
        }

        // Validate all header_ids
        for (const header_id of header_ids) {
            const headerRows = await conn.query("SELECT * FROM techcoach_lite.techcoach_profile_swot_headers WHERE header_id = ?", [header_id]);
            if (headerRows.length === 0) {
                await conn.rollback();
                return res.status(400).json({ error: `Invalid header_id: ${header_id}` });
            }
        }

        // Insert each header_id with the current decision_id
        for (const header_id of header_ids) {
            await conn.query(
                "INSERT INTO techcoach_lite.techcoach_decision_swot_linked_info (decision_id, header_id, user_id) VALUES (?, ?, ?)",
                [decision_id, header_id, userId]
            );
        }

        console.log('header_ids:', header_ids);
        await conn.commit();
        res.status(200).json({ message: 'Records inserted successfully' });
    } catch (err) {
        console.error('Error inserting data:', err);
        if (conn) {
            await conn.rollback();
        }
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.release();
    }
};

const getAllSkillLink = async (req, res) => {
    let conn;

    try {
        conn = await getConnection(); 

        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        const rows = await conn.query(`
            SELECT 
                ds.decision_id,
                d.decision_name,
                s.skill_id,
                s.skill_name
            FROM techcoach_lite.techcoach_decision_skill_linked_info ds
            JOIN techcoach_lite.techcoach_decision d ON ds.decision_id = d.decision_id
            JOIN techcoach_lite.techcoach_soft_skill s ON ds.skill_id = s.skill_id
            WHERE 
                d.user_id = ?
        `, [userId]);

        const decryptText = (text, key) => {
            if (!text) return null;
            try {
                const decipher = crypto.createDecipher('aes-256-cbc',key); 
                let decryptedText = decipher.update(text, 'hex', 'utf-8');
                decryptedText += decipher.final('utf-8');
                return decryptedText;
            } catch (error) {
                console.error('Error decrypting text:', error);
                return null;
            }
        };

        const decryptedSkillRows = rows.map(row => ({
            ...row,
            decision_name: decryptText(row.decision_name, req.user.key),
            skill_name: row.skill_name,
        }));

        if (decryptedSkillRows.length === 0) {
            return res.status(404).json({ message: 'No Skill records found' });
        }

        res.status(200).json({ skills: decryptedSkillRows });
    } catch (err) {
        console.error('Error fetching skills:', err);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.release();
    }
};

const getAllProfileLink = async (req, res) => {
    let conn;
    try {
        conn = await getConnection();

        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        const rows = await conn.query(
            `SELECT 
                dh.decision_id,
                d.decision_name,
                h.header_id,
                h.header_name
            FROM techcoach_lite.techcoach_decision_swot_linked_info dh
            JOIN techcoach_lite.techcoach_decision d ON dh.decision_id = d.decision_id
            JOIN techcoach_lite.techcoach_profile_swot_headers h ON dh.header_id = h.header_id
            WHERE 
                d.user_id = ?`,
            [userId]
        );

        // Decryption function
        const decryptText = (text, key) => {
            if (!text) return null;
            try {
                const decipher = crypto.createDecipher('aes-256-cbc',key); 
                let decryptedText = decipher.update(text, 'hex', 'utf-8');
                decryptedText += decipher.final('utf-8');
                return decryptedText;
            } catch (error) {
                console.error('Error decrypting text:', error);
                return null;
            }
        };

        const decryptedProfileRows = rows.map(row => ({
            ...row,
            decision_name: decryptText(row.decision_name, req.user.key),
            header_name: row.header_name,
        }));

        if (decryptedProfileRows.length === 0) {
            return res.status(404).json({ message: 'No Profile records found' });
        }

        res.status(200).json({ profiles: decryptedProfileRows });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Database error' });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = { postSkillLink,postProfileLink,getAllSkillLink,getAllProfileLink }