const { User } = require('../models');
const { hashPassword } = require('../utils/helpers');
const writeLog = require('../utils/writeLog');
const { Op } = require('sequelize');

// ═══════════════════════════════════════════
// GET ALL USERS
// ═══════════════════════════════════════════
const getUsers = async (req, res) => {
  try {
    const { keirbanan, role, status, search } = req.query;

    const where = {};

    // Filter keirbanan
    if (keirbanan) where.keirbanan = keirbanan;
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { nama: { [Op.like]: `%${search}%` } },
        { nip: { [Op.like]: `%${search}%` } },
        { jabatan: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    return res.json({ success: true, data: users });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// GET USER BY ID
// ═══════════════════════════════════════════
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.'
      });
    }

    return res.json({ success: true, data: user });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// UPDATE USER
// ═══════════════════════════════════════════
const updateUser = async (req, res) => {
  try {
    const { nama, jabatan, role, keirbanan, status } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.'
      });
    }

    // Proteksi superadmin tidak bisa ubah role dirinya sendiri
    if (user.id === req.user.id && role && role !== user.role) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak dapat mengubah role akun Anda sendiri.'
      });
    }

    // Validasi keirbanan berdasarkan role baru
    const roleButuhKeirbanan = ['admin', 'irban'];
    const roleYangDipakai = role || user.role;
    if (roleButuhKeirbanan.includes(roleYangDipakai)) {
      const keirbanYangDipakai = keirbanan || user.keirbanan;
      if (!['I', 'II', 'III', 'IV', 'V'].includes(keirbanYangDipakai)) {
        return res.status(400).json({
          success: false,
          message: `Role ${roleYangDipakai} wajib memiliki keirbanan yang valid (I/II/III/IV/V).`
        });
      }
    }

    // Tentukan nilai keirbanan
    let keirbanValue = keirbanan || user.keirbanan;
    if (role && ['superadmin', 'inspektur', 'admin_tl'].includes(role)) {
      keirbanValue = 'ALL';
    }

    await user.update({
      nama: nama || user.nama,
      jabatan: jabatan || user.jabatan,
      role: role || user.role,
      keirbanan: keirbanValue,
      status: status || user.status
    });

    await writeLog(
      req.user.id,
      req.user.nama,
      'Edit User',
      'User',
      `${user.nama} (NIP: ${user.nip}) — role: ${user.role}, keirbanan: ${user.keirbanan}`,
      req.user.keirbanan
    );

    return res.json({
      success: true,
      message: 'User berhasil diupdate.',
      data: {
        id: user.id,
        nip: user.nip,
        nama: user.nama,
        jabatan: user.jabatan,
        role: user.role,
        keirbanan: user.keirbanan,
        status: user.status
      }
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// NONAKTIFKAN USER
// ═══════════════════════════════════════════
const nonaktifkanUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.'
      });
    }

    // Proteksi tidak bisa nonaktifkan diri sendiri
    if (user.id === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak dapat menonaktifkan akun Anda sendiri.'
      });
    }

    await user.update({ status: 'NONAKTIF' });

    await writeLog(
      req.user.id,
      req.user.nama,
      'Nonaktifkan User',
      'User',
      `${user.nama} (NIP: ${user.nip})`,
      req.user.keirbanan
    );

    return res.json({
      success: true,
      message: `User ${user.nama} berhasil dinonaktifkan.`
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// AKTIFKAN USER
// ═══════════════════════════════════════════
const aktifkanUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.'
      });
    }

    await user.update({ status: 'AKTIF' });

    await writeLog(
      req.user.id,
      req.user.nama,
      'Aktifkan User',
      'User',
      `${user.nama} (NIP: ${user.nip})`,
      req.user.keirbanan
    );

    return res.json({
      success: true,
      message: `User ${user.nama} berhasil diaktifkan.`
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// RESET PASSWORD
// ═══════════════════════════════════════════
const resetPassword = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.'
      });
    }

    const hashedPassword = await hashPassword(process.env.PASSWORD_DEFAULT);
    await user.update({
      password: hashedPassword,
      first_login: true
    });

    await writeLog(
      req.user.id,
      req.user.nama,
      'Reset Password',
      'User',
      `${user.nama} (NIP: ${user.nip})`,
      req.user.keirbanan
    );

    return res.json({
      success: true,
      message: `Password ${user.nama} berhasil direset ke default.`
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  nonaktifkanUser,
  aktifkanUser,
  resetPassword
};