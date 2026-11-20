
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true
  }
});

pool.on("error", (err) => {
  console.error("MySQL pool error:", err.message);
});

async function checkDatabaseConnection() {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.ping();
    console.log("TiDB Cloud database connected successfully!");
    return true;
  } catch (error) {
    console.error("TiDB connection failed:", error.message);
    return false;
  } finally {
    if (connection) connection.release();
  }
}

async function withTransaction(fn) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await fn(connection);
    await connection.commit();
    return result;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_) {}
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { pool, checkDatabaseConnection, withTransaction };
