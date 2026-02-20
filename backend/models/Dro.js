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
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Dro', droSchema);
