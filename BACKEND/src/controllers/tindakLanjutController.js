const {
  TindakLanjut, Rekomendasi, Temuan,
  DokumenPenugasan, Penugasan, Pkpt,
  BuktiTL, TindakLanjutBukti, User, sequelize, Pihak
} = require('../models');
const writeLog = require('../utils/writeLog');
const { Op } = require('sequelize');

// ═══════════════════════════════════════════
// GET TL BY REKOMENDASI
// ═══════════════════════════════════════════
const getTLByRekomendasi = async (req, res) => {
  try {
    const { rekomendasi_id } = req.params;

    const { page = 1, limit = 25 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const { count, rows } = await TindakLanjut.findAndCountAll({
      where: { rekomendasi_id },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'nama'] },
        {
          model: BuktiTL,
          as: 'buktis',
          through: { attributes: [] }
        },
        {
          model: Rekomendasi,
          as: 'rekomendasi',
          include: [
            { model: Pihak, as: 'pihak' },
            { model: Temuan, as: 'temuan', attributes: ['id', 'judul_temuan'] }
          ]
        }
      ],
      order: [['tanggal_tl', 'DESC']],
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
// GET ALL TL (untuk admin_tl — semua keirbanan)
// ═══════════════════════════════════════════
const getAllTL = async (req, res) => {
  try {
    const { status, status_penerimaan, keirbanan, search } = req.query;
    const user = req.user;

    // Build filter keirbanan lewat relasi
    const pkptWhere = {};
    if (user.keirbanan !== 'ALL') {
      pkptWhere.keirbanan = user.keirbanan;
    } else if (keirbanan) {
      pkptWhere.keirbanan = keirbanan;
    }

    const rekWhere = {};
    if (status) rekWhere.status = status;

    const tlWhere = {};
    if (status_penerimaan) tlWhere.status_penerimaan = status_penerimaan;
    if (search) {
      tlWhere[Op.or] = [
        { uraian_tl: { [Op.like]: `%${search}%` } },
        { '$rekomendasi.ditujukan_kepada$': { [Op.like]: `%${search}%` } },
        { '$rekomendasi.temuan.judul_temuan$': { [Op.like]: `%${search}%` } },
        { '$rekomendasi.temuan.dokumen.penugasan.nama_penugasan$': { [Op.like]: `%${search}%` } }
      ];
    }

    const tl = await TindakLanjut.findAll({
      where: tlWhere,
      subQuery: false,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'nama'] },
        {
          model: BuktiTL,
          as: 'buktis',
          through: { attributes: [] }
        },
        {
          model: Rekomendasi,
          as: 'rekomendasi',
          where: rekWhere,
          include: [{
            model: Temuan,
            as: 'temuan',
            include: [{
              model: DokumenPenugasan,
              as: 'dokumen',
              include: [{
                model: Penugasan,
                as: 'penugasan',
                include: [{
                  model: Pkpt,
                  as: 'pkpt',
                  where: pkptWhere
                }]
              }]
            }]
          }]
        }
      ],
      order: [['tanggal_tl', 'DESC']]
    });

    return res.json({ success: true, data: tl });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// CREATE TL (bisa batch — banyak rekomendasi sekaligus)
// ═══════════════════════════════════════════
const createTL = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      rekomendasi_id, uraian_tl,
      tanggal_tl, status_penerimaan,
      bukti_ids // array bukti existing yang mau diattach
    } = req.body;
    const user = req.user;

    if (!rekomendasi_id || !uraian_tl || !tanggal_tl) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Rekomendasi, uraian, dan tanggal tindak lanjut wajib diisi.'
      });
    }

    // Cek akses lewat rekomendasi
    const rekomendasi = await Rekomendasi.findByPk(rekomendasi_id, {
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
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Rekomendasi tidak ditemukan.'
      });
    }

    const keirbanan = rekomendasi.temuan.dokumen.penugasan.pkpt.keirbanan;

    if (user.keirbanan !== 'ALL' && user.keirbanan !== keirbanan) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Anda hanya bisa mengakses Keirbanan ${user.keirbanan}.`
      });
    }

    // Buat TL
    const tl = await TindakLanjut.create({
      rekomendasi_id,
      uraian_tl,
      tanggal_tl,
      status_penerimaan: status_penerimaan || 'Belum Diterima',
      created_by: user.id
    }, { transaction });

    // Attach bukti existing jika ada
    if (bukti_ids && Array.isArray(bukti_ids) && bukti_ids.length > 0) {
      for (const buktiId of bukti_ids) {
        await TindakLanjutBukti.create({
          tindak_lanjut_id: tl.id,
          bukti_id: buktiId
        }, { transaction });
      }
    }

    // Update status rekomendasi otomatis
    await updateStatusRekomendasi(rekomendasi_id, transaction);

    await transaction.commit();

    await writeLog(
      user.id,
      user.nama,
      'Tambah Tindak Lanjut',
      'Tindak Lanjut',
      `${rekomendasi.ditujukan_kepada} — ${rekomendasi.temuan.judul_temuan}`,
      keirbanan
    );

    const result = await TindakLanjut.findByPk(tl.id, {
      include: [{
        model: BuktiTL,
        as: 'buktis',
        through: { attributes: [] }
      }]
    });

    return res.status(201).json({
      success: true,
      message: 'Tindak lanjut berhasil ditambahkan.',
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
// CREATE TL BATCH (banyak rekomendasi sekaligus)
// ═══════════════════════════════════════════
const createTLBatch = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { tindak_lanjut, bukti_untuk_semua } = req.body;
    const user = req.user;

    if (!tindak_lanjut || !Array.isArray(tindak_lanjut)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Data tindak lanjut wajib diisi.'
      });
    }

    const hasil = [];

    for (const item of tindak_lanjut) {
      if (!item.rekomendasi_id || !item.uraian_tl || !item.tanggal_tl) continue;

      const tl = await TindakLanjut.create({
        rekomendasi_id: item.rekomendasi_id,
        uraian_tl: item.uraian_tl,
        tanggal_tl: item.tanggal_tl,
        status_penerimaan: item.status_penerimaan || 'Belum Diterima',
        created_by: user.id
      }, { transaction });

      // Attach bukti untuk semua TL jika ada
      if (bukti_untuk_semua && Array.isArray(bukti_untuk_semua)) {
        for (const buktiId of bukti_untuk_semua) {
          await TindakLanjutBukti.create({
            tindak_lanjut_id: tl.id,
            bukti_id: buktiId
          }, { transaction });
        }
      }

      // Attach bukti spesifik per TL
      if (item.bukti_ids && Array.isArray(item.bukti_ids)) {
        for (const buktiId of item.bukti_ids) {
          // Cek dulu supaya tidak duplikat
          const alreadyAttached = bukti_untuk_semua?.includes(buktiId);
          if (!alreadyAttached) {
            await TindakLanjutBukti.create({
              tindak_lanjut_id: tl.id,
              bukti_id: buktiId
            }, { transaction });
          }
        }
      }

      // Update status rekomendasi
      await updateStatusRekomendasi(item.rekomendasi_id, transaction);

      hasil.push(tl);
    }

    await transaction.commit();

    await writeLog(
      user.id,
      user.nama,
      'Tambah Tindak Lanjut Batch',
      'Tindak Lanjut',
      `${hasil.length} tindak lanjut berhasil disimpan`,
      user.keirbanan
    );

    return res.status(201).json({
      success: true,
      message: `${hasil.length} tindak lanjut berhasil disimpan.`,
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
// UPDATE TL
// ═══════════════════════════════════════════
const updateTL = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { uraian_tl, tanggal_tl, status_penerimaan } = req.body;
    const user = req.user;

    const tl = await TindakLanjut.findByPk(req.params.id, {
      include: [{
        model: Rekomendasi,
        as: 'rekomendasi',
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
      }]
    });

    if (!tl) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Tindak lanjut tidak ditemukan.'
      });
    }

    const keirbanan = tl.rekomendasi.temuan.dokumen.penugasan.pkpt.keirbanan;
    if (user.keirbanan !== 'ALL' && user.keirbanan !== keirbanan) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: `Akses ditolak.`
      });
    }

    await tl.update({
      uraian_tl: uraian_tl || tl.uraian_tl,
      tanggal_tl: tanggal_tl || tl.tanggal_tl,
      status_penerimaan: status_penerimaan || tl.status_penerimaan
    }, { transaction });

    // Update status rekomendasi otomatis
    await updateStatusRekomendasi(tl.rekomendasi_id, transaction);

    // Update nilai terlunasi jika TGR dan status diterima
    if (tl.rekomendasi.adalah_tgr) {
      await updateNilaiTerlunasi(tl.rekomendasi_id, transaction);
    }

    await transaction.commit();

    await writeLog(
      user.id,
      user.nama,
      'Edit Tindak Lanjut',
      'Tindak Lanjut',
      `${tl.rekomendasi.ditujukan_kepada}`,
      keirbanan
    );

    return res.json({
      success: true,
      message: 'Tindak lanjut berhasil diupdate.',
      data: tl
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
// DELETE TL
// ═══════════════════════════════════════════
const deleteTL = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = req.user;

    const tl = await TindakLanjut.findByPk(req.params.id, {
      include: [{
        model: Rekomendasi,
        as: 'rekomendasi',
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
      }]
    });

    if (!tl) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Tindak lanjut tidak ditemukan.'
      });
    }

    const keirbanan = tl.rekomendasi.temuan.dokumen.penugasan.pkpt.keirbanan;
    if (user.keirbanan !== 'ALL' && user.keirbanan !== keirbanan) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: `Akses ditolak.`
      });
    }

    const rekId = tl.rekomendasi_id;
    const logDetail = `${tl.rekomendasi.ditujukan_kepada}`;

    // Hapus relasi pivot dulu
    await TindakLanjutBukti.destroy({
      where: { tindak_lanjut_id: tl.id },
      transaction
    });

    await tl.destroy({ transaction });

    // Update status rekomendasi
    await updateStatusRekomendasi(rekId, transaction);

    await transaction.commit();

    await writeLog(
      user.id,
      user.nama,
      'Hapus Tindak Lanjut',
      'Tindak Lanjut',
      logDetail,
      keirbanan
    );

    return res.json({
      success: true,
      message: 'Tindak lanjut berhasil dihapus.'
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
// HELPER — Update status rekomendasi otomatis
// ═══════════════════════════════════════════
const updateStatusRekomendasi = async (rekomendasi_id, transaction) => {
  const semuaTL = await TindakLanjut.findAll({
    where: { rekomendasi_id },
    transaction
  });

  let statusBaru = 'Belum Ditindaklanjuti';

  if (semuaTL.length > 0) {
    const semuaDiterima = semuaTL.every(
      tl => tl.status_penerimaan === 'Diterima'
    );
    const adaDiterima = semuaTL.some(
      tl => tl.status_penerimaan === 'Diterima' ||
        tl.status_penerimaan === 'Sebagian Diterima'
    );

    if (semuaDiterima) {
      statusBaru = 'Selesai';
    } else if (adaDiterima) {
      statusBaru = 'Dalam Proses';
    } else {
      statusBaru = 'Dalam Proses';
    }
  }

  await Rekomendasi.update(
    { status: statusBaru },
    { where: { id: rekomendasi_id }, transaction }
  );
};

// ═══════════════════════════════════════════
// HELPER — Update nilai terlunasi TGR
// ═══════════════════════════════════════════
const updateNilaiTerlunasi = async (rekomendasi_id, transaction) => {
  const rekomendasi = await Rekomendasi.findByPk(rekomendasi_id, {
    include: [{
      model: TindakLanjut,
      as: 'tindakLanjuts',
      where: { status_penerimaan: { [Op.in]: ['Diterima', 'Sebagian Diterima'] } },
      required: false
    }],
    transaction
  });

  if (!rekomendasi || !rekomendasi.adalah_tgr) return;

  // Untuk sekarang nilai terlunasi diisi manual saat update TL
  // Nanti bisa dikembangkan dengan input nilai per TL
};

module.exports = {
  getTLByRekomendasi,
  getAllTL,
  createTL,
  createTLBatch,
  updateTL,
  deleteTL
};