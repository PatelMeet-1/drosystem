// controllers/MemberController.js
const Member = require("../models/Member");

/* ================= CREATE ================= */
exports.addMember = async (req, res) => {
  try {
    const { memberId, name, email, password } = req.body;

    if (!memberId || !name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await Member.findOne({
      $or: [{ memberId }, { email }],
    });

    if (exists) {
      return res
        .status(400)
        .json({ message: "Member with same ID or Email already exists" });
    }

    const member = new Member({ memberId, name, email, password });
    await member.save();

    res.status(201).json({ message: "Member added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= READ ALL ================= */
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.find().select("-password");
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= UPDATE (BY memberId) ================= */
exports.updateMember = async (req, res) => {
  try {
    const member = await Member.findOneAndUpdate(
      { memberId: req.params.memberId },
      req.body,
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json({ message: "Member updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= DELETE (BY memberId) ================= */
exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findOneAndDelete({
      memberId: req.params.memberId,
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json({ message: "Member deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
