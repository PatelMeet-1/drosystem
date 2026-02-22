const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const memberSchema = new mongoose.Schema({
  memberId: { 
    type: String, 
    required: [true, "Member ID required"], 
    unique: true,
    trim: true 
  },
  name: { 
    type: String, 
    required: [true, "Name required"], 
    trim: true 
  },
  contact: { 
    type: String, 
    required: [true, "Contact required"],
    trim: true 
  },
  password: { 
    type: String, 
    required: [true, "Password required"],
    select: false 
  },
  // 🔥 DRO ACCESS FIELD
  droAccess: {
    enabled: { type: Boolean, default: false },
    assignedAt: { type: Date, default: null },
    memberId: String
  }
}, { timestamps: true });

// 🔥 PASSWORD HASHING
memberSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

memberSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Member", memberSchema);
