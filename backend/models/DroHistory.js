const mongoose = require("mongoose");

const droHistorySchema = new mongoose.Schema(
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

    movedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DroHistory", droHistorySchema);
