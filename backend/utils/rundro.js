// runDro.js
const cron = require("node-cron");
const Member = require("../models/Member");
const DrawResult = require("../models/DrawResult");
const DrawHistory = require("../models/DroHistory");

/* =====================================================
   COMMON FUNCTION : RANDOM MEMBER PICK
===================================================== */
async function getRandomMember() {
  const members = await Member.find();

  if (!members || members.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * members.length);
  return members[randomIndex];
}

/* =====================================================
   MANUAL DRAW (Frontend Button)
===================================================== */
exports.manualDraw = async (req, res) => {
  try {
    const winner = await getRandomMember();

    if (!winner) {
      return res.status(400).json({ message: "No members available" });
    }

    const result = await DrawResult.create({
      drawDate: new Date().toLocaleDateString(),
      drawTime: new Date().toLocaleTimeString(),
      winner: {
        memberId: winner.memberId,
        name: winner.name,
        email: winner.email,
      },
    });

    res.status(201).json({
      message: "Draw executed successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   AUTO DRAW (CRON BASED – MULTIPLE TIMES ALLOWED)
===================================================== */
/*
  Cron Format:
  ┌──────── minute
  │ ┌────── hour
  │ │ ┌──── day of month
  │ │ │ ┌── month
  │ │ │ │ ┌─ day of week
  │ │ │ │ │
  * * * * *
*/

// Example: Daily 10:30 AM
cron.schedule("30 10 * * *", async () => {
  try {
    const winner = await getRandomMember();
    if (!winner) return;

    await DrawResult.create({
      drawDate: new Date().toLocaleDateString(),
      drawTime: new Date().toLocaleTimeString(),
      winner: {
        memberId: winner.memberId,
        name: winner.name,
        email: winner.email,
      },
    });

    console.log("✅ Auto draw executed at 10:30 AM");
  } catch (err) {
    console.error("❌ Auto draw error:", err.message);
  }
});

/* =====================================================
   MOVE RESULT TO HISTORY AFTER 6 HOURS
===================================================== */
async function moveResultToHistory() {
  try {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

    const expiredResults = await DrawResult.find({
      createdAt: { $lte: sixHoursAgo },
    });

    for (const result of expiredResults) {
      await DrawHistory.create({
        drawDate: result.drawDate,
        drawTime: result.drawTime,
        winner: result.winner,
        movedAt: new Date(),
      });

      await DrawResult.findByIdAndDelete(result._id);
    }

    if (expiredResults.length > 0) {
      console.log("🔁 Old results moved to history");
    }
  } catch (err) {
    console.error("❌ History move error:", err.message);
  }
}

/* =====================================================
   CRON JOB – CHECK EVERY 10 MINUTES
===================================================== */
cron.schedule("*/10 * * * *", () => {
  moveResultToHistory();
});

/* =====================================================
   GET ACTIVE RESULT (LAST 6 HOURS)
===================================================== */
exports.getActiveResults = async (req, res) => {
  try {
    const results = await DrawResult.find().sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =====================================================
   GET RESULT HISTORY
===================================================== */
exports.getResultHistory = async (req, res) => {
  try {
    const history = await DrawHistory.find().sort({ movedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
