const express = require('express');
const router = express.Router();
const {
  getPkpt,
  getPkptById,
  createPkpt,
  updatePkpt,
  deletePkpt
} = require('../controllers/pkptController');
const { authenticate, canEditDokumen } = require('../middleware/auth');

// Semua routes perlu login
router.use(authenticate);

// Read — semua role bisa akses
router.get('/', getPkpt);
router.get('/:id', getPkptById);

// Write — hanya admin dan superadmin
router.post('/', canEditDokumen, createPkpt);
router.put('/:id', canEditDokumen, updatePkpt);
router.delete('/:id', canEditDokumen, deletePkpt);

module.exports = router;