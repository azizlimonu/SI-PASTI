const {
  Pkpt, Penugasan, Spt, DokumenPenugasan,
  Temuan, Rekomendasi, TindakLanjut,
  BuktiTL, User, LogAktivitas, sequelize
} = require('../models');
const { Op } = require('sequelize');
const { getKeirbanFilter } = require('../middleware/auth');

// ═══════════════════════════════════════════
// DASHBOARD UTAMA
// ═══════════════════════════════════════════
const getDashboard = async (req, res) => {
  try {
    const user = req.user;
    const pkptWhere = { ...getKeirbanFilter(user) };

    // Total PKPT
    const totalPkpt = await Pkpt.count({ where: pkptWhere });
    const pkptAktif = await Pkpt.count({
      where: { ...pkptWhere, status: 'Aktif' }
    });

    // Total Penugasan
    const totalPenugasan = await Penugasan.count({
      include: [{
        model: Pkpt, as: 'pkpt',
        where: pkptWhere,
        attributes: []
      }]
    });

    const penugasanSelesai = await Penugasan.count({
      where: { status: 'Selesai' },
      include: [{
        model: Pkpt, as: 'pkpt',
        where: pkptWhere,
        attributes: []
      }]
    });

    const penugasanDalamProses = await Penugasan.count({
      where: { status: 'Dalam Proses' },
      include: [{
        model: Pkpt, as: 'pkpt',
        where: pkptWhere,
        attributes: []
      }]
    });

    // Total Dokumen
    const totalDokumen = await DokumenPenugasan.count({
      include: [{
        model: Penugasan, as: 'penugasan',
        attributes: [],
        include: [{
          model: Pkpt, as: 'pkpt',
          where: pkptWhere,
          attributes: []
        }]
      }]
    });

    // Total Temuan
    const totalTemuan = await Temuan.count({
      include: [{
        model: DokumenPenugasan, as: 'dokumen',
        attributes: [],
        include: [{
          model: Penugasan, as: 'penugasan',
          attributes: [],
          include: [{
            model: Pkpt, as: 'pkpt',
            where: pkptWhere,
            attributes: []
          }]
        }]
      }]
    });

    // Total Rekomendasi per status
    const rekomendasiStats = await Rekomendasi.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('Rekomendasi.id')), 'total']
      ],
      include: [{
        model: Temuan, as: 'temuan',
        attributes: [],
        include: [{
          model: DokumenPenugasan, as: 'dokumen',
          attributes: [],
          include: [{
            model: Penugasan, as: 'penugasan',
            attributes: [],
            include: [{
              model: Pkpt, as: 'pkpt',
              where: pkptWhere,
              attributes: []
            }]
          }]
        }]
      }],
      group: ['status'],
      raw: true
    });

    // Total nilai TGR
    const tgrStats = await Rekomendasi.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('nilai_temuan')), 'total_temuan'],
        [sequelize.fn('SUM', sequelize.col('nilai_terlunasi')), 'total_terlunasi']
      ],
      where: { adalah_tgr: true },
      include: [{
        model: Temuan, as: 'temuan',
        attributes: [],
        include: [{
          model: DokumenPenugasan, as: 'dokumen',
          attributes: [],
          include: [{
            model: Penugasan, as: 'penugasan',
            attributes: [],
            include: [{
              model: Pkpt, as: 'pkpt',
              where: pkptWhere,
              attributes: []
            }]
          }]
        }]
      }],
      raw: true
    });

    // Penugasan terbaru
    const penugasanTerbaru = await Penugasan.findAll({
      limit: 5,
      include: [{
        model: Pkpt, as: 'pkpt',
        where: pkptWhere,
        attributes: ['id', 'tahun', 'keirbanan']
      }],
      order: [['created_at', 'DESC']]
    });

    // Rekomendasi yang hampir lewat batas waktu (dalam 7 hari)
    const hariIni = new Date();
    const tujuhHariLagi = new Date();
    tujuhHariLagi.setDate(tujuhHariLagi.getDate() + 7);

    const hampirJatuhTempo = await Rekomendasi.count({
      where: {
        status: { [Op.ne]: 'Selesai' },
        batas_waktu_tl: {
          [Op.between]: [hariIni, tujuhHariLagi]
        }
      },
      include: [{
        model: Temuan, as: 'temuan',
        attributes: [],
        include: [{
          model: DokumenPenugasan, as: 'dokumen',
          attributes: [],
          include: [{
            model: Penugasan, as: 'penugasan',
            attributes: [],
            include: [{
              model: Pkpt, as: 'pkpt',
              where: pkptWhere,
              attributes: []
            }]
          }]
        }]
      }]
    });

    // Format rekomendasi stats
    const rekStats = {
      belum: 0, dalam_proses: 0, selesai: 0
    };
    rekomendasiStats.forEach(r => {
      if (r.status === 'Belum Ditindaklanjuti') rekStats.belum = parseInt(r.total);
      if (r.status === 'Dalam Proses') rekStats.dalam_proses = parseInt(r.total);
      if (r.status === 'Selesai') rekStats.selesai = parseInt(r.total);
    });

    return res.json({
      success: true,
      data: {
        pkpt: {
          total: totalPkpt,
          aktif: pkptAktif,
          selesai: totalPkpt - pkptAktif
        },
        penugasan: {
          total: totalPenugasan,
          selesai: penugasanSelesai,
          dalam_proses: penugasanDalamProses,
          belum_mulai: totalPenugasan - penugasanSelesai - penugasanDalamProses
        },
        dokumen: { total: totalDokumen },
        temuan: { total: totalTemuan },
        rekomendasi: rekStats,
        tgr: {
          total_nilai: parseFloat(tgrStats?.total_temuan || 0),
          total_terlunasi: parseFloat(tgrStats?.total_terlunasi || 0),
          sisa: parseFloat(tgrStats?.total_temuan || 0) -
            parseFloat(tgrStats?.total_terlunasi || 0)
        },
        alert: {
          hampir_jatuh_tempo: hampirJatuhTempo
        },
        penugasan_terbaru: penugasanTerbaru
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
// ALERT: SPT > 30 HARI BELUM ADA LHP
// ═══════════════════════════════════════════
const getAlertSPT = async (req, res) => {
  try {
    const user = req.user;
    const pkptWhere = { ...getKeirbanFilter(user) };

    const tigaPuluhHariLalu = new Date();
    tigaPuluhHariLalu.setDate(tigaPuluhHariLalu.getDate() - 30);

    // Cari penugasan yang:
    // 1. Sudah punya SPT dengan tanggal > 30 hari lalu
    // 2. Belum punya dokumen LHP
    const penugasanDenganSPT = await Penugasan.findAll({
      include: [
        {
          model: Pkpt, as: 'pkpt',
          where: pkptWhere,
          attributes: ['id', 'tahun', 'keirbanan']
        },
        {
          model: Spt, as: 'spt',
          where: {
            tanggal_mulai: { [Op.lte]: tigaPuluhHariLalu }
          },
          required: true
        },
        {
          model: DokumenPenugasan, as: 'dokumens',
          where: { jenis_dokumen: 'LHP' },
          required: false
        }
      ]
    });

    // Filter yang tidak punya LHP
    const alertSPT = penugasanDenganSPT
      .filter(p => !p.dokumens || p.dokumens.length === 0)
      .map(p => {
        const hariTerlambat = Math.floor(
          (new Date() - new Date(p.spt.tanggal_mulai)) / (1000 * 60 * 60 * 24)
        );
        return {
          penugasan_id: p.id,
          nama_penugasan: p.nama_penugasan,
          keirbanan: p.pkpt.keirbanan,
          tahun_pkpt: p.pkpt.tahun,
          nomor_spt: p.spt.nomor_spt,
          tanggal_spt: p.spt.tanggal_mulai,
          tanggal_mulai: p.spt.tanggal_mulai,
          tanggal_selesai: p.spt.tanggal_selesai,
          hari_terlambat: hariTerlambat
        };
      })
      .sort((a, b) => b.hari_terlambat - a.hari_terlambat);

    return res.json({
      success: true,
      total: alertSPT.length,
      data: alertSPT
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// ALERT: TL MELEWATI BATAS WAKTU
// ═══════════════════════════════════════════
const getAlertTL = async (req, res) => {
  try {
    const user = req.user;
    const pkptWhere = { ...getKeirbanFilter(user) };
    const hariIni = new Date();

    const rekomendasiTerlambat = await Rekomendasi.findAll({
      where: {
        status: { [Op.ne]: 'Selesai' },
        batas_waktu_tl: { [Op.lt]: hariIni }
      },
      include: [
        {
          model: Temuan, as: 'temuan',
          include: [{
            model: DokumenPenugasan, as: 'dokumen',
            attributes: ['id', 'judul_dokumen'],
            include: [{
              model: Penugasan, as: 'penugasan',
              attributes: ['id', 'nama_penugasan'],
              include: [{
                model: Pkpt, as: 'pkpt',
                where: pkptWhere,
                attributes: ['id', 'tahun', 'keirbanan']
              }]
            }]
          }]
        }
      ],
      order: [['batas_waktu_tl', 'ASC']]
    });

    const result = rekomendasiTerlambat.map(r => {
      const hariTerlambat = Math.floor(
        (hariIni - new Date(r.batas_waktu_tl)) / (1000 * 60 * 60 * 24)
      );
      return {
        rekomendasi_id: r.id,
        uraian_rekomendasi: r.uraian_rekomendasi,
        ditujukan_kepada: r.ditujukan_kepada,
        adalah_tgr: r.adalah_tgr,
        nilai_temuan: r.nilai_temuan,
        nilai_terlunasi: r.nilai_terlunasi,
        sisa_tgr: r.adalah_tgr
          ? parseFloat(r.nilai_temuan || 0) - parseFloat(r.nilai_terlunasi || 0)
          : null,
        batas_waktu_tl: r.batas_waktu_tl,
        hari_terlambat: hariTerlambat,
        status: r.status,
        penugasan: r.temuan.dokumen.penugasan.nama_penugasan,
        keirbanan: r.temuan.dokumen.penugasan.pkpt.keirbanan,
        tahun_pkpt: r.temuan.dokumen.penugasan.pkpt.tahun
      };
    });

    return res.json({
      success: true,
      total: result.length,
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
// PROGRESS PER KEIRBANAN (untuk inspektur)
// ═══════════════════════════════════════════
const getProgressKeirbanan = async (req, res) => {
  try {
    const { tahun } = req.query;
    const keirbanans = ['I', 'II', 'III', 'IV', 'V'];
    const pkptWhere = tahun ? { tahun } : {};

    const result = [];

    for (const kb of keirbanans) {
      // Total PKPT
      const totalPkpt = await Pkpt.count({
        where: { ...pkptWhere, keirbanan: kb }
      });

      // Total penugasan
      const totalPenugasan = await Penugasan.count({
        include: [{
          model: Pkpt, as: 'pkpt',
          where: { ...pkptWhere, keirbanan: kb },
          attributes: []
        }]
      });

      const penugasanSelesai = await Penugasan.count({
        where: { status: 'Selesai' },
        include: [{
          model: Pkpt, as: 'pkpt',
          where: { ...pkptWhere, keirbanan: kb },
          attributes: []
        }]
      });

      // Total rekomendasi
      const totalRek = await Rekomendasi.count({
        include: [{
          model: Temuan, as: 'temuan',
          attributes: [],
          include: [{
            model: DokumenPenugasan, as: 'dokumen',
            attributes: [],
            include: [{
              model: Penugasan, as: 'penugasan',
              attributes: [],
              include: [{
                model: Pkpt, as: 'pkpt',
                where: { ...pkptWhere, keirbanan: kb },
                attributes: []
              }]
            }]
          }]
        }]
      });

      const rekSelesai = await Rekomendasi.count({
        where: { status: 'Selesai' },
        include: [{
          model: Temuan, as: 'temuan',
          attributes: [],
          include: [{
            model: DokumenPenugasan, as: 'dokumen',
            attributes: [],
            include: [{
              model: Penugasan, as: 'penugasan',
              attributes: [],
              include: [{
                model: Pkpt, as: 'pkpt',
                where: { ...pkptWhere, keirbanan: kb },
                attributes: []
              }]
            }]
          }]
        }]
      });

      // Total TGR
      const tgrStats = await Rekomendasi.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('nilai_temuan')), 'total'],
          [sequelize.fn('SUM', sequelize.col('nilai_terlunasi')), 'terlunasi']
        ],
        where: { adalah_tgr: true },
        include: [{
          model: Temuan, as: 'temuan',
          attributes: [],
          include: [{
            model: DokumenPenugasan, as: 'dokumen',
            attributes: [],
            include: [{
              model: Penugasan, as: 'penugasan',
              attributes: [],
              include: [{
                model: Pkpt, as: 'pkpt',
                where: { ...pkptWhere, keirbanan: kb },
                attributes: []
              }]
            }]
          }]
        }],
        raw: true
      });

      // SPT alert
      const tigaPuluhHariLalu = new Date();
      tigaPuluhHariLalu.setDate(tigaPuluhHariLalu.getDate() - 30);

      const sptAlert = await Spt.count({
        where: { tanggal_mulai: { [Op.lte]: tigaPuluhHariLalu } },
        include: [{
          model: Penugasan, as: 'penugasan',
          attributes: [],
          include: [{
            model: Pkpt, as: 'pkpt',
            where: { ...pkptWhere, keirbanan: kb },
            attributes: []
          }]
        }]
      });

      result.push({
        keirbanan: kb,
        pkpt: { total: totalPkpt },
        penugasan: {
          total: totalPenugasan,
          selesai: penugasanSelesai,
          progress_persen: totalPenugasan > 0
            ? Math.round((penugasanSelesai / totalPenugasan) * 100)
            : 0
        },
        rekomendasi: {
          total: totalRek,
          selesai: rekSelesai,
          belum: totalRek - rekSelesai,
          progress_persen: totalRek > 0
            ? Math.round((rekSelesai / totalRek) * 100)
            : 0
        },
        tgr: {
          total_nilai: parseFloat(tgrStats?.total || 0),
          total_terlunasi: parseFloat(tgrStats?.terlunasi || 0),
          sisa: parseFloat(tgrStats?.total || 0) -
            parseFloat(tgrStats?.terlunasi || 0)
        },
        alert: { spt_belum_lhp: sptAlert }
      });
    }

    return res.json({ success: true, data: result });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// TABEL MONITORING (per penugasan, tahun berjalan)
// ═══════════════════════════════════════════
const getMonitoringTable = async (req, res) => {
  try {
    const user = req.user;
    const tahun = req.query.tahun || new Date().getFullYear();

    const pkptWhere = { ...getKeirbanFilter(user), tahun };

    const penugasanList = await Penugasan.findAll({
      include: [
        {
          model: Pkpt, as: 'pkpt',
          where: pkptWhere,
          attributes: ['id', 'tahun', 'keirbanan']
        },
        {
          model: DokumenPenugasan, as: 'dokumens',
          where: { jenis_dokumen: 'LHP' },
          required: false,
          include: [{
            model: Temuan, as: 'temuans',
            include: [{
              model: Rekomendasi, as: 'rekomendasis',
              include: [{
                model: TindakLanjut, as: 'tindakLanjuts',
                include: [{
                  model: BuktiTL, as: 'buktis',
                  through: { attributes: [] }
                }]
              }]
            }]
          }]
        }
      ],
      order: [['nama_penugasan', 'ASC']]
    });

    const data = penugasanList.map(p => {
      const temuans = (p.dokumens || []).flatMap(d => d.temuans || []);
      const rekomendasis = temuans.flatMap(t => t.rekomendasis || []);
      const tindakLanjuts = rekomendasis.flatMap(r => r.tindakLanjuts || []);
      const buktis = tindakLanjuts.flatMap(tl => tl.buktis || []);

      const statusTL = {
        selesai: rekomendasis.filter(r => r.status === 'Selesai').length,
        dalam_proses: rekomendasis.filter(r => r.status === 'Dalam Proses').length,
        belum: rekomendasis.filter(r => r.status === 'Belum Ditindaklanjuti').length
      };

      return {
        penugasan_id: p.id,
        nama_penugasan: p.nama_penugasan,
        keirbanan: p.pkpt.keirbanan,
        tahun_pkpt: p.pkpt.tahun,
        jumlah_temuan: temuans.length,
        jumlah_rekomendasi: rekomendasis.length,
        status_tindak_lanjut: statusTL,
        jumlah_tindak_lanjut: tindakLanjuts.length,
        jumlah_bukti_tl: new Set(buktis.map(b => b.id)).size
      };
    });

    return res.json({ success: true, tahun: parseInt(tahun), data });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// LOG AKTIVITAS
// ═══════════════════════════════════════════
const getLog = async (req, res) => {
  try {
    const user = req.user;
    const { keirbanan, aksi, page = 1, limit = 25 } = req.query;

    const where = {};

    // Filter keirbanan
    if (user.keirbanan !== 'ALL') {
      where.keirbanan = user.keirbanan;
    } else if (keirbanan) {
      where.keirbanan = keirbanan;
    }

    if (aksi) where.aksi = { [Op.like]: `%${aksi}%` };

    const offset = (page - 1) * limit;

    const { count, rows } = await LogAktivitas.findAndCountAll({
      where,
      include: [{
        model: User, as: 'user',
        attributes: ['id', 'nama', 'nip'],
        required: false
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.json({
      success: true,
      total: count,
      page: parseInt(page),
      total_pages: Math.ceil(count / limit),
      data: rows
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

module.exports = {
  getDashboard,
  getAlertSPT,
  getAlertTL,
  getProgressKeirbanan,
  getLog,
  getMonitoringTable
};