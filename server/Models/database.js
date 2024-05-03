const mariadb = require("mariadb");
require("dotenv").config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  connectTimeout: 100000,
  connectionLimit: 25,
  port: process.env.DB_PORT,
  waitForConnections: true,
});

const connection =  pool.getConnection();
async function getConnection(querys) {
  try {
    console.log(
      pool.activeConnections(),
      pool.idleConnections(),
      pool.totalConnections()
    );
    console.log("Connected to MariaDB");
    // const result = await connection.query(querys);
    // if (connection) connection.release();
    return connection;
  } catch (error) {
    console.error("Error connecting to MariaDB:", error);
    throw error;
  }
}

module.exports = getConnection;
