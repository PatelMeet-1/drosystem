const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecretdevkey2026"
    );

    req.user = decoded; // 🔥 id yahi se aayega
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};