// Error carrying an HTTP status code (400, 404, 409 ...).
class AppError extends Error {
  constructor(message, statusCode = 400, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}
module.exports = AppError;
