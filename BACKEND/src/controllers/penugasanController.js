const {
  Penugasan, Pkpt, Spt, Tim,
  DokumenPenugasan, User
} = require('../models');
const writeLog = require('../utils/writeLog');
const { getKeirbanFilter } = require('../middleware/auth');
const { Op } = require('sequelize');

// ═══════════════════════════════════════════
// GET ALL PENUGASAN
// ═══════════════════════════════════════════
const getPenugasan = async (req, res) => {
  try {
    const { pkpt_id, status, search, tahun } = req.query
    const user = req.user;

    // Build where untuk PKPT (filter keirbanan lewat PKPT)
    const pkptWhere = { ...getKeirbanFilter(user) };
    if (tahun) pkptWhere.tahun = tahun;
    if (pkpt_id) pkptWhere.id = pkpt_id;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { nama_penugasan: { [Op.like]: `%${search}%` } },
        { jenis_penugasan: { [Op.like]: `%${search}%` } }
      ];
    }

    const { page = 1, limit = 25 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const { count, rows } = await Penugasan.findAndCountAll({
      where,
      include: [
        {
          model: Pkpt,
          as: 'pkpt',
          where: pkptWhere,
          attributes: ['id', 'tahun', 'nama_program', 'keirbanan']
        },
        {
          model: Spt,
          as: 'spt',
          attributes: ['id', 'nomor_spt', 'tanggal_mulai', 'tanggal_selesai'],
          include: [
            {
              model: Tim,
              as: 'tims',
              attributes: ['id', 'nip', 'nama', 'jabatan_tim']
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'nama', 'nip']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true
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
// GET PENUGASAN BY ID
// ═══════════════════════════════════════════
const getPenugasanById = async (req, res) => {
  try {
    const user = req.user;

    const penugasan = await Penugasan.findByPk(req.params.id, {
      include: [
        {
          model: Pkpt,
          as: 'pkpt',
          attributes: ['id', 'tahun', 'nama_program', 'keirbanan', 'status']
        },
        {
          model: Spt,
          as: 'spt',
          include: [
            { model: Tim, as: 'tims' },
            { model: User, as: 'creator', attributes: ['id', 'nama'] }
          ]
        },
        {
          model: DokumenPenugasan,
          as: 'dokumens',
          include: [
            { model: User, as: 'creator', attributes: ['id', 'nama'] }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'nama', 'nip']
        }
      ]
    });

    if (!penugasan) {
      return res.status(404).json({
        success: false,
        message: 'Penugasan tidak ditemukan.'
      });
    }

    // Cek akses keirbanan lewat PKPT
    if (user.keirbanan !== 'ALL' &&
      penugasan.pkpt.keirbanan !== user.keirbanan) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Anda hanya bisa mengakses Keirbanan ${user.keirbanan}.`
      });
    }

    return res.json({ success: true, data: penugasan });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// CREATE PENUGASAN
// ═══════════════════════════════════════════
const createPenugasan = async (req, res) => {
  try {
    const {
      pkpt_id, nama_penugasan, jenis_penugasan,
      tanggal_mulai, tanggal_selesai
    } = req.body;
    const user = req.user;

    if (!pkpt_id || !nama_penugasan || !jenis_penugasan) {
      return res.status(400).json({
        success: false,
        message: 'PKPT, nama penugasan, dan jenis penugasan wajib diisi.'
      });
    }

    // Cek PKPT exists dan akses keirbanan
    const pkpt = await Pkpt.findByPk(pkpt_id);
    if (!pkpt) {
      return res.status(404).json({
        success: false,
        message: 'PKPT tidak ditemukan.'
      });
    }

    if (user.keirbanan !== 'ALL' && pkpt.keirbanan !== user.keirbanan) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Anda hanya bisa mengakses Keirbanan ${user.keirbanan}.`
      });
    }

    const penugasan = await Penugasan.create({
      pkpt_id,
      nama_penugasan,
      jenis_penugasan,
      tanggal_mulai: tanggal_mulai || null,
      tanggal_selesai: tanggal_selesai || null,
      status: 'Belum Mulai',
      created_by: user.id
    });

    await writeLog(
      user.id,
      user.nama,
      'Tambah Penugasan',
      'Penugasan',
      `${nama_penugasan} — PKPT ${pkpt.tahun} Keirbanan ${pkpt.keirbanan}`,
      pkpt.keirbanan
    );

    return res.status(201).json({
      success: true,
      message: 'Penugasan berhasil dibuat.',
      data: penugasan
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// UPDATE PENUGASAN
// ═══════════════════════════════════════════
const updatePenugasan = async (req, res) => {
  try {
    const {
      nama_penugasan, jenis_penugasan,
      tanggal_mulai, tanggal_selesai, status
    } = req.body;
    const user = req.user;

    const penugasan = await Penugasan.findByPk(req.params.id, {
      include: [{ model: Pkpt, as: 'pkpt' }]
    });

    if (!penugasan) {
      return res.status(404).json({
        success: false,
        message: 'Penugasan tidak ditemukan.'
      });
    }

    if (user.keirbanan !== 'ALL' &&
      penugasan.pkpt.keirbanan !== user.keirbanan) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Anda hanya bisa mengakses Keirbanan ${user.keirbanan}.`
      });
    }

    await penugasan.update({
      nama_penugasan: nama_penugasan || penugasan.nama_penugasan,
      jenis_penugasan: jenis_penugasan || penugasan.jenis_penugasan,
      tanggal_mulai: tanggal_mulai || penugasan.tanggal_mulai,
      tanggal_selesai: tanggal_selesai || penugasan.tanggal_selesai,
      status: status || penugasan.status
    });

    await writeLog(
      user.id,
      user.nama,
      'Edit Penugasan',
      'Penugasan',
      `${penugasan.nama_penugasan} — Keirbanan ${penugasan.pkpt.keirbanan}`,
      penugasan.pkpt.keirbanan
    );

    return res.json({
      success: true,
      message: 'Penugasan berhasil diupdate.',
      data: penugasan
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// DELETE PENUGASAN
// ═══════════════════════════════════════════
const deletePenugasan = async (req, res) => {
  try {
    const user = req.user;

    const penugasan = await Penugasan.findByPk(req.params.id, {
      include: [
        { model: Pkpt, as: 'pkpt' },
        { model: Spt, as: 'spt' },
        { model: DokumenPenugasan, as: 'dokumens' }
      ]
    });

    if (!penugasan) {
      return res.status(404).json({
        success: false,
        message: 'Penugasan tidak ditemukan.'
      });
    }

    if (user.keirbanan !== 'ALL' &&
      penugasan.pkpt.keirbanan !== user.keirbanan) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Anda hanya bisa mengakses Keirbanan ${user.keirbanan}.`
      });
    }

    // Cek apakah masih punya dokumen
    if (penugasan.dokumens && penugasan.dokumens.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Penugasan tidak bisa dihapus karena masih memiliki dokumen. Hapus dokumen terlebih dahulu.'
      });
    }

    const logDetail = `${penugasan.nama_penugasan} — Keirbanan ${penugasan.pkpt.keirbanan}`;
    const keirbanan = penugasan.pkpt.keirbanan;
    await penugasan.destroy();

    await writeLog(
      user.id,
      user.nama,
      'Hapus Penugasan',
      'Penugasan',
      logDetail,
      keirbanan
    );

    return res.json({
      success: true,
      message: 'Penugasan berhasil dihapus.'
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

module.exports = {
  getPenugasan,
  getPenugasanById,
  createPenugasan,
  updatePenugasan,
  deletePenugasan
};