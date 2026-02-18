const cron = require("node-cron");
const DroResult = require("../models/DrawResult");
const DroHistory = require("../models/DroHistory");

cron.schedule("*/5 * * * *", async () => {
  // every 5 minutes
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

  const expiredResults = await DroResult.find({
    createdAt: { $lte: sixHoursAgo },
  });

  for (let r of expiredResults) {
    await DroHistory.create({
      droId: r.droId,
      title: r.title,
      drawDate: r.drawDate,
      drawTime: r.drawTime,
      result: r.result,
    });

    await DroResult.findByIdAndDelete(r._id);
  }
});
