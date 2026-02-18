const express = require("express");
const router = express.Router();
const drawController = require("../controllers/runDro");

// MANUAL DRAW
router.post("/run", drawController.runDraw);

// RESULTS
router.get("/results/current", drawController.getCurrentResults);
router.get("/results/history", drawController.getHistoryResults);

module.exports = router;
