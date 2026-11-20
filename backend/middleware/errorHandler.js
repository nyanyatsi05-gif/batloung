// Central error handler: meaningful messages, never crashes the server.
function errorHandler(error, req, res, next) {
  console.error("Request failed:", error.code || "", error.message);
  if (res.headersSent) return next(error);

  const dbDown = ["ECONNREFUSED", "PROTOCOL_CONNECTION_LOST", "ETIMEDOUT",
                  "ER_ACCESS_DENIED_ERROR", "ER_BAD_DB_ERROR"].includes(error.code);
  if (dbDown) {
    return res.status(503).json({ message: "Database is currently unavailable. Please try again shortly." });
  }
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ message: "A record with these details already exists." });
  }
  if (error.code === "ER_ROW_IS_REFERENCED_2") {
    return res.status(409).json({ message: "Cannot delete: this record is used by other records." });
  }
  const status = Number(error.statusCode) || 500;
  res.status(status).json({
    message: status === 500 ? "A server error occurred. Please try again." : error.message,
    ...(error.details ? { details: error.details } : {})
  });
}
module.exports = errorHandler;
