const {
  DokumenPenugasan, Temuan, Rekomendasi,
  Penugasan, Pkpt, User, Pihak, sequelize
} = require('../models');
const writeLog = require('../utils/writeLog');
const { Op } = require('sequelize');
const fs = require('fs');

// ═══════════════════════════════════════════
// GET DOKUMEN BY PENUGASAN
// ═══════════════════════════════════════════
const getDokumenByPenugasan = async (req, res) => {
  try {
    const { penugasan_id } = req.params;
    const user = req.user;

    const penugasan = await Penugasan.findByPk(penugasan_id, {
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

    const dokumen = await DokumenPenugasan.findAll({
      where: { penugasan_id },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'nama'] },
        {
          model: Temuan,
          as: 'temuans',
          include: [
            {
              model: Rekomendasi,
              as: 'rekomendasis',
              include: [
                { model: Pihak, as: 'pihak' }
              ]
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.json({ success: true, data: dokumen });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// GET DOKUMEN BY ID
// ═══════════════════════════════════════════
const getDokumenById = async (req, res) => {
  try {
    const dokumen = await DokumenPenugasan.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'nama'] },
        {
          model: Penugasan,
          as: 'penugasan',
          include: [{ model: Pkpt, as: 'pkpt' }]
        },
        {
          model: Temuan,
          as: 'temuans',
          include: [
            {
              model: Rekomendasi,
              as: 'rekomendasis',
              include: [{ model: Pihak, as: 'pihak' }]
            }
          ]
        }
      ]
    });

    if (!dokumen) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan.'
      });
    }

    const user = req.user;
    if (user.keirbanan !== 'ALL' &&
      dokumen.penugasan.pkpt.keirbanan !== user.keirbanan) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak.`
      });
    }

    return res.json({ success: true, data: dokumen });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// CREATE DOKUMEN (dengan optional temuan & rekomendasi untuk LHP)
// ═══════════════════════════════════════════
const createDokumen = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      penugasan_id, jenis_dokumen, judul_dokumen,
      link_dokumen, temuan
    } = req.body;
    const user = req.user;

    if (!penugasan_id || !jenis_dokumen || !judul_dokumen) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Penugasan, jenis dokumen, dan judul dokumen wajib diisi.'
      });
    }

    // Validasi file atau link
    if (!req.file && !link_dokumen) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Upload file atau isi link dokumen, minimal salah satu wajib diisi.'
      });
    }

    // Cek penugasan dan akses
    const penugasan = await Penugasan.findByPk(penugasan_id, {
      include: [{ model: Pkpt, as: 'pkpt' }]
    });

    if (!penugasan) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Penugasan tidak ditemukan.'
      });
    }

    if (user.keirbanan !== 'ALL' &&
      penugasan.pkpt.keirbanan !== user.keirbanan) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Anda hanya bisa mengakses Keirbanan ${user.keirbanan}.`
      });
    }

    // Buat dokumen
    const dokumen = await DokumenPenugasan.create({
      penugasan_id,
      jenis_dokumen,
      judul_dokumen,
      file_path: req.file ? req.file.path : null,
      link_dokumen: link_dokumen || null,
      created_by: user.id
    }, { transaction });

    // Kalau LHP dan ada temuan — simpan sekaligus
    if (jenis_dokumen === 'LHP' && temuan) {
      const temuanData = typeof temuan === 'string'
        ? JSON.parse(temuan)
        : temuan;

      for (const t of temuanData) {
        const temuanBaru = await Temuan.create({
          dokumen_penugasan_id: dokumen.id,
          judul_temuan: t.judul_temuan,
          uraian_temuan: t.uraian_temuan,
          created_by: user.id
        }, { transaction });

        // Simpan rekomendasi per temuan
        if (t.rekomendasi && Array.isArray(t.rekomendasi)) {
          for (const r of t.rekomendasi) {
            await Rekomendasi.create({
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
          }
        }
      }
    }

    await transaction.commit();

    await writeLog(
      user.id,
      user.nama,
      'Upload Dokumen',
      jenis_dokumen,
      `${judul_dokumen} — ${penugasan.nama_penugasan} Keirbanan ${penugasan.pkpt.keirbanan}`,
      penugasan.pkpt.keirbanan
    );

    // Ambil data lengkap
    const result = await DokumenPenugasan.findByPk(dokumen.id, {
      include: [
        {
          model: Temuan,
          as: 'temuans',
          include: [{
            model: Rekomendasi,
            as: 'rekomendasis',
            include: [{ model: Pihak, as: 'pihak' }]
          }]
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Dokumen berhasil diupload.',
      data: result
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
// UPDATE DOKUMEN
// ═══════════════════════════════════════════
const updateDokumen = async (req, res) => {
  try {
    const { judul_dokumen, link_dokumen } = req.body;
    const user = req.user;

    const dokumen = await DokumenPenugasan.findByPk(req.params.id, {
      include: [{
        model: Penugasan,
        as: 'penugasan',
        include: [{ model: Pkpt, as: 'pkpt' }]
      }]
    });

    if (!dokumen) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan.'
      });
    }

    if (user.keirbanan !== 'ALL' &&
      dokumen.penugasan.pkpt.keirbanan !== user.keirbanan) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak.`
      });
    }

    // Hapus file lama jika ada file baru
    if (req.file && dokumen.file_path && fs.existsSync(dokumen.file_path)) {
      fs.unlinkSync(dokumen.file_path);
    }

    await dokumen.update({
      judul_dokumen: judul_dokumen || dokumen.judul_dokumen,
      file_path: req.file ? req.file.path : dokumen.file_path,
      link_dokumen: link_dokumen !== undefined ? link_dokumen : dokumen.link_dokumen
    });

    await writeLog(
      user.id,
      user.nama,
      'Edit Dokumen',
      dokumen.jenis_dokumen,
      `${dokumen.judul_dokumen} — ${dokumen.penugasan.nama_penugasan}`,
      dokumen.penugasan.pkpt.keirbanan
    );

    return res.json({
      success: true,
      message: 'Dokumen berhasil diupdate.',
      data: dokumen
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// DELETE DOKUMEN
// ═══════════════════════════════════════════
const deleteDokumen = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;

    const dokumen = await DokumenPenugasan.findByPk(req.params.id, {
      include: [
        {
          model: Penugasan,
          as: 'penugasan',
          include: [{ model: Pkpt, as: 'pkpt' }]
        },
        { model: Temuan, as: 'temuans' }
      ]
    });

    if (!dokumen) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan.'
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

    // Cek apakah LHP masih punya temuan
    if (dokumen.temuans && dokumen.temuans.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Dokumen LHP tidak bisa dihapus karena masih memiliki temuan. Hapus temuan terlebih dahulu.'
      });
    }

    const logDetail = `${dokumen.judul_dokumen} — ${dokumen.penugasan.nama_penugasan}`;
    const keirbanan = dokumen.penugasan.pkpt.keirbanan;

    // Hapus file jika ada
    if (dokumen.file_path && fs.existsSync(dokumen.file_path)) {
      fs.unlinkSync(dokumen.file_path);
    }

    await dokumen.destroy({ transaction });
    await transaction.commit();

    await writeLog(
      user.id,
      user.nama,
      'Hapus Dokumen',
      dokumen.jenis_dokumen,
      logDetail,
      keirbanan
    );

    return res.json({
      success: true,
      message: 'Dokumen berhasil dihapus.'
    });
  } catch (e) {
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

module.exports = {
  getDokumenByPenugasan,
  getDokumenById,
  createDokumen,
  updateDokumen,
  deleteDokumen
};