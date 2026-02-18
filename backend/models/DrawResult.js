const mongoose = require("mongoose");

const DrawResultSchema = new mongoose.Schema(
  {
    drawDate: {
      type: String, // e.g. 17/02/2026
      required: true,
    },

    drawTime: {
      type: String, // e.g. 10:30 AM
      required: true,
    },

    winner: {
      memberId: {
        type: String,
        required: true,
      },

      name: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

module.exports = mongoose.model("DrawResult", DrawResultSchema);
