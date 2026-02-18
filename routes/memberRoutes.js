// routes/memberRoutes.js
const express = require("express");
const router = express.Router();
const member = require("../controllers/MemberController");

router.post("/add", member.addMember);          // CREATE
router.get("/all", member.getAllMembers);       // READ
router.put("/:memberId", member.updateMember);  // UPDATE
router.delete("/:memberId", member.deleteMember); // DELETE

module.exports = router;
