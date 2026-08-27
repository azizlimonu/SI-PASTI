const { Spt, Tim, Penugasan, Pkpt, User } = require('../models');
const writeLog = require('../utils/writeLog');
const path = require('path');
const fs = require('fs');
const { sendFileDownload } = require('../utils/downloadFile');

// ═══════════════════════════════════════════
// GET SPT BY PENUGASAN
// ═══════════════════════════════════════════
const getSptByPenugasan = async (req, res) => {
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

    const spt = await Spt.findOne({
      where: { penugasan_id },
      include: [
        { model: Tim, as: 'tims' },
        { model: User, as: 'creator', attributes: ['id', 'nama'] }
      ]
    });

    return res.json({ success: true, data: spt });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// CREATE SPT + TIM
// ═══════════════════════════════════════════
const createSpt = async (req, res) => {
  try {
    const user = req.user;
    const {
      penugasan_id, nomor_spt,
      jenis_kegiatan, jenis_kegiatan_lainnya,
      uraian_kegiatan, tanggal_mulai,
      tanggal_selesai
    } = req.body;

    let tim = [];
    if (req.body.tim) {
      try {
        tim = typeof req.body.tim === 'string'
          ? JSON.parse(req.body.tim)
          : req.body.tim;
      } catch (e) {
        tim = [];
      }
    }

    const jumlah_hari_input = req.body.jumlah_hari;

    if (!penugasan_id || !nomor_spt || !jenis_kegiatan ||
      !uraian_kegiatan || !tanggal_mulai || !tanggal_selesai) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi.'
      });
    }

    if (jenis_kegiatan === 'Lainnya' && !jenis_kegiatan_lainnya) {
      return res.status(400).json({
        success: false,
        message: 'Keterangan jenis kegiatan lainnya wajib diisi.'
      });
    }

    // Hitung jumlah hari otomatis
    // Prioritas: input manual jumlah_hari (untuk kasus WFH/WFA/libur/agenda lain)
    // Jika tidak diisi manual, hitung otomatis dari selisih tanggal
    let jumlah_hari;
    if (jumlah_hari_input !== undefined && jumlah_hari_input !== '') {
      jumlah_hari = parseInt(jumlah_hari_input);
    } else {
      const mulai = new Date(tanggal_mulai);
      const selesai = new Date(tanggal_selesai);
      jumlah_hari = Math.floor(
        (selesai - mulai) / (1000 * 60 * 60 * 24)
      ) + 1;
    }


    if (jumlah_hari <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal selesai harus setelah tanggal mulai.'
      });
    }

    // Cek penugasan dan akses keirbanan
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

    // Cek apakah SPT sudah ada
    const existingSpt = await Spt.findOne({ where: { penugasan_id } });
    if (existingSpt) {
      return res.status(400).json({
        success: false,
        message: 'SPT untuk penugasan ini sudah ada. Gunakan fitur update.'
      });
    }

    // Buat SPT
    const { link_spt } = req.body;

    if (!req.file && !link_spt) {
      return res.status(400).json({
        success: false,
        message: 'Upload file SPT atau isi link SPT, minimal salah satu wajib diisi.'
      });
    }

    const spt = await Spt.create({
      penugasan_id,
      nomor_spt,
      jenis_kegiatan,
      jenis_kegiatan_lainnya: jenis_kegiatan === 'Lainnya'
        ? jenis_kegiatan_lainnya
        : null,
      uraian_kegiatan,
      tanggal_mulai,
      tanggal_selesai,
      jumlah_hari,
      file_spt: req.file ? req.file.path : null,
      link_spt: link_spt || null,
      created_by: user.id
    });

    // Buat Tim jika ada
    if (tim && Array.isArray(tim) && tim.length > 0) {
      const timData = tim.map(t => ({
        spt_id: spt.id,
        nip: t.nip,
        nama: t.nama,
        jabatan_tim: t.jabatan_tim
      }));
      await Tim.bulkCreate(timData);
    }

    // Update status penugasan
    await penugasan.update({ status: 'Dalam Proses' });

    await writeLog(
      user.id,
      user.nama,
      'Tambah SPT',
      'SPT',
      `${nomor_spt} — ${jenis_kegiatan} ${uraian_kegiatan} — ${penugasan.nama_penugasan} Keirbanan ${penugasan.pkpt.keirbanan}`,
      penugasan.pkpt.keirbanan
    );

    const result = await Spt.findByPk(spt.id, {
      include: [{ model: Tim, as: 'tims' }]
    });

    return res.status(201).json({
      success: true,
      message: 'SPT berhasil dibuat.',
      data: result
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// UPDATE SPT
// ═══════════════════════════════════════════
const updateSpt = async (req, res) => {
  try {
    const nomor_spt = req.body.nomor_spt
    const jenis_kegiatan = req.body.jenis_kegiatan
    const jenis_kegiatan_lainnya = req.body.jenis_kegiatan_lainnya
    const uraian_kegiatan = req.body.uraian_kegiatan
    const tanggal_mulai = req.body.tanggal_mulai
    const tanggal_selesai = req.body.tanggal_selesai
    const link_spt = req.body.link_spt
    const jumlah_hari_input = req.body.jumlah_hari

    let timData = []
    if (req.body.tim) {
      try {
        timData = typeof req.body.tim === 'string'
          ? JSON.parse(req.body.tim)
          : req.body.tim
      } catch (e) {
        timData = []
      }
    }
    const user = req.user;

    const spt = await Spt.findByPk(req.params.id, {
      include: [
        { model: Tim, as: 'tims' },
        {
          model: Penugasan,
          as: 'penugasan',
          include: [{ model: Pkpt, as: 'pkpt' }]
        }
      ]
    });

    if (!spt) {
      return res.status(404).json({
        success: false,
        message: 'SPT tidak ditemukan.'
      });
    }

    if (user.keirbanan !== 'ALL' &&
      spt.penugasan.pkpt.keirbanan !== user.keirbanan) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Anda hanya bisa mengakses Keirbanan ${user.keirbanan}.`
      });
    }

    // Prioritas: input manual jumlah_hari dari user (untuk kasus WFH/WFA/libur/agenda lain)
    // Jika tidak diisi manual, hitung otomatis dari selisih tanggal
    let jumlah_hari = spt.jumlah_hari;
    if (jumlah_hari_input !== undefined && jumlah_hari_input !== '') {
      jumlah_hari = parseInt(jumlah_hari_input);
    } else if (tanggal_mulai || tanggal_selesai) {
      const mulai = new Date(tanggal_mulai || spt.tanggal_mulai);
      const selesai = new Date(tanggal_selesai || spt.tanggal_selesai);
      jumlah_hari = Math.floor(
        (selesai - mulai) / (1000 * 60 * 60 * 24)
      ) + 1;
    }

    await spt.update({
      nomor_spt: nomor_spt || spt.nomor_spt,
      jenis_kegiatan: jenis_kegiatan || spt.jenis_kegiatan,
      jenis_kegiatan_lainnya: jenis_kegiatan === 'Lainnya'
        ? jenis_kegiatan_lainnya
        : jenis_kegiatan
          ? null
          : spt.jenis_kegiatan_lainnya,
      uraian_kegiatan: uraian_kegiatan || spt.uraian_kegiatan,
      tanggal_mulai: tanggal_mulai || spt.tanggal_mulai,
      tanggal_selesai: tanggal_selesai || spt.tanggal_selesai,
      jumlah_hari: jumlah_hari ? parseInt(jumlah_hari) : spt.jumlah_hari,
      file_spt: req.file ? req.file.path : spt.file_spt,
      link_spt: link_spt !== undefined ? link_spt : spt.link_spt
    })

    // Update tim jika ada
    if (timData !== undefined) {
      await Tim.destroy({ where: { spt_id: spt.id } })
      if (timData.length > 0) {
        const timRows = timData.map(t => ({
          spt_id: spt.id,
          nip: t.nip,
          nama: t.nama,
          jabatan_tim: t.jabatan_tim
        }))
        await Tim.bulkCreate(timRows)
      }
    }

    await writeLog(
      user.id,
      user.nama,
      'Edit SPT',
      'SPT',
      `${spt.nomor_spt} — ${spt.penugasan.nama_penugasan}`,
      spt.penugasan.pkpt.keirbanan
    );

    const result = await Spt.findByPk(spt.id, {
      include: [{ model: Tim, as: 'tims' }]
    });

    return res.json({
      success: true,
      message: 'SPT berhasil diupdate.',
      data: result
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// DELETE SPT
// ═══════════════════════════════════════════
const deleteSpt = async (req, res) => {
  try {
    const user = req.user;

    const spt = await Spt.findByPk(req.params.id, {
      include: [
        { model: Tim, as: 'tims' },
        {
          model: Penugasan,
          as: 'penugasan',
          include: [{ model: Pkpt, as: 'pkpt' }]
        }
      ]
    });

    if (!spt) {
      return res.status(404).json({
        success: false,
        message: 'SPT tidak ditemukan.'
      });
    }

    if (user.keirbanan !== 'ALL' &&
      spt.penugasan.pkpt.keirbanan !== user.keirbanan) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Anda hanya bisa mengakses Keirbanan ${user.keirbanan}.`
      });
    }

    const logDetail = `${spt.nomor_spt} — ${spt.penugasan.nama_penugasan}`;
    const keirbanan = spt.penugasan.pkpt.keirbanan;

    // Hapus tim dulu
    await Tim.destroy({ where: { spt_id: spt.id } });

    // Hapus file jika ada
    if (spt.file_spt && fs.existsSync(spt.file_spt)) {
      fs.unlinkSync(spt.file_spt);
    }

    await spt.destroy();

    await writeLog(
      user.id,
      user.nama,
      'Hapus SPT',
      'SPT',
      logDetail,
      keirbanan
    );

    return res.json({
      success: true,
      message: 'SPT berhasil dihapus.'
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// TAMBAH ANGGOTA TIM
// ═══════════════════════════════════════════
const tambahTim = async (req, res) => {
  try {
    const { spt_id } = req.params;
    const { nip, nama, jabatan_tim } = req.body;
    const user = req.user;

    if (!nip || !nama || !jabatan_tim) {
      return res.status(400).json({
        success: false,
        message: 'NIP, nama, dan jabatan tim wajib diisi.'
      });
    }

    const spt = await Spt.findByPk(spt_id, {
      include: [{
        model: Penugasan,
        as: 'penugasan',
        include: [{ model: Pkpt, as: 'pkpt' }]
      }]
    });

    if (!spt) {
      return res.status(404).json({
        success: false,
        message: 'SPT tidak ditemukan.'
      });
    }

    if (user.keirbanan !== 'ALL' &&
      spt.penugasan.pkpt.keirbanan !== user.keirbanan) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak.`
      });
    }

    const tim = await Tim.create({ spt_id, nip, nama, jabatan_tim });

    return res.status(201).json({
      success: true,
      message: 'Anggota tim berhasil ditambahkan.',
      data: tim
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// HAPUS ANGGOTA TIM
// ═══════════════════════════════════════════
const hapusTim = async (req, res) => {
  try {
    const tim = await Tim.findByPk(req.params.tim_id);

    if (!tim) {
      return res.status(404).json({
        success: false,
        message: 'Anggota tim tidak ditemukan.'
      });
    }

    await tim.destroy();

    return res.json({
      success: true,
      message: 'Anggota tim berhasil dihapus.'
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// Donwload SPT
// ═══════════════════════════════════════════
// DOWNLOAD FILE SPT
// ═══════════════════════════════════════════
const downloadSpt = async (req, res) => {
  try {
    const user = req.user;
    const spt = await Spt.findByPk(req.params.id, {
      include: [{ model: Penugasan, as: 'penugasan', include: [{ model: Pkpt, as: 'pkpt' }] }]
    });

    if (!spt) {
      return res.status(404).json({ success: false, message: 'SPT tidak ditemukan.' });
    }

    if (user.keirbanan !== 'ALL' && spt.penugasan.pkpt.keirbanan !== user.keirbanan) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    return sendFileDownload(res, spt.file_spt, `SPT-${spt.nomor_spt || spt.id}`);
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + e.message });
  }
};

module.exports = {
  getSptByPenugasan,
  createSpt,
  updateSpt,
  deleteSpt,
  tambahTim,
  hapusTim,
  downloadSpt
};