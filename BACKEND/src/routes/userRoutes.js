const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  nonaktifkanUser,
  aktifkanUser,
  resetPassword
} = require('../controllers/userController');

const { authenticate, isSuperAdmin } = require('../middleware/auth');

// Semua routes user hanya untuk superadmin
router.use(authenticate, isSuperAdmin);

router.get('/', getUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.patch('/:id/nonaktifkan', nonaktifkanUser);
router.patch('/:id/aktifkan', aktifkanUser);
router.patch('/:id/reset-password', resetPassword);

module.exports = router;