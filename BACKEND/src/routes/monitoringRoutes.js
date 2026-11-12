const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAlertSPT,
  getAlertTL,
  getProgressKeirbanan,
  getLog,
  getMonitoringTable
} = require('../controllers/monitoringController');
const {
  getSumber,
  getPenugasanProgress,
  getTemuanRingkasan,
  getTgr,
  getKinerja,
  getTren
} = require('../controllers/monitoringAnalitikController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.use(authenticate);

// Dashboard — semua role
router.get('/dashboard', getDashboard);

// Tabel monitoring — semua role (tahun berjalan)
router.get('/table', getMonitoringTable);

// Alert — semua role
router.get('/alert/spt', getAlertSPT);
router.get('/alert/tl', getAlertTL);

// Progress per keirbanan — semua role
// (data akan difilter berdasarkan keirbanan user)
router.get('/progress', getProgressKeirbanan);

// Analitik monitoring — semua role (data otomatis dibatasi sesuai keirbanan user)
router.get('/sumber', getSumber);
router.get('/penugasan', getPenugasanProgress);
router.get('/temuan', getTemuanRingkasan);
router.get('/tgr', getTgr);
router.get('/kinerja', getKinerja);
router.get('/tren', getTren);

// Log — admin dan superadmin
router.get('/log', isAdmin, getLog);

module.exports = router;