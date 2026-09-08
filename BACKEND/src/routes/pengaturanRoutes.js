const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getPengaturan, updatePengaturan } = require('../controllers/pengaturanController');
const { authenticate, isSuperAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/logo/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'LOGO-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // max 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Format logo tidak diizinkan. Gunakan PNG, JPG, atau SVG.'));
    }
  }
});

router.use(authenticate);

router.get('/', getPengaturan);
router.put('/', isSuperAdmin, upload.single('logo'), updatePengaturan);

module.exports = router;