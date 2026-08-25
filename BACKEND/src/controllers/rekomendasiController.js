const {
  Rekomendasi, Temuan, DokumenPenugasan,
  Penugasan, Pkpt, Pihak, User, TindakLanjut,
  SetoranTgr, sequelize
} = require('../models');
const writeLog = require('../utils/writeLog');

// ═══════════════════════════════════════════
// GET REKOMENDASI BY TEMUAN
// ═══════════════════════════════════════════
const getRekomendasiByTemuan = async (req, res) => {
  try {
    const { temuan_id } = req.params;

    const { page = 1, limit = 25 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const { count, rows } = await Rekomendasi.findAndCountAll({
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
      order: [['created_at', 'ASC']],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    const data = rows.map(r => {
      const rj = r.toJSON();
      rj.ada_bukti_tl = (rj.tindakLanjuts || []).some(
        tl => tl.status_penerimaan === 'Diterima' && tl.buktis && tl.buktis.length > 0
      );
      return rj;
    });

    return res.json({
      success: true,
      data,
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

    let finalPihakId = pihak_id || null;

    if (!finalPihakId && pihak && pihak.nama && pihak.jenis_pihak) {
      const validJenis = ['ASN', 'Instansi/OPD', 'Perusahaan', 'Perorangan', 'Lainnya'];
      if (!validJenis.includes(pihak.jenis_pihak)) {
        return res.status(400).json({
          success: false,
          message: 'Jenis pihak tidak valid.'
        });
      }
      const pihakBaru = await Pihak.create({
        nama: pihak.nama,
        nip: pihak.nip || null,
        nik: pihak.nik || null,
        jabatan: pihak.jabatan || null,
        instansi_perusahaan: pihak.instansi_perusahaan || null,
        jenis_pihak: pihak.jenis_pihak,
        jenis_pihak_lainnya: pihak.jenis_pihak === 'Lainnya' ? (pihak.jenis_pihak_lainnya || null) : null,
        keterangan: pihak.keterangan || null,
        created_by: user.id
      });
      finalPihakId = pihakBaru.id;
    }

    const rekomendasi = await Rekomendasi.create({
      temuan_id,
      uraian_rekomendasi,
      pihak_id: finalPihakId,
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

// ═══════════════════════════════════════════
// TAMBAH SETORAN TGR
// ═══════════════════════════════════════════
const tambahSetoranTgr = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { jumlah_setoran, tanggal_setor, keterangan, link_bukti } = req.body;
    const user = req.user;

    if (!jumlah_setoran || !tanggal_setor) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Jumlah setoran dan tanggal setor wajib diisi.'
      });
    }

    if (!req.file && !link_bukti) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Upload file atau isi link bukti setor, minimal salah satu wajib diisi.'
      });
    }

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
      }],
      transaction
    });

    if (!rekomendasi) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Rekomendasi tidak ditemukan.'
      });
    }

    if (!rekomendasi.adalah_tgr) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Setoran hanya berlaku untuk rekomendasi TGR.'
      });
    }

    const keirbanan = rekomendasi.temuan.dokumen.penugasan.pkpt.keirbanan;
    if (user.keirbanan !== 'ALL' && user.keirbanan !== keirbanan) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak.'
      });
    }

    const setoran = await SetoranTgr.create({
      rekomendasi_id: rekomendasi.id,
      jumlah_setoran,
      tanggal_setor,
      keterangan: keterangan || null,
      file_path: req.file ? req.file.path : null,
      link_bukti: link_bukti || null,
      created_by: user.id
    }, { transaction });

    const nilaiTerlunasiBaru = parseFloat(rekomendasi.nilai_terlunasi || 0) + parseFloat(jumlah_setoran);
    const statusBaru = nilaiTerlunasiBaru >= parseFloat(rekomendasi.nilai_temuan || 0)
      ? 'Selesai'
      : (rekomendasi.status === 'Belum Ditindaklanjuti' ? 'Dalam Proses' : rekomendasi.status);

    await rekomendasi.update({
      nilai_terlunasi: nilaiTerlunasiBaru,
      status: statusBaru
    }, { transaction });

    await transaction.commit();

    await writeLog(
      user.id,
      user.nama,
      'Tambah Setoran TGR',
      'Rekomendasi',
      `${rekomendasi.ditujukan_kepada} — Setoran Rp ${parseFloat(jumlah_setoran).toLocaleString('id-ID')}`,
      keirbanan
    );

    return res.status(201).json({
      success: true,
      message: 'Setoran TGR berhasil dicatat.',
      data: {
        setoran,
        nilai_terlunasi: nilaiTerlunasiBaru,
        sisa: parseFloat(rekomendasi.nilai_temuan || 0) - nilaiTerlunasiBaru,
        status: statusBaru
      }
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
// GET RIWAYAT SETORAN TGR
// ═══════════════════════════════════════════
const getSetoranByRekomendasi = async (req, res) => {
  try {
    const setorans = await SetoranTgr.findAll({
      where: { rekomendasi_id: req.params.id },
      include: [{ model: User, as: 'creator', attributes: ['id', 'nama'] }],
      order: [['tanggal_setor', 'DESC']]
    });
    return res.json({ success: true, data: setorans });
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
  deleteRekomendasi,
  tambahSetoranTgr,
  getSetoranByRekomendasi
};