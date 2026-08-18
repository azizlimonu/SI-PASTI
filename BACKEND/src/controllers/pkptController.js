const { Pkpt, Penugasan, Spt, User } = require('../models');
const writeLog = require('../utils/writeLog');
const { getKeirbanFilter } = require('../middleware/auth');
const { Op } = require('sequelize');

// ═══════════════════════════════════════════
// GET ALL PKPT
// ═══════════════════════════════════════════
const getPkpt = async (req, res) => {
  try {
    const { tahun, status, keirbanan } = req.query;
    const user = req.user;

    // Filter berdasarkan role
    const where = { ...getKeirbanFilter(user, keirbanan) };
    if (tahun) where.tahun = tahun;
    if (status) where.status = status;

    const { page = 1, limit = 25 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const { count, rows } = await Pkpt.findAndCountAll({
      where,
      include: [
        {
          model: Penugasan,
          as: 'penugasans',
          attributes: ['id', 'nama_penugasan', 'status'],
          include: [
            {
              model: Spt,
              as: 'spt',
              attributes: ['id', 'tanggal_spt']
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'nama', 'nip']
        }
      ],
      order: [['tahun', 'DESC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / parseInt(limit))
      }
    })
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// GET PKPT BY ID
// ═══════════════════════════════════════════
const getPkptById = async (req, res) => {
  try {
    const pkpt = await Pkpt.findByPk(req.params.id, {
      include: [
        {
          model: Penugasan,
          as: 'penugasans',
          include: [
            {
              model: Spt,
              as: 'spt',
              attributes: ['id', 'nomor_spt', 'tanggal_spt']
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'nama', 'nip']
        }
      ]
    });

    if (!pkpt) {
      return res.status(404).json({
        success: false,
        message: 'PKPT tidak ditemukan.'
      });
    }

    // Cek akses keirbanan
    const user = req.user;
    if (user.keirbanan !== 'ALL' && pkpt.keirbanan !== user.keirbanan) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Anda hanya bisa mengakses Keirbanan ${user.keirbanan}.`
      });
    }

    return res.json({ success: true, data: pkpt });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// CREATE PKPT
// ═══════════════════════════════════════════
const createPkpt = async (req, res) => {
  try {
    const { tahun, nama_program, keirbanan } = req.body;
    const user = req.user;

    if (!tahun || !nama_program || !keirbanan) {
      return res.status(400).json({
        success: false,
        message: 'Tahun, nama program, dan keirbanan wajib diisi.'
      });
    }

    if (!['I', 'II', 'III', 'IV', 'V'].includes(keirbanan)) {
      return res.status(400).json({
        success: false,
        message: 'Keirbanan tidak valid. Pilih I, II, III, IV, atau V.'
      });
    }

    // Admin hanya bisa buat PKPT untuk keirbannya sendiri
    if (user.keirbanan !== 'ALL' && user.keirbanan !== keirbanan) {
      return res.status(403).json({
        success: false,
        message: `Anda hanya bisa membuat PKPT untuk Keirbanan ${user.keirbanan}.`
      });
    }

    const pkpt = await Pkpt.create({
      tahun,
      nama_program,
      keirbanan,
      status: 'Aktif',
      created_by: user.id
    });

    await writeLog(
      user.id,
      user.nama,
      'Tambah PKPT',
      'PKPT',
      `PKPT ${tahun} — ${nama_program} (Keirbanan ${keirbanan})`,
      keirbanan
    );

    return res.status(201).json({
      success: true,
      message: 'PKPT berhasil dibuat.',
      data: pkpt
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// UPDATE PKPT
// ═══════════════════════════════════════════
const updatePkpt = async (req, res) => {
  try {
    const { tahun, nama_program, status } = req.body;
    const user = req.user;

    const pkpt = await Pkpt.findByPk(req.params.id);

    if (!pkpt) {
      return res.status(404).json({
        success: false,
        message: 'PKPT tidak ditemukan.'
      });
    }

    // Cek akses keirbanan
    if (user.keirbanan !== 'ALL' && pkpt.keirbanan !== user.keirbanan) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Anda hanya bisa mengakses Keirbanan ${user.keirbanan}.`
      });
    }

    await pkpt.update({
      tahun: tahun || pkpt.tahun,
      nama_program: nama_program || pkpt.nama_program,
      status: status || pkpt.status
    });

    await writeLog(
      user.id,
      user.nama,
      'Edit PKPT',
      'PKPT',
      `PKPT ${pkpt.tahun} — ${pkpt.nama_program} (Keirbanan ${pkpt.keirbanan})`,
      pkpt.keirbanan
    );

    return res.json({
      success: true,
      message: 'PKPT berhasil diupdate.',
      data: pkpt
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// DELETE PKPT
// ═══════════════════════════════════════════
const deletePkpt = async (req, res) => {
  try {
    const user = req.user;
    const pkpt = await Pkpt.findByPk(req.params.id, {
      include: [{ model: Penugasan, as: 'penugasans' }]
    });

    if (!pkpt) {
      return res.status(404).json({
        success: false,
        message: 'PKPT tidak ditemukan.'
      });
    }

    // Cek akses keirbanan
    if (user.keirbanan !== 'ALL' && pkpt.keirbanan !== user.keirbanan) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Anda hanya bisa mengakses Keirbanan ${user.keirbanan}.`
      });
    }

    // Cek apakah PKPT masih punya penugasan
    if (pkpt.penugasans && pkpt.penugasans.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'PKPT tidak bisa dihapus karena masih memiliki penugasan. Hapus penugasan terlebih dahulu.'
      });
    }

    const logDetail = `PKPT ${pkpt.tahun} — ${pkpt.nama_program} (Keirbanan ${pkpt.keirbanan})`;
    await pkpt.destroy();

    await writeLog(
      user.id,
      user.nama,
      'Hapus PKPT',
      'PKPT',
      logDetail,
      pkpt.keirbanan
    );

    return res.json({
      success: true,
      message: 'PKPT berhasil dihapus.'
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

module.exports = { getPkpt, getPkptById, createPkpt, updatePkpt, deletePkpt };