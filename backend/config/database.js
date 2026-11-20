// Promise-based MySQL pool + transaction helper (BEGIN / COMMIT / ROLLBACK).
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "batloung_farm_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
});

// Never crash the process because of an idle-connection error.
pool.on("error", (err) => console.error("MySQL pool error:", err.message));

async function checkDatabaseConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping();
    console.log("MySQL database connection is ready.");
    return true;
  } catch (error) {
    console.error("MySQL connection is not available:", error.message);
    return false; // API still starts; the pool retries on the next request.
  } finally {
    if (connection) connection.release();
  }
}

// Runs fn(connection) inside ONE transaction. Any thrown error => ROLLBACK.
async function withTransaction(fn) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();            // BEGIN
    const result = await fn(connection);
    await connection.commit();                      // COMMIT
    return result;
  } catch (error) {
    try { await connection.rollback(); } catch (_) {} // ROLLBACK
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { pool, checkDatabaseConnection, withTransaction };
