const {
  Pkpt, Penugasan, Spt, DokumenPenugasan,
  Temuan, Rekomendasi, TindakLanjut,
  BuktiTL, User, LogAktivitas, sequelize
} = require('../models');
const { Op } = require('sequelize');
const { getKeirbanFilter } = require('../middleware/auth');

// ═══════════════════════════════════════════
// HELPER — rantai relasi dengan INNER JOIN di setiap tingkat.
// Tanpa `required: true` di tiap tingkat, filter keirbanan/tahun hanya menyaring
// tabel terdalam: angka membengkak dan data keirbanan lain ikut terbawa.
// (Dibuat fungsi supaya objek include selalu baru; Sequelize memodifikasi objek include.)
// ═══════════════════════════════════════════
const rantaiPenugasan = (where, detail = false) => ({
  model: Penugasan, as: 'penugasan', required: true,
  attributes: detail ? ['id', 'nama_penugasan'] : [],
  include: [{
    model: Pkpt, as: 'pkpt', where, required: true,
    attributes: detail ? ['id', 'tahun', 'keirbanan', 'sumber'] : []
  }]
});

const rantaiDokumen = (where, detail = false) => ({
  model: DokumenPenugasan, as: 'dokumen', required: true,
  attributes: detail ? ['id', 'judul_dokumen'] : [],
  include: [rantaiPenugasan(where, detail)]
});

const rantaiTemuan = (where, detail = false) => ({
  model: Temuan, as: 'temuan', required: true,
  attributes: detail ? ['id'] : [],
  include: [rantaiDokumen(where, detail)]
});

// Tanggal (YYYY-MM-DD) menurut jam server, dipakai membandingkan kolom DATE batas_waktu_tl
const tanggalLokal = (tambahHari = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + tambahHari);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Jumlah penugasan yang SPT-nya sudah > 30 hari tetapi belum punya LHP
const hitungSptBelumLhp = async (pkptWhere) => {
  const tigaPuluhHariLalu = new Date();
  tigaPuluhHariLalu.setDate(tigaPuluhHariLalu.getDate() - 30);

  const rows = await Penugasan.findAll({
    attributes: ['id'],
    include: [
      { model: Pkpt, as: 'pkpt', where: pkptWhere, attributes: [], required: true },
      {
        model: Spt, as: 'spt', attributes: [], required: true,
        where: { tanggal_mulai: { [Op.lte]: tigaPuluhHariLalu } }
      },
      {
        model: DokumenPenugasan, as: 'dokumens', attributes: ['id'], required: false,
        where: { jenis_dokumen: 'LHP' }
      }
    ]
  });
  return rows.filter((p) => !p.dokumens || p.dokumens.length === 0).length;
};

// ═══════════════════════════════════════════
// DASHBOARD UTAMA
// ═══════════════════════════════════════════
const getDashboard = async (req, res) => {
  try {
    const user = req.user;
    const { tahun, keirbanan } = req.query;
    const pkptWhere = { ...getKeirbanFilter(user, keirbanan) };
    if (tahun) pkptWhere.tahun = tahun;

    // Total PKPT (hanya PKPT sungguhan; "wadah" Non-PKPT tidak dihitung sebagai program PKPT)
    const totalPkpt = await Pkpt.count({ where: { ...pkptWhere, sumber: 'PKPT' } });
    const pkptAktif = await Pkpt.count({
      where: { ...pkptWhere, sumber: 'PKPT', status: 'Aktif' }
    });

    // Penugasan (PKPT + Non-PKPT)
    const penugasanInc = () => [
      { model: Pkpt, as: 'pkpt', where: pkptWhere, attributes: [], required: true }
    ];
    const totalPenugasan = await Penugasan.count({ include: penugasanInc() });
    const penugasanSelesai = await Penugasan.count({
      where: { status: 'Selesai' }, include: penugasanInc()
    });
    const penugasanDalamProses = await Penugasan.count({
      where: { status: 'Dalam Proses' }, include: penugasanInc()
    });

    // Total Dokumen & Temuan
    const totalDokumen = await DokumenPenugasan.count({
      include: [rantaiPenugasan(pkptWhere)]
    });
    const totalTemuan = await Temuan.count({
      include: [rantaiDokumen(pkptWhere)]
    });

    // Rekomendasi per status
    const rekomendasiStats = await Rekomendasi.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('Rekomendasi.id')), 'total']
      ],
      include: [rantaiTemuan(pkptWhere)],
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
      include: [rantaiTemuan(pkptWhere)],
      raw: true
    });

    // Penugasan terbaru
    const penugasanTerbaru = await Penugasan.findAll({
      limit: 5,
      include: [{
        model: Pkpt, as: 'pkpt', where: pkptWhere, required: true,
        attributes: ['id', 'tahun', 'keirbanan', 'sumber']
      }],
      order: [['created_at', 'DESC']]
    });

    // Rekomendasi yang hampir lewat batas waktu (dalam 7 hari ke depan, termasuk hari ini)
    const hampirJatuhTempo = await Rekomendasi.count({
      where: {
        status: { [Op.ne]: 'Selesai' },
        batas_waktu_tl: { [Op.between]: [tanggalLokal(0), tanggalLokal(7)] }
      },
      include: [rantaiTemuan(pkptWhere)]
    });

    // Format rekomendasi stats
    const rekStats = { belum: 0, dalam_proses: 0, selesai: 0 };
    rekomendasiStats.forEach((r) => {
      if (r.status === 'Belum Ditindaklanjuti') rekStats.belum = parseInt(r.total);
      if (r.status === 'Dalam Proses') rekStats.dalam_proses = parseInt(r.total);
      if (r.status === 'Selesai') rekStats.selesai = parseInt(r.total);
    });
    rekStats.total = rekStats.belum + rekStats.dalam_proses + rekStats.selesai;

    // ═══════════════════════════════════════════
    // BACKLOG — PR dari tahun-tahun SEBELUM tahun aktif
    // (hanya dihitung kalau parameter tahun dikirim, karena backlog
    // itu konsepnya relatif terhadap 1 tahun acuan)
    // ═══════════════════════════════════════════
    let backlog = null;
    if (tahun) {
      const backlogPkptWhere = {
        ...getKeirbanFilter(user, keirbanan),
        tahun: { [Op.lt]: tahun }
      };

      // Penugasan tahun lalu yang belum ada dokumen LHP sama sekali
      const penugasanBacklogRows = await Penugasan.findAll({
        attributes: ['id'],
        include: [{
          model: Pkpt, as: 'pkpt', where: backlogPkptWhere, attributes: [], required: true
        }],
        raw: true
      });
      const idsPenugasanBacklog = penugasanBacklogRows.map((p) => p.id);

      let penugasanDenganLhp = 0;
      if (idsPenugasanBacklog.length > 0) {
        const dokumenLhpRows = await DokumenPenugasan.findAll({
          attributes: [
            [sequelize.fn('DISTINCT', sequelize.col('penugasan_id')), 'penugasan_id']
          ],
          where: {
            penugasan_id: { [Op.in]: idsPenugasanBacklog },
            jenis_dokumen: 'LHP'
          },
          raw: true
        });
        penugasanDenganLhp = dokumenLhpRows.length;
      }
      const penugasanBelumLhp = idsPenugasanBacklog.length - penugasanDenganLhp;

      // Rekomendasi tahun lalu yang belum/masih proses TL
      const backlogRekStats = await Rekomendasi.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('Rekomendasi.id')), 'total']
        ],
        include: [rantaiTemuan(backlogPkptWhere)],
        group: ['status'],
        raw: true
      });
      const findStat = (status) =>
        parseInt(backlogRekStats.find((r) => r.status === status)?.total || 0);

      backlog = {
        tahun_referensi: parseInt(tahun),
        penugasan_belum_lhp: penugasanBelumLhp,
        rekomendasi_belum_tl: findStat('Belum Ditindaklanjuti'),
        rekomendasi_proses_tl: findStat('Dalam Proses')
      };
    }

    // Breakdown rekomendasi Administratif vs TGR
    const rekomendasiJenisRaw = await Rekomendasi.findAll({
      attributes: [
        'adalah_tgr',
        [sequelize.fn('COUNT', sequelize.col('Rekomendasi.id')), 'total']
      ],
      include: [rantaiTemuan(pkptWhere)],
      group: ['adalah_tgr'],
      raw: true
    });
    const rekJenis = { administratif: 0, tgr: 0 };
    rekomendasiJenisRaw.forEach((r) => {
      const jml = parseInt(r.total);
      if (r.adalah_tgr) rekJenis.tgr = jml; else rekJenis.administratif = jml;
    });

    // Progress Bukti TL (persentase rekomendasi yang sudah ada bukti TL diterima)
    const rekomendasiBuktiRaw = await Rekomendasi.findAll({
      attributes: ['id'],
      include: [
        rantaiTemuan(pkptWhere),
        {
          model: TindakLanjut, as: 'tindakLanjuts',
          attributes: ['id', 'status_penerimaan'],
          include: [{
            model: BuktiTL, as: 'buktis',
            attributes: ['id'],
            through: { attributes: [] }
          }]
        }
      ]
    });
    const totalRekBukti = rekomendasiBuktiRaw.length;
    const rekAdaBukti = rekomendasiBuktiRaw.filter((r) =>
      (r.tindakLanjuts || []).some(
        (tl) => tl.status_penerimaan === 'Diterima' && tl.buktis && tl.buktis.length > 0
      )
    ).length;
    const buktiTlProgress = {
      total: totalRekBukti,
      ada_bukti: rekAdaBukti,
      persen: totalRekBukti > 0 ? Math.round((rekAdaBukti / totalRekBukti) * 100) : 0
    };

    return res.json({
      success: true,
      data: {
        filter: {
          tahun: tahun ? parseInt(tahun) : null,
          keirbanan: pkptWhere.keirbanan || 'ALL'
        },
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
        backlog,
        rekomendasi_jenis: rekJenis,
        bukti_tl_progress: buktiTlProgress,
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
    const { tahun, keirbanan } = req.query;
    const pkptWhere = { ...getKeirbanFilter(user, keirbanan) };
    if (tahun) pkptWhere.tahun = tahun;

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
    const { tahun, keirbanan } = req.query;
    const pkptWhere = { ...getKeirbanFilter(user, keirbanan) };
    if (tahun) pkptWhere.tahun = tahun;
    const hariIni = new Date();

    const mapItem = (r) => ({
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
      status: r.status,
      penugasan: r.temuan.dokumen.penugasan.nama_penugasan,
      keirbanan: r.temuan.dokumen.penugasan.pkpt.keirbanan,
      tahun_pkpt: r.temuan.dokumen.penugasan.pkpt.tahun,
      sumber: r.temuan.dokumen.penugasan.pkpt.sumber
    });

    // Sudah terlambat (batas waktu sebelum hari ini)
    const rekomendasiTerlambat = await Rekomendasi.findAll({
      where: {
        status: { [Op.ne]: 'Selesai' },
        batas_waktu_tl: { [Op.lt]: tanggalLokal(0) }
      },
      include: [rantaiTemuan(pkptWhere, true)],
      order: [['batas_waktu_tl', 'ASC']]
    });

    const terlambat = rekomendasiTerlambat.map((r) => ({
      ...mapItem(r),
      hari_terlambat: Math.floor((hariIni - new Date(r.batas_waktu_tl)) / (1000 * 60 * 60 * 24))
    }));

    // Akan jatuh tempo (H-3, termasuk hari ini)
    const rekomendasiAkanJatuhTempo = await Rekomendasi.findAll({
      where: {
        status: { [Op.ne]: 'Selesai' },
        batas_waktu_tl: { [Op.between]: [tanggalLokal(0), tanggalLokal(3)] }
      },
      include: [rantaiTemuan(pkptWhere, true)],
      order: [['batas_waktu_tl', 'ASC']]
    });

    const akanJatuhTempo = rekomendasiAkanJatuhTempo.map((r) => ({
      ...mapItem(r),
      hari_tersisa: Math.ceil((new Date(r.batas_waktu_tl) - hariIni) / (1000 * 60 * 60 * 24))
    }));

    return res.json({
      success: true,
      total: terlambat.length,
      data: terlambat,
      total_akan_jatuh_tempo: akanJatuhTempo.length,
      akan_jatuh_tempo: akanJatuhTempo
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
    const user = req.user;
    const { tahun } = req.query;
    const semuaKeirbanan = ['I', 'II', 'III', 'IV', 'V'];
    // Admin/irban hanya melihat keirbanannya sendiri; superadmin/inspektur/tim TL melihat semua
    const keirbanans = user.keirbanan === 'ALL'
      ? semuaKeirbanan
      : semuaKeirbanan.filter((k) => k === user.keirbanan);
    const pkptWhere = tahun ? { tahun } : {};

    const result = [];

    for (const kb of keirbanans) {
      const where = { ...pkptWhere, keirbanan: kb };
      const penugasanInc = () => [
        { model: Pkpt, as: 'pkpt', where, attributes: [], required: true }
      ];

      // Total PKPT (hanya PKPT sungguhan)
      const totalPkpt = await Pkpt.count({ where: { ...where, sumber: 'PKPT' } });

      // Penugasan (PKPT + Non-PKPT)
      const totalPenugasan = await Penugasan.count({ include: penugasanInc() });
      const penugasanSelesai = await Penugasan.count({
        where: { status: 'Selesai' }, include: penugasanInc()
      });

      // Rekomendasi
      const totalRek = await Rekomendasi.count({ include: [rantaiTemuan(where)] });
      const rekSelesai = await Rekomendasi.count({
        where: { status: 'Selesai' },
        include: [rantaiTemuan(where)]
      });

      // TGR
      const tgrStats = await Rekomendasi.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('nilai_temuan')), 'total'],
          [sequelize.fn('SUM', sequelize.col('nilai_terlunasi')), 'terlunasi']
        ],
        where: { adalah_tgr: true },
        include: [rantaiTemuan(where)],
        raw: true
      });

      // SPT > 30 hari yang belum ada LHP
      const sptAlert = await hitungSptBelumLhp(where);

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
        ada_lhp: (p.dokumens || []).length > 0,
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
    const { keirbanan, aksi, bagian, page = 1, limit = 25 } = req.query;

    const where = {};
    const userInclude = {
      model: User, as: 'user',
      attributes: ['id', 'nama', 'nip', 'role'],
      required: false
    };

    // Filter keirbanan
    // Filter keirbanan — admin/irban SELALU dikunci ke keirbanan sendiri,
    // parameter apa pun dari query (keirbanan/bagian) diabaikan untuk mereka.
    if (user.keirbanan !== 'ALL') {
      where.keirbanan = user.keirbanan;
    } else {
      if (keirbanan) where.keirbanan = keirbanan;

      // Filter bagian: I/II/III/IV/V (keirbanan), TL (admin_tl), atau PUSAT
      // (superadmin/inspektur) — HANYA berlaku untuk user ber-akses ALL.
      if (bagian) {
        if (['I', 'II', 'III', 'IV', 'V'].includes(bagian)) {
          where.keirbanan = bagian;
        } else if (bagian === 'TL') {
          where.keirbanan = 'ALL';
          userInclude.where = { role: 'admin_tl' };
          userInclude.required = true;
        } else if (bagian === 'PUSAT') {
          where.keirbanan = 'ALL';
          userInclude.where = { role: { [Op.in]: ['superadmin', 'inspektur'] } };
          userInclude.required = true;
        }
      }
    }

    if (aksi) where.aksi = { [Op.like]: `%${aksi}%` };

    const offset = (page - 1) * limit;

    const { count, rows } = await LogAktivitas.findAndCountAll({
      where,
      include: [userInclude],
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