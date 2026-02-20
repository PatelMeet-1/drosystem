const express = require('express');
const router = express.Router();

// Controllers import (galti yahan thi!)
const droController = require('../controllers/droController');

// Auth middleware import (tumhare project ka path check karo)
let auth;
try {
  auth = require('../middleware/authMiddleware');
} catch (err) {
  // Agar auth middleware nahi hai to skip karo
  auth = (req, res, next) => next();
}

// Routes
router.get('/history', auth, droController.getDroHistory);
router.post('/save', auth, droController.saveDro);

module.exports = router;
