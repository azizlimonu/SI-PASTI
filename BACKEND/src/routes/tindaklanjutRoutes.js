const express = require('express');
const router = express.Router();
const {
  getTLByRekomendasi,
  getAllTL,
  createTL,
  createTLBatch,
  updateTL,
  deleteTL,
  updateProgressRekomendasi,
  getPenugasanNeedTL,
  getPenugasanTLDetail
} = require('../controllers/tindakLanjutController');
const { authenticate, canEditTindakLanjut } = require('../middleware/auth');

router.use(authenticate);

// Read — semua role bisa akses
router.get('/', getAllTL);
router.get('/penugasan', getPenugasanNeedTL);
router.get('/penugasan/:id', getPenugasanTLDetail);
router.get('/rekomendasi/:rekomendasi_id', getTLByRekomendasi);

// Write — admin, admin_tl, superadmin
router.post('/', canEditTindakLanjut, createTL);
router.post('/batch', canEditTindakLanjut, createTLBatch);
router.put('/:id', canEditTindakLanjut, updateTL);
router.delete('/:id', canEditTindakLanjut, deleteTL);
router.patch('/rekomendasi/:id/progress', canEditTindakLanjut, updateProgressRekomendasi);

module.exports = router;