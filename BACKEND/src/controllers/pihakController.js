const {
  Pihak, Rekomendasi, Temuan,
  DokumenPenugasan, Penugasan, Pkpt,
  TindakLanjut, BuktiTL, User
} = require('../models');
const writeLog = require('../utils/writeLog');
const { Op } = require('sequelize');

// ═══════════════════════════════════════════
// GET ALL PIHAK
// ═══════════════════════════════════════════
const getAllPihak = async (req, res) => {
  try {
    const { search, jenis_pihak } = req.query;

    const where = {};
    if (jenis_pihak) where.jenis_pihak = jenis_pihak;
    if (search) {
      where[Op.or] = [
        { nama: { [Op.like]: `%${search}%` } },
        { nip: { [Op.like]: `%${search}%` } },
        { nik: { [Op.like]: `%${search}%` } },
        { instansi_perusahaan: { [Op.like]: `%${search}%` } }
      ];
    }

    const pihak = await Pihak.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'nama'] }
      ],
      order: [['nama', 'ASC']]
    });

    return res.json({ success: true, data: pihak });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// GET PIHAK BY ID + RIWAYAT TEMUAN
// ═══════════════════════════════════════════
const getPihakById = async (req, res) => {
  try {
    const pihak = await Pihak.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'nama'] },
        {
          model: Rekomendasi,
          as: 'rekomendasis',
          include: [
            {
              model: Temuan,
              as: 'temuan',
              include: [{
                model: DokumenPenugasan,
                as: 'dokumen',
                attributes: ['id', 'judul_dokumen', 'jenis_dokumen'],
                include: [{
                  model: Penugasan,
                  as: 'penugasan',
                  attributes: ['id', 'nama_penugasan'],
                  include: [{
                    model: Pkpt,
                    as: 'pkpt',
                    attributes: ['id', 'tahun', 'keirbanan']
                  }]
                }]
              }]
            },
            {
              model: TindakLanjut,
              as: 'tindakLanjuts',
              include: [{
                model: BuktiTL,
                as: 'buktis',
                through: { attributes: [] }
              }]
            }
          ]
        }
      ]
    });

    if (!pihak) {
      return res.status(404).json({
        success: false,
        message: 'Pihak tidak ditemukan.'
      });
    }

    // Hitung statistik
    const totalRekomendasi = pihak.rekomendasis.length;
    const totalSelesai = pihak.rekomendasis.filter(
      r => r.status === 'Selesai'
    ).length;
    const totalBelum = pihak.rekomendasis.filter(
      r => r.status === 'Belum Ditindaklanjuti'
    ).length;
    const totalDalamProses = pihak.rekomendasis.filter(
      r => r.status === 'Dalam Proses'
    ).length;

    // Hitung nilai TGR
    const totalNilaiTGR = pihak.rekomendasis
      .filter(r => r.adalah_tgr)
      .reduce((sum, r) => sum + parseFloat(r.nilai_temuan || 0), 0);
    const totalTerlunasi = pihak.rekomendasis
      .filter(r => r.adalah_tgr)
      .reduce((sum, r) => sum + parseFloat(r.nilai_terlunasi || 0), 0);

    return res.json({
      success: true,
      data: {
        ...pihak.toJSON(),
        statistik: {
          total_rekomendasi: totalRekomendasi,
          selesai: totalSelesai,
          dalam_proses: totalDalamProses,
          belum_ditindaklanjuti: totalBelum,
          total_nilai_tgr: totalNilaiTGR,
          total_terlunasi: totalTerlunasi,
          sisa_tgr: totalNilaiTGR - totalTerlunasi
        }
      }
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// CREATE PIHAK
// ═══════════════════════════════════════════
const createPihak = async (req, res) => {
  try {
    const {
      nama, nip, nik, jabatan,
      instansi_perusahaan, jenis_pihak,
      jenis_pihak_lainnya, keterangan
    } = req.body;
    const user = req.user;

    if (!nama || !jenis_pihak) {
      return res.status(400).json({
        success: false,
        message: 'Nama dan jenis pihak wajib diisi.'
      });
    }

    const validJenis = ['ASN', 'Instansi/OPD', 'Perusahaan', 'Perorangan', 'Lainnya'];
    if (!validJenis.includes(jenis_pihak)) {
      return res.status(400).json({
        success: false,
        message: 'Jenis pihak tidak valid.'
      });
    }

    if (jenis_pihak === 'Lainnya' && !jenis_pihak_lainnya) {
      return res.status(400).json({
        success: false,
        message: 'Keterangan jenis pihak lainnya wajib diisi.'
      });
    }

    // Cek duplikat NIP jika ada
    if (nip) {
      const existing = await Pihak.findOne({ where: { nip } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'NIP sudah terdaftar di master data pihak.'
        });
      }
    }

    const pihak = await Pihak.create({
      nama,
      nip: nip || null,
      nik: nik || null,
      jabatan: jabatan || null,
      instansi_perusahaan: instansi_perusahaan || null,
      jenis_pihak,
      jenis_pihak_lainnya: jenis_pihak === 'Lainnya' ? jenis_pihak_lainnya : null,
      keterangan: keterangan || null,
      created_by: user.id
    });

    await writeLog(
      user.id,
      user.nama,
      'Tambah Pihak',
      'Pihak',
      `${nama} (${jenis_pihak})`,
      user.keirbanan
    );

    return res.status(201).json({
      success: true,
      message: 'Pihak berhasil ditambahkan.',
      data: pihak
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// UPDATE PIHAK
// ═══════════════════════════════════════════
const updatePihak = async (req, res) => {
  try {
    const {
      nama, nip, nik, jabatan,
      instansi_perusahaan, jenis_pihak,
      jenis_pihak_lainnya, keterangan
    } = req.body;
    const user = req.user;

    const pihak = await Pihak.findByPk(req.params.id);
    if (!pihak) {
      return res.status(404).json({
        success: false,
        message: 'Pihak tidak ditemukan.'
      });
    }

    await pihak.update({
      nama: nama || pihak.nama,
      nip: nip !== undefined ? nip : pihak.nip,
      nik: nik !== undefined ? nik : pihak.nik,
      jabatan: jabatan !== undefined ? jabatan : pihak.jabatan,
      instansi_perusahaan: instansi_perusahaan !== undefined
        ? instansi_perusahaan : pihak.instansi_perusahaan,
      jenis_pihak: jenis_pihak || pihak.jenis_pihak,
      jenis_pihak_lainnya: jenis_pihak_lainnya !== undefined
        ? jenis_pihak_lainnya : pihak.jenis_pihak_lainnya,
      keterangan: keterangan !== undefined ? keterangan : pihak.keterangan
    });

    await writeLog(
      user.id,
      user.nama,
      'Edit Pihak',
      'Pihak',
      `${pihak.nama} (${pihak.jenis_pihak})`,
      user.keirbanan
    );

    return res.json({
      success: true,
      message: 'Pihak berhasil diupdate.',
      data: pihak
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// DELETE PIHAK
// ═══════════════════════════════════════════
const deletePihak = async (req, res) => {
  try {
    const user = req.user;

    const pihak = await Pihak.findByPk(req.params.id, {
      include: [{ model: Rekomendasi, as: 'rekomendasis' }]
    });

    if (!pihak) {
      return res.status(404).json({
        success: false,
        message: 'Pihak tidak ditemukan.'
      });
    }

    if (pihak.rekomendasis && pihak.rekomendasis.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Pihak tidak bisa dihapus karena masih memiliki ${pihak.rekomendasis.length} rekomendasi terkait.`
      });
    }

    const logDetail = `${pihak.nama} (${pihak.jenis_pihak})`;
    await pihak.destroy();

    await writeLog(
      user.id,
      user.nama,
      'Hapus Pihak',
      'Pihak',
      logDetail,
      user.keirbanan
    );

    return res.json({
      success: true,
      message: 'Pihak berhasil dihapus.'
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// CEK SKTJM
// ═══════════════════════════════════════════
const cekSKTJM = async (req, res) => {
  try {
    const { pihak_id, nip, nik, nama } = req.query;

    let pihak = null;

    // Cari pihak berdasarkan parameter
    if (pihak_id) {
      pihak = await Pihak.findByPk(pihak_id);
    } else if (nip) {
      pihak = await Pihak.findOne({ where: { nip } });
    } else if (nik) {
      pihak = await Pihak.findOne({ where: { nik } });
    } else if (nama) {
      pihak = await Pihak.findOne({
        where: { nama: { [Op.like]: `%${nama}%` } }
      });
    }

    if (!pihak) {
      return res.status(404).json({
        success: false,
        message: 'Pihak tidak ditemukan di sistem.'
      });
    }

    // Ambil semua rekomendasi terkait pihak ini
    const rekomendasis = await Rekomendasi.findAll({
      where: { pihak_id: pihak.id },
      include: [
        {
          model: Temuan,
          as: 'temuan',
          include: [{
            model: DokumenPenugasan,
            as: 'dokumen',
            attributes: ['id', 'judul_dokumen', 'jenis_dokumen'],
            include: [{
              model: Penugasan,
              as: 'penugasan',
              attributes: ['id', 'nama_penugasan'],
              include: [{
                model: Pkpt,
                as: 'pkpt',
                attributes: ['id', 'tahun', 'keirbanan']
              }]
            }]
          }]
        },
        {
          model: TindakLanjut,
          as: 'tindakLanjuts',
          include: [{
            model: BuktiTL,
            as: 'buktis',
            through: { attributes: [] }
          }]
        }
      ]
    });

    // Pisahkan temuan aktif (belum selesai)
    const tgrAktif = [];
    const administratifAktif = [];
    const selesai = [];

    for (const rek of rekomendasis) {
      const info = {
        rekomendasi_id: rek.id,
        penugasan: rek.temuan.dokumen.penugasan.nama_penugasan,
        tahun_pkpt: rek.temuan.dokumen.penugasan.pkpt.tahun,
        keirbanan: rek.temuan.dokumen.penugasan.pkpt.keirbanan,
        judul_temuan: rek.temuan.judul_temuan,
        uraian_rekomendasi: rek.uraian_rekomendasi,
        batas_waktu_tl: rek.batas_waktu_tl,
        status: rek.status,
        tindak_lanjut: rek.tindakLanjuts
      };

      if (rek.status === 'Selesai') {
        selesai.push(info);
      } else if (rek.adalah_tgr) {
        tgrAktif.push({
          ...info,
          nilai_temuan: parseFloat(rek.nilai_temuan || 0),
          nilai_terlunasi: parseFloat(rek.nilai_terlunasi || 0),
          sisa: parseFloat(rek.nilai_temuan || 0) - parseFloat(rek.nilai_terlunasi || 0)
        });
      } else {
        administratifAktif.push(info);
      }
    }

    // Tentukan status SKTJM
    const adaTemuan = tgrAktif.length > 0 || administratifAktif.length > 0;
    const statusSKTJM = adaTemuan ? 'TIDAK BERSIH' : 'BERSIH';

    // Buat kesimpulan
    let kesimpulan = '';
    if (!adaTemuan) {
      kesimpulan = `${pihak.nama} tidak memiliki temuan aktif. SKTJM dapat diterbitkan.`;
    } else {
      const bagian = [];
      if (tgrAktif.length > 0) {
        const totalSisa = tgrAktif.reduce((sum, t) => sum + t.sisa, 0);
        bagian.push(
          `${tgrAktif.length} temuan TGR dengan sisa Rp ${totalSisa.toLocaleString('id-ID')}`
        );
      }
      if (administratifAktif.length > 0) {
        bagian.push(`${administratifAktif.length} temuan administratif`);
      }
      kesimpulan = `Terdapat ${bagian.join(' dan ')} yang belum diselesaikan. SKTJM tidak dapat diterbitkan.`;
    }

    return res.json({
      success: true,
      data: {
        pihak: {
          id: pihak.id,
          nama: pihak.nama,
          nip: pihak.nip,
          nik: pihak.nik,
          jabatan: pihak.jabatan,
          instansi_perusahaan: pihak.instansi_perusahaan,
          jenis_pihak: pihak.jenis_pihak
        },
        status_sktjm: statusSKTJM,
        ringkasan: {
          total_rekomendasi: rekomendasis.length,
          temuan_tgr_aktif: tgrAktif.length,
          temuan_administratif_aktif: administratifAktif.length,
          temuan_selesai: selesai.length
        },
        temuan_aktif: {
          tgr: tgrAktif,
          administratif: administratifAktif
        },
        temuan_selesai: selesai,
        kesimpulan
      }
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

module.exports = {
  getAllPihak,
  getPihakById,
  createPihak,
  updatePihak,
  deletePihak,
  cekSKTJM
};