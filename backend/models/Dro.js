const mongoose = require('mongoose');

const droSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  totalMembers: { type: Number, required: true },
  order: [{
    position: { type: Number, required: true },
    suffix: { type: String, required: true },
    name: { type: String, required: true },
    memberId: { type: String, required: true }
  }],
  hours: { type: Number, min: 0, required: true },
  minutes: { type: Number, min: 0, required: true },
  seconds: { type: Number, min: 0, required: true },
  deleteAfter: { type: Date, required: true },
  createdBy: { type: String }
}, { timestamps: true });

// 🔥 MONGODB AUTO DELETE - GLOBAL TIMER BASED
droSchema.index({ deleteAfter: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Dro', droSchema);
