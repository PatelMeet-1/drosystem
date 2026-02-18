const mongoose = require("mongoose");

const droResultSchema = new mongoose.Schema(
  {
    droId: mongoose.Schema.Types.ObjectId,
    title: String,

    drawDate: String,
    drawTime: String,

    result: [
      {
        memberId: String,
        name: String,
        email: String,
        position: Number,
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
      expires: 21600, // 🔥 6 HOURS (TTL Index)
    },
  }
);

module.exports = mongoose.model("DroResult", droResultSchema);
