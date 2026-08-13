const { verifyToken } = require('../utils/helpers');
const { User } = require('../models');

// ═══════════════════════════════════════════
// AUTHENTICATE — cek token
// ═══════════════════════════════════════════
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan. Silakan login.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findOne({
      where: { id: decoded.id, status: 'AKTIF' }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan atau tidak aktif.'
      });
    }

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau sudah expired. Silakan login kembali.'
    });
  }
};

// ═══════════════════════════════════════════
// ROLE CHECKS
// ═══════════════════════════════════════════
const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Fitur ini hanya untuk superadmin.'
    });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Fitur ini hanya untuk admin.'
    });
  }
  next();
};

const isAdminTL = (req, res, next) => {
  if (!['admin', 'admin_tl', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Fitur ini hanya untuk admin tindak lanjut.'
    });
  }
  next();
};

const isReadOnly = (req, res, next) => {
  if (!['irban', 'inspektur'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak.'
    });
  }
  next();
};

// ═══════════════════════════════════════════
// KEIRBANAN ACCESS
// ═══════════════════════════════════════════
const canAccessKeirbanan = (req, res, next) => {
  const { keirbanan } = req.params;
  const user = req.user;

  // superadmin, inspektur, admin_tl bisa akses semua
  if (user.keirbanan === 'ALL') return next();

  // admin, irban hanya bisa akses keirbannya sendiri
  if (user.keirbanan !== keirbanan) {
    return res.status(403).json({
      success: false,
      message: `Akses ditolak. Anda hanya bisa mengakses Keirbanan ${user.keirbanan}.`
    });
  }
  next();
};

// ═══════════════════════════════════════════
// DOCUMENT ACCESS
// ═══════════════════════════════════════════
const canEditDokumen = (req, res, next) => {
  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin yang bisa mengelola dokumen.'
    });
  }
  next();
};

const canEditTindakLanjut = (req, res, next) => {
  if (!['admin', 'admin_tl', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin dan admin TL yang bisa mengelola tindak lanjut.'
    });
  }
  next();
};

// ═══════════════════════════════════════════
// FILTER KEIRBANAN untuk query
// helper untuk dipakai di controller
// ═══════════════════════════════════════════
const getKeirbanFilter = (user, keirbanan = null) => {
  // superadmin, inspektur, admin_tl bisa lihat semua
  if (user.keirbanan === 'ALL') {
    return keirbanan ? { keirbanan } : {};
  }
  // admin, irban hanya keirbannya sendiri
  return { keirbanan: user.keirbanan };
};

module.exports = {
  authenticate,
  isSuperAdmin,
  isAdmin,
  isAdminTL,
  isReadOnly,
  canAccessKeirbanan,
  canEditDokumen,
  canEditTindakLanjut,
  getKeirbanFilter
};