const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  addMember,
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
  loginMember, // ← import the new login function
} = require("../controllers/membercontrollers");



// 🔥 YE LINE ADD KARO 👇 (end mein)
router.put("/profile", auth, updateMember);  // Personal profile ke liye
// 🔹 Public login route (no auth)
router.post("/login", loginMember);

// 🔹 Protected CRUD routes
router.post("/add", auth, addMember);
router.get("/", auth, getAllMembers);
router.get("/:id", auth, getMemberById);
router.put("/:id", auth, updateMember);
router.delete("/:id", auth, deleteMember);

module.exports = router;