const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  getDokumenByPenugasan,
  getDokumenById,
  createDokumen,
  updateDokumen,
  deleteDokumen
} = require('../controllers/dokumenController');

const {
  getTemuanByDokumen,
  createTemuan,
  updateTemuan,
  deleteTemuan
} = require('../controllers/temuanController');

const {
  getRekomendasiByTemuan,
  createRekomendasi,
  updateRekomendasi,
  deleteRekomendasi,
  tambahSetoranTgr,
  getSetoranByRekomendasi
} = require('../controllers/rekomendasiController');

const { authenticate, canEditDokumen, canEditTindakLanjut } = require('../middleware/auth');

// Setup multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/dokumen/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'DOK-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // max 20MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak diizinkan. Gunakan PDF, DOC, DOCX, XLS, atau XLSX.'));
    }
  }
});

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

// Setup multer khusus bukti setoran TGR
const storageSetoran = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/bukti/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'SETORAN-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadSetoran = multer({
  storage: storageSetoran,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak diizinkan.'));
    }
  }
});

const handleUploadSetoran = (req, res, next) => {
  uploadSetoran.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

router.use(authenticate);

// Dokumen routes
router.get('/penugasan/:penugasan_id', getDokumenByPenugasan);
router.get('/:id', getDokumenById);
router.post('/', canEditDokumen, handleUpload, createDokumen);
router.put('/:id', canEditDokumen, handleUpload, updateDokumen);
router.delete('/:id', canEditDokumen, deleteDokumen);

// Temuan routes
router.get('/:dokumen_id/temuan', getTemuanByDokumen);
router.post('/temuan/batch', canEditDokumen, createTemuan);
router.put('/temuan/:id', canEditDokumen, updateTemuan);
router.delete('/temuan/:id', canEditDokumen, deleteTemuan);

// Rekomendasi routes
router.get('/temuan/:temuan_id/rekomendasi', getRekomendasiByTemuan);
router.post('/rekomendasi', canEditDokumen, createRekomendasi);
router.put('/rekomendasi/:id', canEditDokumen, updateRekomendasi);
router.delete('/rekomendasi/:id', canEditDokumen, deleteRekomendasi);

// Setoran TGR routes
router.get('/rekomendasi/:id/setoran', getSetoranByRekomendasi);
router.post('/rekomendasi/:id/setoran', canEditTindakLanjut, handleUploadSetoran, tambahSetoranTgr);

module.exports = router;