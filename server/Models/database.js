const mariadb = require('mariadb');
require("dotenv").config();

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    connectTimeout: 60000*20,
    connectionLimit: 50,
    port: process.env.DB_PORT,
    waitForConnections: true
});

const connection =  pool.getConnection();
async function getConnection(querys) {
    try {
        console.log(
            pool.activeConnections(),
            pool.idleConnections(),
            pool.totalConnections()
          );
        console.log('Connected to MariaDB');
        return connection;
    }catch (error) {
    if (connection) connection.end()
        console.error("Error connecting to MariaDB:", error);
        throw error;
    }
}

module.exports = getConnection;

