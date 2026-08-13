const { User } = require('../models');
const { hashPassword, comparePassword, generateToken } = require('../utils/helpers');
const writeLog = require('../utils/writeLog');
require('dotenv').config();

// ═══════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════
const login = async (req, res) => {
  try {
    const { nip, password } = req.body;

    if (!nip || !password) {
      return res.status(400).json({
        success: false,
        message: 'NIP dan password wajib diisi.'
      });
    }

    const user = await User.findOne({ where: { nip: String(nip) } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'NIP tidak terdaftar.'
      });
    }

    if (user.status !== 'AKTIF') {
      return res.status(401).json({
        success: false,
        message: 'Akun Anda tidak aktif. Hubungi administrator.'
      });
    }

    const passwordValid = await comparePassword(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'NIP atau password salah.'
      });
    }

    const token = generateToken({
      id: user.id,
      nip: user.nip,
      nama: user.nama,
      role: user.role,
      keirbanan: user.keirbanan
    });

    return res.json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        nip: user.nip,
        nama: user.nama,
        jabatan: user.jabatan,
        role: user.role,
        keirbanan: user.keirbanan,
        firstLogin: user.first_login
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
// CHANGE PASSWORD
// ═══════════════════════════════════════════
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = req.user;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 8 karakter.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Konfirmasi password tidak cocok.'
      });
    }

    if (newPassword === oldPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password baru tidak boleh sama dengan password lama.'
      });
    }

    const passwordValid = await comparePassword(oldPassword, user.password);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password lama tidak sesuai.'
      });
    }

    const hashedNew = await hashPassword(newPassword);
    await user.update({ password: hashedNew, first_login: false });

    await writeLog(
      user.id,
      user.nama,
      'Ganti Password',
      'User',
      'Mengganti password akun',
      user.keirbanan
    );

    return res.json({
      success: true,
      message: 'Password berhasil diubah.'
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// GET PROFILE
// ═══════════════════════════════════════════
const getProfile = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: {
        id: req.user.id,
        nip: req.user.nip,
        nama: req.user.nama,
        jabatan: req.user.jabatan,
        role: req.user.role,
        keirbanan: req.user.keirbanan,
        firstLogin: req.user.first_login
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
// CREATE USER (superadmin only)
// ═══════════════════════════════════════════
const createUser = async (req, res) => {
  try {
    const { nip, nama, jabatan, role, keirbanan } = req.body;

    if (!nip || !nama || !jabatan || !role) {
      return res.status(400).json({
        success: false,
        message: 'NIP, nama, jabatan, dan role wajib diisi.'
      });
    }

    if (!['superadmin', 'admin', 'admin_tl', 'irban', 'inspektur'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role tidak valid.'
      });
    }

    // Validasi keirbanan berdasarkan role
    const roleButuhKeirbanan = ['admin', 'irban'];
    if (roleButuhKeirbanan.includes(role)) {
      if (!keirbanan || !['I', 'II', 'III', 'IV', 'V'].includes(keirbanan)) {
        return res.status(400).json({
          success: false,
          message: `Role ${role} wajib memiliki keirbanan yang valid (I/II/III/IV/V).`
        });
      }
    }

    const existing = await User.findOne({ where: { nip: String(nip) } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'NIP sudah terdaftar.'
      });
    }

    // Role ALL atau sesuai keirbanan
    const keirbanValue = ['superadmin', 'inspektur', 'admin_tl'].includes(role)
      ? 'ALL'
      : keirbanan;

    const hashedPassword = await hashPassword(process.env.PASSWORD_DEFAULT);
    const user = await User.create({
      nip: String(nip),
      nama,
      jabatan,
      status: 'AKTIF',
      role,
      keirbanan: keirbanValue,
      password: hashedPassword,
      first_login: true
    });

    await writeLog(
      req.user.id,
      req.user.nama,
      'Tambah User',
      'User',
      `${nama} (NIP: ${nip}) sebagai ${role} Keirbanan ${keirbanValue}`,
      req.user.keirbanan
    );

    return res.status(201).json({
      success: true,
      message: `User berhasil ditambahkan. Password default: ${process.env.PASSWORD_DEFAULT}`,
      user: {
        id: user.id,
        nip: user.nip,
        nama: user.nama,
        jabatan: user.jabatan,
        role: user.role,
        keirbanan: user.keirbanan
      }
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

module.exports = { login, changePassword, getProfile, createUser };