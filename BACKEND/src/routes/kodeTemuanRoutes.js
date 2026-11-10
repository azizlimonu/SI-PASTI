const express = require('express');
const router = express.Router();
const {
  getKodeTemuan,
  getKategoriTemuan
} = require('../controllers/kodeTemuanController');
const { authenticate } = require('../middleware/auth');

// Semua routes perlu login (hanya baca; master diedit langsung di database)
router.use(authenticate);

router.get('/', getKodeTemuan);
router.get('/kategori', getKategoriTemuan);

module.exports = router;