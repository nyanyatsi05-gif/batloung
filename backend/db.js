// Legacy callback-style access (suppliers, fruits, vendors, stock, auth, reports).
// Uses the shared connection POOL instead of one single connection, so a dropped
// connection no longer breaks every route and the app keeps running.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { pool } = require("./config/database");

module.exports = pool.pool; // underlying callback pool: db.query(sql, params, cb)
