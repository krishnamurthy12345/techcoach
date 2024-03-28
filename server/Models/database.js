const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    connectionLimit: 5,
    port: process.env.DB_PORT,
    waitForConnections: true
});

async function getConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MariaDB');
        return connection;
    } catch (error) {
        console.error('Error connecting to MariaDB:', error);
        throw error;
    }
}

module.exports = getConnection;
