const express = require('express');
const router = express.Router();
const {
  getAllPihak,
  getPihakById,
  createPihak,
  updatePihak,
  deletePihak,
  cekSKTJM
} = require('../controllers/pihakController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.use(authenticate);

// SKTJM — semua role bisa cek
router.get('/sktjm', cekSKTJM);

// Read — semua role
router.get('/', getAllPihak);
router.get('/:id', getPihakById);

// Write — admin dan superadmin
router.post('/', isAdmin, createPihak);
router.put('/:id', isAdmin, updatePihak);
router.delete('/:id', isAdmin, deletePihak);

module.exports = router;