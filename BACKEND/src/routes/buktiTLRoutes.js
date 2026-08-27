const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getAllBukti,
  uploadBukti,
  attachBukti,
  detachBukti,
  updateBukti,
  deleteBukti,
  downloadBukti
} = require('../controllers/buktiTLController');
const { authenticate, canEditTindakLanjut } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/bukti/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'BUKTI-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
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

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

router.use(authenticate);

router.get('/', getAllBukti);
router.get('/:id/download', downloadBukti);
router.post('/', canEditTindakLanjut, handleUpload, uploadBukti);
router.post('/attach', canEditTindakLanjut, attachBukti);
router.post('/detach', canEditTindakLanjut, detachBukti);
router.put('/:id', canEditTindakLanjut, handleUpload, updateBukti);
router.delete('/:id', canEditTindakLanjut, deleteBukti);

module.exports = router;