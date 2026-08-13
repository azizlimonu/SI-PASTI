const express = require('express');
const router = express.Router();
const {
  getPenugasan,
  getPenugasanById,
  createPenugasan,
  updatePenugasan,
  deletePenugasan
} = require('../controllers/penugasanController');
const { authenticate, canEditDokumen } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getPenugasan);
router.get('/:id', getPenugasanById);
router.post('/', canEditDokumen, createPenugasan);
router.put('/:id', canEditDokumen, updatePenugasan);
router.delete('/:id', canEditDokumen, deletePenugasan);

module.exports = router;