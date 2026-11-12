const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');
const { getKeirbanFilter } = require('../middleware/auth');

// ═══════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════
const TZ_APP = 'Asia/Makassar'; // WITA
const formatYmd = new Intl.DateTimeFormat('en-CA', { timeZone: TZ_APP });

// Tanggal (YYYY-MM-DD) menurut WITA, dengan tambahan hari
const hariIni = (tambahHari = 0) => formatYmd.format(new Date(Date.now() + tambahHari * 86400000));
// Selisih hari antara dua tanggal 'YYYY-MM-DD' (a - b)
const selisihHari = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / 86400000);
// Kolom datetime tersimpan UTC -> tanggal WITA 'YYYY-MM-DD' (dipakai di SQL)
const WITA = (kolom) => `DATE_FORMAT(CONVERT_TZ(${kolom}, '+00:00', '+08:00'), '%Y-%m-%d')`;
const num = (v) => parseFloat(v || 0);
const pembulatan = (v, desimal = 1) => Math.round(v * 10 ** desimal) / 10 ** desimal;
const persen = (bagian, total) => (total > 0 ? pembulatan((bagian / total) * 100) : 0);

const jalankan = (sql, replacements = {}) =>
  sequelize.query(sql, { replacements, type: QueryTypes.SELECT });

// Rantai join dari tiap tabel sampai pkpt (alias k) — selalu INNER JOIN
const DARI_PENUGASAN = 'FROM penugasans p JOIN pkpt k ON k.id = p.pkpt_id';
const DARI_DOKUMEN = `FROM dokumen_penugasans d
  JOIN penugasans p ON p.id = d.penugasan_id JOIN pkpt k ON k.id = p.pkpt_id`;
const DARI_TEMUAN = `FROM temuan t
  JOIN dokumen_penugasans d ON d.id = t.dokumen_penugasan_id
  JOIN penugasans p ON p.id = d.penugasan_id JOIN pkpt k ON k.id = p.pkpt_id`;
const DARI_REKOMENDASI = `FROM rekomendasis r
  JOIN temuan t ON t.id = r.temuan_id
  JOIN dokumen_penugasans d ON d.id = t.dokumen_penugasan_id
  JOIN penugasans p ON p.id = d.penugasan_id JOIN pkpt k ON k.id = p.pkpt_id`;
const DARI_TINDAK_LANJUT = `FROM tindak_lanjuts x
  JOIN rekomendasis r ON r.id = x.rekomendasi_id
  JOIN temuan t ON t.id = r.temuan_id
  JOIN dokumen_penugasans d ON d.id = t.dokumen_penugasan_id
  JOIN penugasans p ON p.id = d.penugasan_id JOIN pkpt k ON k.id = p.pkpt_id`;
const DARI_SETORAN = `FROM setoran_tgrs sg
  JOIN rekomendasis r ON r.id = sg.rekomendasi_id
  JOIN temuan t ON t.id = r.temuan_id
  JOIN dokumen_penugasans d ON d.id = t.dokumen_penugasan_id
  JOIN penugasans p ON p.id = d.penugasan_id JOIN pkpt k ON k.id = p.pkpt_id`;

// Filter standar dari query: tahun, keirbanan, sumber. Admin/irban selalu dikunci ke keirbanannya.
const buatScope = (req) => {
  const { tahun, keirbanan, sumber } = req.query;
  const syarat = [];
  const rep = {};

  const filter = getKeirbanFilter(req.user, keirbanan);
  if (filter.keirbanan) {
    syarat.push('k.keirbanan = :kb');
    rep.kb = filter.keirbanan;
  }
  const th = parseInt(tahun, 10);
  if (th) {
    syarat.push('k.tahun = :tahun');
    rep.tahun = th;
  }
  if (['PKPT', 'NON_PKPT'].includes(sumber)) {
    syarat.push('k.sumber = :sumber');
    rep.sumber = sumber;
  }
  return { sql: syarat.length ? ' AND ' + syarat.join(' AND ') : '', rep, tahun: th || null };
};

const galat = (res, e) =>
  res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + e.message });

// ═══════════════════════════════════════════
// 1. PKPT vs NON PKPT
// GET /api/monitoring/sumber?tahun=&keirbanan=
// ═══════════════════════════════════════════
const getSumber = async (req, res) => {
  try {
    const scope = buatScope(req);

    const penugasan = await jalankan(
      `SELECT k.sumber,
              COUNT(*) AS total,
              SUM(p.status = 'Selesai') AS selesai,
              SUM(p.status = 'Dalam Proses') AS dalam_proses,
              SUM(EXISTS (SELECT 1 FROM dokumen_penugasans d
                          WHERE d.penugasan_id = p.id AND d.jenis_dokumen = 'LHP')) AS ada_lhp
       ${DARI_PENUGASAN} WHERE 1=1${scope.sql} GROUP BY k.sumber`,
      scope.rep
    );
    const temuan = await jalankan(
      `SELECT k.sumber, COUNT(*) AS total ${DARI_TEMUAN} WHERE 1=1${scope.sql} GROUP BY k.sumber`,
      scope.rep
    );
    const rekomendasi = await jalankan(
      `SELECT k.sumber, r.status, COUNT(*) AS total,
              SUM(CASE WHEN r.adalah_tgr = 1 THEN r.nilai_temuan ELSE 0 END) AS tgr_total,
              SUM(CASE WHEN r.adalah_tgr = 1 THEN r.nilai_terlunasi ELSE 0 END) AS tgr_terlunasi
       ${DARI_REKOMENDASI} WHERE 1=1${scope.sql} GROUP BY k.sumber, r.status`,
      scope.rep
    );

    const kosong = () => ({
      penugasan: { total: 0, selesai: 0, dalam_proses: 0, belum_mulai: 0, ada_lhp: 0, progress_persen: 0 },
      temuan: { total: 0 },
      rekomendasi: { total: 0, belum: 0, dalam_proses: 0, selesai: 0, progress_persen: 0 },
      tgr: { total_nilai: 0, total_terlunasi: 0, sisa: 0, persen_lunas: 0 }
    });
    const data = { PKPT: kosong(), NON_PKPT: kosong() };

    penugasan.forEach((r) => {
      const d = data[r.sumber].penugasan;
      d.total = num(r.total);
      d.selesai = num(r.selesai);
      d.dalam_proses = num(r.dalam_proses);
      d.belum_mulai = d.total - d.selesai - d.dalam_proses;
      d.ada_lhp = num(r.ada_lhp);
      d.progress_persen = persen(d.selesai, d.total);
    });
    temuan.forEach((r) => { data[r.sumber].temuan.total = num(r.total); });
    rekomendasi.forEach((r) => {
      const d = data[r.sumber];
      const jml = num(r.total);
      if (r.status === 'Belum Ditindaklanjuti') d.rekomendasi.belum += jml;
      if (r.status === 'Dalam Proses') d.rekomendasi.dalam_proses += jml;
      if (r.status === 'Selesai') d.rekomendasi.selesai += jml;
      d.rekomendasi.total += jml;
      d.tgr.total_nilai += num(r.tgr_total);
      d.tgr.total_terlunasi += num(r.tgr_terlunasi);
    });
    Object.values(data).forEach((d) => {
      d.rekomendasi.progress_persen = persen(d.rekomendasi.selesai, d.rekomendasi.total);
      d.tgr.sisa = d.tgr.total_nilai - d.tgr.total_terlunasi;
      d.tgr.persen_lunas = persen(d.tgr.total_terlunasi, d.tgr.total_nilai);
    });

    return res.json({ success: true, filter: { tahun: scope.tahun }, data });
  } catch (e) {
    return galat(res, e);
  }
};

// ═══════════════════════════════════════════
// 2. PROGRESS SEMUA PENUGASAN (PKPT & NON PKPT)
// GET /api/monitoring/penugasan?tahun=&keirbanan=&sumber=&status=&lhp=ada|belum&search=&page=&limit=
// ═══════════════════════════════════════════
const getPenugasanProgress = async (req, res) => {
  try {
    const scope = buatScope(req);
    const { status, lhp, search } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);

    let syarat = scope.sql;
    const rep = { ...scope.rep };
    if (status) { syarat += ' AND p.status = :status'; rep.status = status; }
    if (search) { syarat += ' AND p.nama_penugasan LIKE :cari'; rep.cari = `%${search}%`; }
    const adaLhp = `EXISTS (SELECT 1 FROM dokumen_penugasans d2
                            WHERE d2.penugasan_id = p.id AND d2.jenis_dokumen = 'LHP')`;
    if (lhp === 'ada') syarat += ` AND ${adaLhp}`;
    if (lhp === 'belum') syarat += ` AND NOT ${adaLhp}`;

    const [{ total }] = await jalankan(
      `SELECT COUNT(*) AS total ${DARI_PENUGASAN} WHERE 1=1${syarat}`, rep
    );

    // Hitungan per penugasan lewat subquery (tanpa join berantai, jadi tidak ada baris ganda)
    const hitung = (kondisi = '') => `(SELECT COUNT(*) FROM rekomendasis r
        JOIN temuan t ON t.id = r.temuan_id
        JOIN dokumen_penugasans d ON d.id = t.dokumen_penugasan_id
        WHERE d.penugasan_id = p.id ${kondisi})`;
    const tgr = (kolom) => `(SELECT COALESCE(SUM(r.${kolom}), 0) FROM rekomendasis r
        JOIN temuan t ON t.id = r.temuan_id
        JOIN dokumen_penugasans d ON d.id = t.dokumen_penugasan_id
        WHERE d.penugasan_id = p.id AND r.adalah_tgr = 1)`;

    const rows = await jalankan(
      `SELECT p.id, p.nama_penugasan, p.jenis_penugasan, p.dasar_penugasan, p.status,
              k.sumber, k.tahun, k.keirbanan,
              (SELECT s.nomor_spt FROM spts s WHERE s.penugasan_id = p.id ORDER BY s.id LIMIT 1) AS nomor_spt,
              (SELECT DATE_FORMAT(s.tanggal_mulai, '%Y-%m-%d') FROM spts s
                WHERE s.penugasan_id = p.id ORDER BY s.id LIMIT 1) AS tanggal_spt,
              (SELECT GROUP_CONCAT(tm.nama ORDER BY tm.id SEPARATOR '; ')
                 FROM spts s JOIN tims tm ON tm.spt_id = s.id
                WHERE s.penugasan_id = p.id AND tm.jabatan_tim = 'Ketua Tim') AS ketua_tim,
              (SELECT MIN(${WITA('d.created_at')}) FROM dokumen_penugasans d
                WHERE d.penugasan_id = p.id AND d.jenis_dokumen = 'LHP') AS tanggal_lhp,
              (SELECT COUNT(*) FROM temuan t
                 JOIN dokumen_penugasans d ON d.id = t.dokumen_penugasan_id
                WHERE d.penugasan_id = p.id) AS jumlah_temuan,
              ${hitung()} AS jumlah_rekomendasi,
              ${hitung("AND r.status = 'Belum Ditindaklanjuti'")} AS rek_belum,
              ${hitung("AND r.status = 'Dalam Proses'")} AS rek_proses,
              ${hitung("AND r.status = 'Selesai'")} AS rek_selesai,
              ${tgr('nilai_temuan')} AS tgr_total,
              ${tgr('nilai_terlunasi')} AS tgr_terlunasi
       ${DARI_PENUGASAN}
       WHERE 1=1${syarat}
       ORDER BY k.tahun DESC, p.nama_penugasan ASC
       LIMIT :limit OFFSET :offset`,
      { ...rep, limit, offset: (page - 1) * limit }
    );

    const data = rows.map((r) => {
      const jmlRek = num(r.jumlah_rekomendasi);
      return {
        penugasan_id: r.id,
        nama_penugasan: r.nama_penugasan,
        jenis_penugasan: r.jenis_penugasan,
        dasar_penugasan: r.dasar_penugasan,
        status: r.status,
        sumber: r.sumber,
        tahun: r.tahun,
        keirbanan: r.keirbanan,
        nomor_spt: r.nomor_spt,
        tanggal_spt: r.tanggal_spt,
        ketua_tim: r.ketua_tim,
        ada_lhp: !!r.tanggal_lhp,
        tanggal_lhp: r.tanggal_lhp,
        hari_spt_ke_lhp: r.tanggal_lhp && r.tanggal_spt ? selisihHari(r.tanggal_lhp, r.tanggal_spt) : null,
        jumlah_temuan: num(r.jumlah_temuan),
        jumlah_rekomendasi: jmlRek,
        rekomendasi: {
          belum: num(r.rek_belum),
          dalam_proses: num(r.rek_proses),
          selesai: num(r.rek_selesai)
        },
        progress_tl_persen: persen(num(r.rek_selesai), jmlRek),
        tgr: {
          total_nilai: num(r.tgr_total),
          total_terlunasi: num(r.tgr_terlunasi),
          sisa: num(r.tgr_total) - num(r.tgr_terlunasi)
        }
      };
    });

    return res.json({
      success: true,
      data,
      pagination: {
        total: num(total),
        page,
        limit,
        total_pages: Math.ceil(num(total) / limit)
      }
    });
  } catch (e) {
    return galat(res, e);
  }
};

// ═══════════════════════════════════════════
// 3. TEMUAN PER KATEGORI & KODE
// GET /api/monitoring/temuan?tahun=&keirbanan=&sumber=
// Kategori efektif = kategori dari kode temuan, atau kategori manual.
// ═══════════════════════════════════════════
const getTemuanRingkasan = async (req, res) => {
  try {
    const scope = buatScope(req);
    const KATEGORI_EFEKTIF = 'COALESCE(j.kategori_id, t.kategori_temuan_id)';

    const kategoriMaster = await jalankan(
      `SELECT id, kode, nama, urutan FROM kategori_temuan WHERE aktif = 1 ORDER BY urutan, id`
    );
    const temuanPerKategori = await jalankan(
      `SELECT ${KATEGORI_EFEKTIF} AS kategori_id, COUNT(*) AS jumlah,
              SUM(t.jenis_temuan_id IS NOT NULL) AS berkode
       ${DARI_TEMUAN}
       LEFT JOIN jenis_temuan j ON j.id = t.jenis_temuan_id
       WHERE 1=1${scope.sql} GROUP BY ${KATEGORI_EFEKTIF}`,
      scope.rep
    );
    const rekPerKategori = await jalankan(
      `SELECT ${KATEGORI_EFEKTIF} AS kategori_id, COUNT(*) AS jumlah,
              SUM(CASE WHEN r.adalah_tgr = 1 THEN r.nilai_temuan ELSE 0 END) AS tgr_total,
              SUM(CASE WHEN r.adalah_tgr = 1 THEN r.nilai_terlunasi ELSE 0 END) AS tgr_terlunasi
       ${DARI_REKOMENDASI}
       LEFT JOIN jenis_temuan j ON j.id = t.jenis_temuan_id
       WHERE 1=1${scope.sql} GROUP BY ${KATEGORI_EFEKTIF}`,
      scope.rep
    );
    const topKode = await jalankan(
      `SELECT j.kode, j.uraian, kat.nama AS kategori, COUNT(*) AS jumlah
       ${DARI_TEMUAN}
       JOIN jenis_temuan j ON j.id = t.jenis_temuan_id
       JOIN kategori_temuan kat ON kat.id = j.kategori_id
       WHERE 1=1${scope.sql}
       GROUP BY j.id, j.kode, j.uraian, kat.nama
       ORDER BY jumlah DESC, j.kode ASC LIMIT 10`,
      scope.rep
    );
    const perKelompok = await jalankan(
      `SELECT kel.kode, kel.nama, COUNT(*) AS jumlah
       ${DARI_TEMUAN}
       JOIN jenis_temuan j ON j.id = t.jenis_temuan_id
       JOIN sub_kelompok_temuan sk ON sk.id = j.sub_kelompok_id
       JOIN kelompok_temuan kel ON kel.id = sk.kelompok_id
       WHERE 1=1${scope.sql}
       GROUP BY kel.id, kel.kode, kel.nama ORDER BY kel.urutan, kel.id`,
      scope.rep
    );

    const tem = new Map(temuanPerKategori.map((r) => [r.kategori_id, r]));
    const rek = new Map(rekPerKategori.map((r) => [r.kategori_id, r]));
    const bentuk = (kat) => {
      const t = tem.get(kat ? kat.id : null);
      const r = rek.get(kat ? kat.id : null);
      return {
        kategori_id: kat ? kat.id : null,
        kode: kat ? kat.kode : null,
        nama: kat ? kat.nama : 'Belum dikategorikan',
        jumlah_temuan: num(t?.jumlah),
        jumlah_rekomendasi: num(r?.jumlah),
        tgr_total: num(r?.tgr_total),
        tgr_terlunasi: num(r?.tgr_terlunasi)
      };
    };
    const perKategori = kategoriMaster.map(bentuk);
    const belum = bentuk(null);
    if (belum.jumlah_temuan > 0 || belum.jumlah_rekomendasi > 0) perKategori.push(belum);

    const totalTemuan = temuanPerKategori.reduce((a, r) => a + num(r.jumlah), 0);
    const berkode = temuanPerKategori.reduce((a, r) => a + num(r.berkode), 0);

    return res.json({
      success: true,
      filter: { tahun: scope.tahun },
      data: {
        ringkasan: {
          total_temuan: totalTemuan,
          berkode,
          manual: totalTemuan - berkode - belum.jumlah_temuan,
          belum_dikategorikan: belum.jumlah_temuan
        },
        per_kategori: perKategori,
        per_kelompok: perKelompok.map((r) => ({ kode: r.kode, nama: r.nama, jumlah: num(r.jumlah) })),
        top_kode: topKode.map((r) => ({ ...r, jumlah: num(r.jumlah) }))
      }
    });
  } catch (e) {
    return galat(res, e);
  }
};

// ═══════════════════════════════════════════
// 4. TGR / PIUTANG TGR PER KEIRBANAN
// GET /api/monitoring/tgr?tahun=&keirbanan=&sumber=
// Umur piutang dihitung sejak tanggal LHP (tanggal upload dokumen LHP, WITA).
// ═══════════════════════════════════════════
const getTgr = async (req, res) => {
  try {
    const scope = buatScope(req);
    const sekarang = hariIni();

    const rows = await jalankan(
      `SELECT r.id, k.keirbanan, r.pihak_id, ph.nama AS pihak_nama,
              r.nilai_temuan, r.nilai_terlunasi,
              DATE_FORMAT(r.batas_waktu_tl, '%Y-%m-%d') AS batas,
              ${WITA('d.created_at')} AS tanggal_lhp,
              (SELECT DATE_FORMAT(MAX(sg.tanggal_setor), '%Y-%m-%d') FROM setoran_tgrs sg
                WHERE sg.rekomendasi_id = r.id) AS setoran_terakhir
       ${DARI_REKOMENDASI}
       LEFT JOIN pihaks ph ON ph.id = r.pihak_id
       WHERE r.adalah_tgr = 1${scope.sql}`,
      scope.rep
    );

    const semua = ['I', 'II', 'III', 'IV', 'V'];
    const filter = getKeirbanFilter(req.user, req.query.keirbanan);
    const daftarKeirbanan = filter.keirbanan ? [filter.keirbanan] : semua;

    const barisKosong = (kb) => ({
      keirbanan: kb, jumlah_rekomendasi: 0, total_nilai: 0, total_terlunasi: 0, sisa: 0,
      persen_lunas: 0, jumlah_pihak: 0, lewat_jatuh_tempo: { jumlah: 0, nilai_sisa: 0 }
    });
    const perKb = Object.fromEntries(daftarKeirbanan.map((kb) => [kb, barisKosong(kb)]));
    const pihakPerKb = Object.fromEntries(daftarKeirbanan.map((kb) => [kb, new Set()]));

    const aging = [
      { rentang: '0-30 hari', jumlah: 0, nilai_sisa: 0 },
      { rentang: '31-90 hari', jumlah: 0, nilai_sisa: 0 },
      { rentang: '91-180 hari', jumlah: 0, nilai_sisa: 0 },
      { rentang: '> 180 hari', jumlah: 0, nilai_sisa: 0 }
    ];
    const macet = { jumlah: 0, nilai_sisa: 0 };
    const perPihak = new Map();

    rows.forEach((r) => {
      const total = num(r.nilai_temuan);
      const lunas = num(r.nilai_terlunasi);
      const sisa = Math.max(total - lunas, 0);
      const b = perKb[r.keirbanan];
      if (!b) return;

      b.jumlah_rekomendasi += 1;
      b.total_nilai += total;
      b.total_terlunasi += lunas;
      b.sisa += sisa;
      if (r.pihak_id) pihakPerKb[r.keirbanan].add(r.pihak_id);

      if (sisa <= 0) return;

      if (r.batas && r.batas < sekarang) {
        b.lewat_jatuh_tempo.jumlah += 1;
        b.lewat_jatuh_tempo.nilai_sisa += sisa;
      }

      const umur = selisihHari(sekarang, r.tanggal_lhp);
      const idx = umur <= 30 ? 0 : umur <= 90 ? 1 : umur <= 180 ? 2 : 3;
      aging[idx].jumlah += 1;
      aging[idx].nilai_sisa += sisa;

      const sejakSetor = r.setoran_terakhir ? selisihHari(sekarang, r.setoran_terakhir) : null;
      if (umur > 90 && (sejakSetor === null || sejakSetor > 90)) {
        macet.jumlah += 1;
        macet.nilai_sisa += sisa;
      }

      const namaPihak = r.pihak_nama || 'Tanpa pihak';
      const p = perPihak.get(namaPihak) || { nama: namaPihak, jumlah: 0, nilai_sisa: 0 };
      p.jumlah += 1;
      p.nilai_sisa += sisa;
      perPihak.set(namaPihak, p);
    });

    const perKeirbanan = Object.values(perKb).map((b) => ({
      ...b,
      persen_lunas: persen(b.total_terlunasi, b.total_nilai),
      jumlah_pihak: pihakPerKb[b.keirbanan].size
    }));
    const jumlahkan = (f) => perKeirbanan.reduce((a, b) => a + f(b), 0);
    const totalNilai = jumlahkan((b) => b.total_nilai);
    const totalLunas = jumlahkan((b) => b.total_terlunasi);

    return res.json({
      success: true,
      tanggal_acuan: sekarang,
      filter: { tahun: scope.tahun },
      data: {
        total: {
          jumlah_rekomendasi: jumlahkan((b) => b.jumlah_rekomendasi),
          total_nilai: totalNilai,
          total_terlunasi: totalLunas,
          sisa: jumlahkan((b) => b.sisa),
          persen_lunas: persen(totalLunas, totalNilai),
          lewat_jatuh_tempo: {
            jumlah: jumlahkan((b) => b.lewat_jatuh_tempo.jumlah),
            nilai_sisa: jumlahkan((b) => b.lewat_jatuh_tempo.nilai_sisa)
          }
        },
        per_keirbanan: perKeirbanan,
        aging,
        macet,
        top_pihak: [...perPihak.values()]
          .sort((a, b) => b.nilai_sisa - a.nilai_sisa || b.jumlah - a.jumlah)
          .slice(0, 5)
      }
    });
  } catch (e) {
    return galat(res, e);
  }
};

// ═══════════════════════════════════════════
// 5. KINERJA PENGAWASAN
// GET /api/monitoring/kinerja?tahun=&keirbanan=&sumber=
//  - lead time: hari dari tanggal mulai SPT sampai LHP pertama diunggah
//  - tepat waktu: rekomendasi Selesai yang tindak lanjut terakhirnya <= batas waktu TL
//  - pihak dengan rekomendasi terbuka terbanyak
// ═══════════════════════════════════════════
const getKinerja = async (req, res) => {
  try {
    const scope = buatScope(req);

    const leadRows = await jalankan(
      `SELECT DATE_FORMAT(s.tanggal_mulai, '%Y-%m-%d') AS tanggal_spt,
              MIN(${WITA('d.created_at')}) AS tanggal_lhp
       ${DARI_PENUGASAN}
       JOIN spts s ON s.penugasan_id = p.id
       JOIN dokumen_penugasans d ON d.penugasan_id = p.id AND d.jenis_dokumen = 'LHP'
       WHERE 1=1${scope.sql}
       GROUP BY p.id, s.id, s.tanggal_mulai`,
      scope.rep
    );
    const hari = leadRows.map((r) => selisihHari(r.tanggal_lhp, r.tanggal_spt));

    const tepatRows = await jalankan(
      `SELECT r.id, DATE_FORMAT(r.batas_waktu_tl, '%Y-%m-%d') AS batas,
              DATE_FORMAT(MAX(x.tanggal_tl), '%Y-%m-%d') AS tl_terakhir
       ${DARI_REKOMENDASI}
       JOIN tindak_lanjuts x ON x.rekomendasi_id = r.id
       WHERE r.status = 'Selesai' AND r.batas_waktu_tl IS NOT NULL${scope.sql}
       GROUP BY r.id, r.batas_waktu_tl`,
      scope.rep
    );
    const tepat = tepatRows.filter((r) => r.tl_terakhir <= r.batas).length;

    const terbuka = await jalankan(
      `SELECT COALESCE(ph.nama, 'Tanpa pihak') AS nama, COUNT(*) AS jumlah,
              SUM(CASE WHEN r.adalah_tgr = 1
                       THEN GREATEST(r.nilai_temuan - r.nilai_terlunasi, 0) ELSE 0 END) AS sisa_tgr
       ${DARI_REKOMENDASI}
       LEFT JOIN pihaks ph ON ph.id = r.pihak_id
       WHERE r.status <> 'Selesai'${scope.sql}
       GROUP BY r.pihak_id, ph.nama
       ORDER BY jumlah DESC, sisa_tgr DESC, nama ASC LIMIT 5`,
      scope.rep
    );

    return res.json({
      success: true,
      filter: { tahun: scope.tahun },
      data: {
        lead_time_spt_ke_lhp: {
          jumlah_penugasan: hari.length,
          rata_rata_hari: hari.length ? pembulatan(hari.reduce((a, b) => a + b, 0) / hari.length) : null,
          tercepat_hari: hari.length ? Math.min(...hari) : null,
          terlama_hari: hari.length ? Math.max(...hari) : null,
          lebih_dari_30_hari: hari.filter((h) => h > 30).length
        },
        tindak_lanjut_tepat_waktu: {
          rekomendasi_selesai: tepatRows.length,
          tepat_waktu: tepat,
          terlambat: tepatRows.length - tepat,
          persen_tepat_waktu: persen(tepat, tepatRows.length)
        },
        pihak_rekomendasi_terbuka: terbuka.map((r) => ({
          nama: r.nama, jumlah: num(r.jumlah), sisa_tgr: num(r.sisa_tgr)
        }))
      }
    });
  } catch (e) {
    return galat(res, e);
  }
};

// ═══════════════════════════════════════════
// 6. TREN BULANAN
// GET /api/monitoring/tren?tahun=&keirbanan=&sumber=
// Tanpa tahun: 12 bulan terakhir (WITA). Dengan tahun: Januari-Desember tahun itu.
// ═══════════════════════════════════════════
const getTren = async (req, res) => {
  try {
    const scope = buatScope(req);

    const bulanList = [];
    const sekarang = hariIni();
    if (scope.tahun) {
      for (let i = 0; i < 12; i += 1) bulanList.push(`${scope.tahun}-${String(i + 1).padStart(2, '0')}`);
    } else {
      let th = parseInt(sekarang.slice(0, 4), 10);
      let bl = parseInt(sekarang.slice(5, 7), 10);
      for (let i = 0; i < 12; i += 1) {
        bulanList.unshift(`${th}-${String(bl).padStart(2, '0')}`);
        bl -= 1;
        if (bl === 0) { bl = 12; th -= 1; }
      }
    }
    const awal = `${bulanList[0]}-01`;
    const [thAkhir, blAkhir] = bulanList[11].split('-').map(Number);
    const akhir = `${bulanList[11]}-${String(new Date(Date.UTC(thAkhir, blAkhir, 0)).getUTCDate()).padStart(2, '0')}`;
    const rep = { ...scope.rep, awal, akhir, awalDt: `${awal} 00:00:00`, akhirDt: `${akhir} 23:59:59` };

    const tl = await jalankan(
      `SELECT DATE_FORMAT(x.tanggal_tl, '%Y-%m') AS bulan, COUNT(*) AS jumlah
       ${DARI_TINDAK_LANJUT}
       WHERE x.tanggal_tl BETWEEN :awal AND :akhir${scope.sql} GROUP BY bulan`, rep
    );
    const setoran = await jalankan(
      `SELECT DATE_FORMAT(sg.tanggal_setor, '%Y-%m') AS bulan, COUNT(*) AS jumlah,
              SUM(sg.jumlah_setoran) AS nilai
       ${DARI_SETORAN}
       WHERE sg.tanggal_setor BETWEEN :awal AND :akhir${scope.sql} GROUP BY bulan`, rep
    );
    const lhp = await jalankan(
      `SELECT DATE_FORMAT(CONVERT_TZ(d.created_at, '+00:00', '+08:00'), '%Y-%m') AS bulan, COUNT(*) AS jumlah
       ${DARI_DOKUMEN}
       WHERE d.jenis_dokumen = 'LHP'
         AND CONVERT_TZ(d.created_at, '+00:00', '+08:00') BETWEEN :awalDt AND :akhirDt${scope.sql}
       GROUP BY bulan`, rep
    );

    const peta = (daftar) => new Map(daftar.map((r) => [r.bulan, r]));
    const mTl = peta(tl); const mSet = peta(setoran); const mLhp = peta(lhp);

    return res.json({
      success: true,
      filter: { tahun: scope.tahun, dari: bulanList[0], sampai: bulanList[11] },
      data: bulanList.map((b) => ({
        bulan: b,
        lhp_terbit: num(mLhp.get(b)?.jumlah),
        tindak_lanjut: num(mTl.get(b)?.jumlah),
        setoran_jumlah: num(mSet.get(b)?.jumlah),
        setoran_nilai: num(mSet.get(b)?.nilai)
      }))
    });
  } catch (e) {
    return galat(res, e);
  }
};

module.exports = {
  getSumber,
  getPenugasanProgress,
  getTemuanRingkasan,
  getTgr,
  getKinerja,
  getTren
};