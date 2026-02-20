// authMiddleware.js
// 🔹 Completely unprotected for testing
module.exports = (req, res, next) => {
  next(); // bypass auth
};