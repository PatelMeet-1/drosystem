const Member = require("../models/Member");
const DrawResult = require("../models/DrawResult");

/* ================= MANUAL DRAW ================= */
exports.runDraw = async (req, res) => {
  try {
    const members = await Member.find();
    if (members.length === 0) {
      return res.status(400).json({ message: "No members found" });
    }

    const randomIndex = Math.floor(Math.random() * members.length);
    const winner = members[randomIndex];

    const now = new Date();

    const result = new DrawResult({
      drawDate: now.toLocaleDateString("en-IN"),
      drawTime: now.toLocaleTimeString("en-IN"),
      winner: {
        memberId: winner.memberId,
        name: winner.name,
        email: winner.email,
      },
    });

    await result.save();

    res.json({
      message: "Draw executed successfully",
      winner: result.winner,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= CURRENT RESULTS (6 HOURS) ================= */
exports.getCurrentResults = async (req, res) => {
  try {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

    const results = await DrawResult.find({
      createdAt: { $gte: sixHoursAgo },
    }).sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= HISTORY RESULTS ================= */
exports.getHistoryResults = async (req, res) => {
  try {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

    const results = await DrawResult.find({
      createdAt: { $lt: sixHoursAgo },
    }).sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
