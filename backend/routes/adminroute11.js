const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admincontroller11");

// Routes
router.post("/create", adminController.createAdmin); // Create admin
router.post("/login", adminController.loginAdmin);   // Login admin

module.exports = router;
