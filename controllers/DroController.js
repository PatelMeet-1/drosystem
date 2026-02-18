const Dro = require("../models/Dro");
const DroResult = require("../models/DrawResult");
const runDro = require("../utils/rundro");

exports.runDro = async (req, res) => {
  try {
    const dro = await Dro.findById(req.params.id);
    if (!dro) return res.status(404).json({ message: "DRO not found" });

    if (dro.status === "COMPLETED") {
      return res.status(400).json({ message: "DRO already completed" });
    }

    const members = await runDro();

    const result = members.map((m, i) => ({
      ...m,
      position: i + 1,
    }));

    // 🔥 SAVE LIVE RESULT (6 hours)
    await DroResult.create({
      droId: dro._id,
      title: dro.title,
      drawDate: dro.drawDate,
      drawTime: dro.drawTime,
      result,
    });

    dro.status = "COMPLETED";
    await dro.save();

    res.json({
      message: "DRO completed",
      liveFor: "6 hours",
      totalMembers: result.length,
      result,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
