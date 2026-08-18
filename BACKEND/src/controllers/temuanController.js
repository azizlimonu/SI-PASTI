const {
  Temuan, Rekomendasi, DokumenPenugasan,
  Penugasan, Pkpt, Pihak, User, sequelize
} = require('../models');
const writeLog = require('../utils/writeLog');

// ═══════════════════════════════════════════
// GET TEMUAN BY DOKUMEN
// ═══════════════════════════════════════════
const getTemuanByDokumen = async (req, res) => {
  try {
    const { dokumen_id } = req.params;

    const { page = 1, limit = 25 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const { count, rows } = await Temuan.findAndCountAll({
      where: { dokumen_penugasan_id: dokumen_id },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'nama'] },
        {
          model: Rekomendasi,
          as: 'rekomendasis',
          include: [{ model: Pihak, as: 'pihak' }]
        }
      ],
      order: [['created_at', 'ASC']],
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
// CREATE TEMUAN (batch — bisa banyak sekaligus)
// ═══════════════════════════════════════════
const createTemuan = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { dokumen_penugasan_id, temuan } = req.body;
    const user = req.user;

    if (!dokumen_penugasan_id || !temuan || !Array.isArray(temuan)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Dokumen ID dan data temuan wajib diisi.'
      });
    }

    // Cek dokumen adalah LHP
    const dokumen = await DokumenPenugasan.findByPk(dokumen_penugasan_id, {
      include: [{
        model: Penugasan,
        as: 'penugasan',
        include: [{ model: Pkpt, as: 'pkpt' }]
      }]
    });

    if (!dokumen) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan.'
      });
    }

    if (dokumen.jenis_dokumen !== 'LHP') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Temuan hanya bisa ditambahkan pada dokumen LHP.'
      });
    }

    if (user.keirbanan !== 'ALL' &&
      dokumen.penugasan.pkpt.keirbanan !== user.keirbanan) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: `Akses ditolak.`
      });
    }

    const hasil = [];

    for (const t of temuan) {
      if (!t.judul_temuan || !t.uraian_temuan) continue;

      const temuanBaru = await Temuan.create({
        dokumen_penugasan_id,
        judul_temuan: t.judul_temuan,
        uraian_temuan: t.uraian_temuan,
        created_by: user.id
      }, { transaction });

      const rekomendasiHasil = [];

      if (t.rekomendasi && Array.isArray(t.rekomendasi)) {
        for (const r of t.rekomendasi) {
          const rek = await Rekomendasi.create({
            temuan_id: temuanBaru.id,
            uraian_rekomendasi: r.uraian_rekomendasi,
            pihak_id: r.pihak_id || null,
            ditujukan_kepada: r.ditujukan_kepada,
            adalah_tgr: r.adalah_tgr || false,
            nilai_temuan: r.adalah_tgr ? r.nilai_temuan : null,
            nilai_terlunasi: 0,
            batas_waktu_tl: r.batas_waktu_tl || null,
            status: 'Belum Ditindaklanjuti',
            created_by: user.id
          }, { transaction });

          rekomendasiHasil.push(rek);
        }
      }

      hasil.push({ ...temuanBaru.toJSON(), rekomendasis: rekomendasiHasil });
    }

    await transaction.commit();

    await writeLog(
      user.id,
      user.nama,
      'Tambah Temuan',
      'LHP',
      `${hasil.length} temuan pada ${dokumen.judul_dokumen}`,
      dokumen.penugasan.pkpt.keirbanan
    );

    return res.status(201).json({
      success: true,
      message: `${hasil.length} temuan berhasil disimpan.`,
      data: hasil
    });
  } catch (e) {
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// UPDATE TEMUAN
// ═══════════════════════════════════════════
const updateTemuan = async (req, res) => {
  try {
    const { judul_temuan, uraian_temuan } = req.body;
    const user = req.user;

    const temuan = await Temuan.findByPk(req.params.id, {
      include: [{
        model: DokumenPenugasan,
        as: 'dokumen',
        include: [{
          model: Penugasan,
          as: 'penugasan',
          include: [{ model: Pkpt, as: 'pkpt' }]
        }]
      }]
    });

    if (!temuan) {
      return res.status(404).json({
        success: false,
        message: 'Temuan tidak ditemukan.'
      });
    }

    if (user.keirbanan !== 'ALL' &&
      temuan.dokumen.penugasan.pkpt.keirbanan !== user.keirbanan) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak.`
      });
    }

    await temuan.update({
      judul_temuan: judul_temuan || temuan.judul_temuan,
      uraian_temuan: uraian_temuan || temuan.uraian_temuan
    });

    await writeLog(
      user.id,
      user.nama,
      'Edit Temuan',
      'LHP',
      `${temuan.judul_temuan}`,
      temuan.dokumen.penugasan.pkpt.keirbanan
    );

    return res.json({
      success: true,
      message: 'Temuan berhasil diupdate.',
      data: temuan
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// DELETE TEMUAN
// ═══════════════════════════════════════════
const deleteTemuan = async (req, res) => {
  try {
    const user = req.user;

    const temuan = await Temuan.findByPk(req.params.id, {
      include: [
        { model: Rekomendasi, as: 'rekomendasis' },
        {
          model: DokumenPenugasan,
          as: 'dokumen',
          include: [{
            model: Penugasan,
            as: 'penugasan',
            include: [{ model: Pkpt, as: 'pkpt' }]
          }]
        }
      ]
    });

    if (!temuan) {
      return res.status(404).json({
        success: false,
        message: 'Temuan tidak ditemukan.'
      });
    }

    if (user.keirbanan !== 'ALL' &&
      temuan.dokumen.penugasan.pkpt.keirbanan !== user.keirbanan) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak.`
      });
    }

    if (temuan.rekomendasis && temuan.rekomendasis.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Temuan tidak bisa dihapus karena masih memiliki rekomendasi. Hapus rekomendasi terlebih dahulu.'
      });
    }

    const logDetail = temuan.judul_temuan;
    const keirbanan = temuan.dokumen.penugasan.pkpt.keirbanan;

    await temuan.destroy();

    await writeLog(
      user.id,
      user.nama,
      'Hapus Temuan',
      'LHP',
      logDetail,
      keirbanan
    );

    return res.json({
      success: true,
      message: 'Temuan berhasil dihapus.'
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

module.exports = {
  getTemuanByDokumen,
  createTemuan,
  updateTemuan,
  deleteTemuan
};