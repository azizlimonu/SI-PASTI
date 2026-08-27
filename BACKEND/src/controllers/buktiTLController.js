const {
  BuktiTL, TindakLanjutBukti, TindakLanjut,
  Rekomendasi, User, sequelize
} = require('../models');
const writeLog = require('../utils/writeLog');
const fs = require('fs');
const { sendFileDownload } = require('../utils/downloadFile');

// ═══════════════════════════════════════════
// GET SEMUA BUKTI (master)
// ═══════════════════════════════════════════
const getAllBukti = async (req, res) => {
  try {
    const { tindak_lanjut_id } = req.query;

    let where = {};
    let include = [
      { model: User, as: 'uploader', attributes: ['id', 'nama'] }
    ];

    // Kalau ada filter tindak_lanjut_id
    if (tindak_lanjut_id) {
      const tl = await TindakLanjut.findByPk(tindak_lanjut_id, {
        include: [{ model: BuktiTL, as: 'buktis' }]
      });

      if (!tl) {
        return res.status(404).json({
          success: false,
          message: 'Tindak lanjut tidak ditemukan.'
        });
      }

      return res.json({ success: true, data: tl.buktis });
    }

    const { page = 1, limit = 25 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const { count, rows } = await BuktiTL.findAndCountAll({
      where,
      include,
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
// UPLOAD BUKTI BARU + ATTACH KE TL
// ═══════════════════════════════════════════
const uploadBukti = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { judul_bukti, keterangan, tindak_lanjut_id, link_bukti } = req.body;
    const user = req.user;

    if (!judul_bukti) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Judul bukti wajib diisi.'
      });
    }

    if (!req.file && !link_bukti) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Upload file atau isi link bukti, minimal salah satu wajib diisi.'
      });
    }

    // Buat master bukti
    const bukti = await BuktiTL.create({
      judul_bukti,
      file_path: req.file ? req.file.path : null,
      link_bukti: link_bukti || null,
      keterangan: keterangan || null,
      uploaded_by: user.id
    }, { transaction });

    // Attach ke tindak lanjut jika ada
    if (tindak_lanjut_id) {
      const tlIds = Array.isArray(tindak_lanjut_id)
        ? tindak_lanjut_id
        : [tindak_lanjut_id];

      for (const tlId of tlIds) {
        await TindakLanjutBukti.create({
          tindak_lanjut_id: tlId,
          bukti_id: bukti.id
        }, { transaction });
      }
    }

    await transaction.commit();

    await writeLog(
      user.id,
      user.nama,
      'Upload Bukti TL',
      'Bukti TL',
      judul_bukti,
      user.keirbanan
    );

    return res.status(201).json({
      success: true,
      message: 'Bukti berhasil diupload.',
      data: bukti
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
// ATTACH BUKTI EXISTING KE TL
// ═══════════════════════════════════════════
const attachBukti = async (req, res) => {
  try {
    const { bukti_id, tindak_lanjut_id } = req.body;

    if (!bukti_id || !tindak_lanjut_id) {
      return res.status(400).json({
        success: false,
        message: 'Bukti ID dan tindak lanjut ID wajib diisi.'
      });
    }

    const bukti = await BuktiTL.findByPk(bukti_id);
    if (!bukti) {
      return res.status(404).json({
        success: false,
        message: 'Bukti tidak ditemukan.'
      });
    }

    // Cek apakah sudah diattach
    const existing = await TindakLanjutBukti.findOne({
      where: { bukti_id, tindak_lanjut_id }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Bukti sudah diattach ke tindak lanjut ini.'
      });
    }

    await TindakLanjutBukti.create({ tindak_lanjut_id, bukti_id });

    return res.json({
      success: true,
      message: 'Bukti berhasil diattach ke tindak lanjut.'
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// DETACH BUKTI DARI TL
// ═══════════════════════════════════════════
const detachBukti = async (req, res) => {
  try {
    const { bukti_id, tindak_lanjut_id } = req.body;

    await TindakLanjutBukti.destroy({
      where: { bukti_id, tindak_lanjut_id }
    });

    return res.json({
      success: true,
      message: 'Bukti berhasil didetach dari tindak lanjut.'
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// UPDATE BUKTI
// ═══════════════════════════════════════════
const updateBukti = async (req, res) => {
  try {
    const { judul_bukti, keterangan, link_bukti } = req.body;
    const user = req.user;

    const bukti = await BuktiTL.findByPk(req.params.id);
    if (!bukti) {
      return res.status(404).json({
        success: false,
        message: 'Bukti tidak ditemukan.'
      });
    }

    // Hapus file lama jika ada file baru
    if (req.file && bukti.file_path && fs.existsSync(bukti.file_path)) {
      fs.unlinkSync(bukti.file_path);
    }

    await bukti.update({
      judul_bukti: judul_bukti || bukti.judul_bukti,
      file_path: req.file ? req.file.path : bukti.file_path,
      link_bukti: link_bukti !== undefined ? link_bukti : bukti.link_bukti,
      keterangan: keterangan !== undefined ? keterangan : bukti.keterangan
    });

    return res.json({
      success: true,
      message: 'Bukti berhasil diupdate.',
      data: bukti
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// DELETE BUKTI (dari master)
// ═══════════════════════════════════════════
const deleteBukti = async (req, res) => {
  try {
    const user = req.user;

    const bukti = await BuktiTL.findByPk(req.params.id);
    if (!bukti) {
      return res.status(404).json({
        success: false,
        message: 'Bukti tidak ditemukan.'
      });
    }

    // Hapus semua relasi pivot dulu
    await TindakLanjutBukti.destroy({ where: { bukti_id: bukti.id } });

    // Hapus file jika ada
    if (bukti.file_path && fs.existsSync(bukti.file_path)) {
      fs.unlinkSync(bukti.file_path);
    }

    await bukti.destroy();

    await writeLog(
      user.id,
      user.nama,
      'Hapus Bukti TL',
      'Bukti TL',
      bukti.judul_bukti,
      user.keirbanan
    );

    return res.json({
      success: true,
      message: 'Bukti berhasil dihapus.'
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// DOWNLOAD FILE BUKTI TL
// ═══════════════════════════════════════════
const downloadBukti = async (req, res) => {
  try {
    const user = req.user;
    const bukti = await BuktiTL.findByPk(req.params.id, {
      include: [{
        model: TindakLanjut, as: 'tindakLanjuts',
        through: { attributes: [] },
        include: [{
          model: Rekomendasi, as: 'rekomendasi',
          include: [{
            model: Temuan, as: 'temuan',
            include: [{
              model: DokumenPenugasan, as: 'dokumen',
              include: [{
                model: Penugasan, as: 'penugasan',
                include: [{ model: Pkpt, as: 'pkpt' }]
              }]
            }]
          }]
        }]
      }]
    });

    if (!bukti) {
      return res.status(404).json({ success: false, message: 'Bukti tidak ditemukan.' });
    }

    if (user.keirbanan !== 'ALL') {
      const boleh = (bukti.tindakLanjuts || []).some(tl =>
        tl.rekomendasi?.temuan?.dokumen?.penugasan?.pkpt?.keirbanan === user.keirbanan
      );
      if (!boleh) {
        return res.status(403).json({ success: false, message: 'Akses ditolak.' });
      }
    }

    return sendFileDownload(res, bukti.file_path, bukti.judul_bukti);
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + e.message });
  }
};

module.exports = {
  downloadBukti,
  getAllBukti,
  uploadBukti,
  attachBukti,
  detachBukti,
  updateBukti,
  deleteBukti
};