// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admincontroller11");
router.post("/add", adminController.createAdmin);  // /create → /add

router.post("/create", adminController.createAdmin);
router.post("/login", adminController.loginAdmin);

module.exports = router;
