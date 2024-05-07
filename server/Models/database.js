const mariadb = require("mariadb");
require("dotenv").config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  connectTimeout: 100000,
  connectionLimit: 10,
  port: process.env.DB_PORT,
  waitForConnections: true,
});

async function getConnection(querys) {
  const connection =await  pool.getConnection();
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
    if (connection) connection.end()
    console.error("Error connecting to MariaDB:", error);
    throw error;
  }
}

module.exports = getConnection;
