const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getSptByPenugasan,
  createSpt,
  updateSpt,
  deleteSpt,
  tambahTim,
  hapusTim,
  downloadSpt
} = require('../controllers/sptController');
const { authenticate, canEditDokumen } = require('../middleware/auth');

// Setup multer untuk upload file SPT
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/spt/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'SPT-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Hanya file PDF yang diizinkan.'));
    }
  }
});

router.use(authenticate);

// SPT routes
router.get('/penugasan/:penugasan_id', getSptByPenugasan);
router.get('/:id/download', downloadSpt);
router.post('/', canEditDokumen, upload.single('file_spt'), createSpt);
router.put('/:id', canEditDokumen, upload.single('file_spt'), updateSpt);
router.delete('/:id', canEditDokumen, deleteSpt);

// Tim routes
router.post('/:spt_id/tim', canEditDokumen, tambahTim);
router.delete('/:spt_id/tim/:tim_id', canEditDokumen, hapusTim);

module.exports = router;