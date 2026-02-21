const express = require('express');
const router = express.Router();
const droController = require('../controllers/drocontroller1');

// 🔥 AUTH MIDDLEWARE (optional fallback)
let auth;
try {
  auth = require('../middleware/authMiddleware');
} catch (err) {
  auth = (req, res, next) => {
    req.user = { isAdmin: true }; // Development mode
    next();
  };
}

// 🔥 SAB USERS ROUTES
router.get('/history', auth, droController.getDroHistory);        // All users
router.post('/save', auth, droController.saveDro);                // All users - GLOBAL TIMER
router.get('/get-timer', auth, droController.getGlobalTimer);     // All users check

// 🔥 ADMIN ONLY ROUTES
router.post('/set-timer', auth, droController.setGlobalTimer);    // Admin only
router.delete('/delete/:id', auth, droController.deleteDro);      // Admin
router.post('/admin/assign-dro-access', auth, droController.assignDroAccess);
router.post('/admin/remove-dro-access', auth, droController.removeDroAccess);
router.get('/members-with-status', auth, droController.getMembersWithDroStatus);
router.get('/check/:memberName', droController.checkDroAccess);

module.exports = router;
