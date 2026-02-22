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
  droAccess: {
    enabled: { type: Boolean, default: false },
    selectedMember: String
  }
}, { timestamps: true });

// HASH PASSWORD BEFORE SAVE ✅
memberSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

memberSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🔥 FIXED LINE 44 - YE CHANGE KARO!
module.exports = mongoose.models.Member || mongoose.model("Member", memberSchema);
