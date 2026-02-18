const Admin = require("../models/adminmodel");
const jwt = require("jsonwebtoken");

/* ================= CREATE ADMIN ================= */
exports.createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const exists = await Admin.findOne({ username });

    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = new Admin({ username, password });
    await admin.save();

    res.status(201).json({ message: "Admin created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= LOGIN ADMIN ================= */
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const admin = await Admin.findOne({ username }).select("+password");
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
