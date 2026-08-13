const express = require('express');
const router = express.Router();
const { login, changePassword, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limit khusus login — max 5 percobaan per 15 menit
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Terlalu banyak percobaan login. Coba lagi setelah 15 menit.' }
});

router.post('/login', loginLimiter, login);
router.post('/change-password', authenticate, changePassword);
router.get('/profile', authenticate, getProfile);

module.exports = router;