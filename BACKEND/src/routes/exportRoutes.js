const express = require('express');
const router = express.Router();
const { exportExcel } = require('../controllers/exportController');
const { authenticate } = require('../middleware/auth');

// Semua routes perlu login. Isi ekspor otomatis dibatasi sesuai keirbanan pengguna.
router.use(authenticate);

router.get('/excel', exportExcel);

module.exports = router;