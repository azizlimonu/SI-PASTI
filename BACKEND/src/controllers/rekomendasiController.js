const {
  Rekomendasi, Temuan, DokumenPenugasan,
  Penugasan, Pkpt, Pihak, User, TindakLanjut
} = require('../models');
const writeLog = require('../utils/writeLog');

// ═══════════════════════════════════════════
// GET REKOMENDASI BY TEMUAN
// ═══════════════════════════════════════════
const getRekomendasiByTemuan = async (req, res) => {
  try {
    const { temuan_id } = req.params;

    const rekomendasi = await Rekomendasi.findAll({
      where: { temuan_id },
      include: [
        { model: Pihak, as: 'pihak' },
        { model: User, as: 'creator', attributes: ['id', 'nama'] },
        {
          model: TindakLanjut,
          as: 'tindakLanjuts',
          include: ['buktis']
        }
      ],
      order: [['created_at', 'ASC']]
    });

    return res.json({ success: true, data: rekomendasi });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// CREATE REKOMENDASI
// ═══════════════════════════════════════════
const createRekomendasi = async (req, res) => {
  try {
    const {
      temuan_id, uraian_rekomendasi, pihak_id,
      ditujukan_kepada, adalah_tgr, nilai_temuan,
      batas_waktu_tl
    } = req.body;
    const user = req.user;

    if (!temuan_id || !uraian_rekomendasi || !ditujukan_kepada) {
      return res.status(400).json({
        success: false,
        message: 'Temuan, uraian rekomendasi, dan ditujukan kepada wajib diisi.'
      });
    }

    if (adalah_tgr && !nilai_temuan) {
      return res.status(400).json({
        success: false,
        message: 'Nilai temuan wajib diisi untuk temuan TGR.'
      });
    }

    // Cek akses
    const temuan = await Temuan.findByPk(temuan_id, {
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

    const rekomendasi = await Rekomendasi.create({
      temuan_id,
      uraian_rekomendasi,
      pihak_id: pihak_id || null,
      ditujukan_kepada,
      adalah_tgr: adalah_tgr || false,
      nilai_temuan: adalah_tgr ? nilai_temuan : null,
      nilai_terlunasi: 0,
      batas_waktu_tl: batas_waktu_tl || null,
      status: 'Belum Ditindaklanjuti',
      created_by: user.id
    });

    await writeLog(
      user.id,
      user.nama,
      'Tambah Rekomendasi',
      'Rekomendasi',
      `${ditujukan_kepada} — ${temuan.judul_temuan}`,
      temuan.dokumen.penugasan.pkpt.keirbanan
    );

    return res.status(201).json({
      success: true,
      message: 'Rekomendasi berhasil ditambahkan.',
      data: rekomendasi
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// UPDATE REKOMENDASI
// ═══════════════════════════════════════════
const updateRekomendasi = async (req, res) => {
  try {
    const {
      uraian_rekomendasi, pihak_id, ditujukan_kepada,
      adalah_tgr, nilai_temuan, nilai_terlunasi,
      batas_waktu_tl, status
    } = req.body;
    const user = req.user;

    const rekomendasi = await Rekomendasi.findByPk(req.params.id, {
      include: [{
        model: Temuan,
        as: 'temuan',
        include: [{
          model: DokumenPenugasan,
          as: 'dokumen',
          include: [{
            model: Penugasan,
            as: 'penugasan',
            include: [{ model: Pkpt, as: 'pkpt' }]
          }]
        }]
      }]
    });

    if (!rekomendasi) {
      return res.status(404).json({
        success: false,
        message: 'Rekomendasi tidak ditemukan.'
      });
    }

    if (user.keirbanan !== 'ALL' &&
      rekomendasi.temuan.dokumen.penugasan.pkpt.keirbanan !== user.keirbanan) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak.`
      });
    }

    await rekomendasi.update({
      uraian_rekomendasi: uraian_rekomendasi || rekomendasi.uraian_rekomendasi,
      pihak_id: pihak_id !== undefined ? pihak_id : rekomendasi.pihak_id,
      ditujukan_kepada: ditujukan_kepada || rekomendasi.ditujukan_kepada,
      adalah_tgr: adalah_tgr !== undefined ? adalah_tgr : rekomendasi.adalah_tgr,
      nilai_temuan: nilai_temuan !== undefined ? nilai_temuan : rekomendasi.nilai_temuan,
      nilai_terlunasi: nilai_terlunasi !== undefined ? nilai_terlunasi : rekomendasi.nilai_terlunasi,
      batas_waktu_tl: batas_waktu_tl !== undefined ? batas_waktu_tl : rekomendasi.batas_waktu_tl,
      status: status || rekomendasi.status
    });

    await writeLog(
      user.id,
      user.nama,
      'Edit Rekomendasi',
      'Rekomendasi',
      `${rekomendasi.ditujukan_kepada} — ${rekomendasi.temuan.judul_temuan}`,
      rekomendasi.temuan.dokumen.penugasan.pkpt.keirbanan
    );

    return res.json({
      success: true,
      message: 'Rekomendasi berhasil diupdate.',
      data: rekomendasi
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// DELETE REKOMENDASI
// ═══════════════════════════════════════════
const deleteRekomendasi = async (req, res) => {
  try {
    const user = req.user;

    const rekomendasi = await Rekomendasi.findByPk(req.params.id, {
      include: [
        { model: TindakLanjut, as: 'tindakLanjuts' },
        {
          model: Temuan,
          as: 'temuan',
          include: [{
            model: DokumenPenugasan,
            as: 'dokumen',
            include: [{
              model: Penugasan,
              as: 'penugasan',
              include: [{ model: Pkpt, as: 'pkpt' }]
            }]
          }]
        }
      ]
    });

    if (!rekomendasi) {
      return res.status(404).json({
        success: false,
        message: 'Rekomendasi tidak ditemukan.'
      });
    }

    if (user.keirbanan !== 'ALL' &&
      rekomendasi.temuan.dokumen.penugasan.pkpt.keirbanan !== user.keirbanan) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak.`
      });
    }

    if (rekomendasi.tindakLanjuts && rekomendasi.tindakLanjuts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Rekomendasi tidak bisa dihapus karena sudah memiliki tindak lanjut.'
      });
    }

    const logDetail = `${rekomendasi.ditujukan_kepada} — ${rekomendasi.temuan.judul_temuan}`;
    const keirbanan = rekomendasi.temuan.dokumen.penugasan.pkpt.keirbanan;

    await rekomendasi.destroy();

    await writeLog(
      user.id,
      user.nama,
      'Hapus Rekomendasi',
      'Rekomendasi',
      logDetail,
      keirbanan
    );

    return res.json({
      success: true,
      message: 'Rekomendasi berhasil dihapus.'
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

module.exports = {
  getRekomendasiByTemuan,
  createRekomendasi,
  updateRekomendasi,
  deleteRekomendasi
};