const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAlertSPT,
  getAlertTL,
  getProgressKeirbanan,
  getLog
} = require('../controllers/monitoringController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.use(authenticate);

// Dashboard — semua role
router.get('/dashboard', getDashboard);

// Alert — semua role
router.get('/alert/spt', getAlertSPT);
router.get('/alert/tl', getAlertTL);

// Progress per keirbanan — semua role
// (data akan difilter berdasarkan keirbanan user)
router.get('/progress', getProgressKeirbanan);

// Log — admin dan superadmin
router.get('/log', isAdmin, getLog);

module.exports = router;