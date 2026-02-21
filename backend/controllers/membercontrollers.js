const Member = require("../models/Member");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // 🔥 YE ADD KIA

// ADD MEMBER
exports.addMember = async (req, res) => {
  try {
    const { memberId, name, contact, password } = req.body;

    if (!memberId || !name || !contact || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await Member.findOne({ memberId });
    if (exists) return res.status(400).json({ message: "Member already exists" });

    const member = await Member.create({ memberId, name, contact, password });

    res.status(201).json({
      message: "Member added successfully",
      member: {
        id: member._id,
        memberId: member.memberId,
        name: member.name,
        contact: member.contact,
        createdAt: member.createdAt,
      },
    });
  } catch (err) {
    console.error("Add Member Error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Member ID already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

// GET ALL MEMBERS (password excluded)
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.find().select("-password");
    res.json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (err) {
    console.error("getAllMembers Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE MEMBER
exports.getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).select("-password");
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE MEMBER - 🔥 PERFECT (Aapne already fix kiya)
exports.updateMember = async (req, res) => {
  try {
    const id = req.params.id || req.user?.id || req.user?._id; // 🔥 Profile ke liye ye chalega
    
    const updateData = {
      name: req.body.name,
      contact: req.body.contact,
    };

    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 12);
    }

    const member = await Member.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!member) return res.status(404).json({ message: "Member not found" });

    res.json({ success: true, message: "Member updated successfully", data: member });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE MEMBER
exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    res.json({ success: true, message: "Member deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔥 LOGIN FUNCTION - REAL JWT TOKEN!
exports.loginMember = async (req, res) => {
  try {
    const { memberId, password } = req.body;
    if (!memberId || !password) {
      return res.status(400).json({ message: "Member ID and password required" });
    }

    const member = await Member.findOne({ memberId }).select("+password");
    if (!member) return res.status(400).json({ message: "Invalid Member ID" });

    const isMatch = await member.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // 🔥 REAL JWT TOKEN GENERATE KARO
    const token = jwt.sign(
      { 
        id: member._id, 
        memberId: member.memberId 
      }, 
      process.env.JWT_SECRET || 'supersecretdevkey2026', // 🔥 Secret key
      { expiresIn: '7d' }
    );

    res.json({
      token,  // 🔥 YE REAL TOKEN HAI!
      member: {
        id: member._id,
        memberId: member.memberId,
        name: member.name,
        contact: member.contact,
      },
    });
  } catch (err) {
    console.error("Member login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
