const ExcelJS = require('exceljs');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');
const { getKeirbanFilter } = require('../middleware/auth');
const writeLog = require('../utils/writelog');

// ═══════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════
const TZ_APP = 'Asia/Makassar'; // WITA
const formatYmd = new Intl.DateTimeFormat('en-CA', { timeZone: TZ_APP });

const hariIni = () => formatYmd.format(new Date());
const selisihHari = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / 86400000);
// Kolom datetime tersimpan UTC -> tanggal WITA 'YYYY-MM-DD' (dipakai di SQL)
const WITA = (kolom) => `DATE_FORMAT(CONVERT_TZ(${kolom}, '+00:00', '+08:00'), '%Y-%m-%d')`;
const num = (v) => parseFloat(v || 0);
// 'YYYY-MM-DD' -> Date (tengah malam UTC) supaya tampil sebagai tanggal yang sama di Excel
const tgl = (v) => (v ? new Date(`${v}T00:00:00Z`) : null);

const jalankan = (sql, replacements = {}) =>
  sequelize.query(sql, { replacements, type: QueryTypes.SELECT });

// Filter standar: tahun, keirbanan, sumber. Admin/irban selalu dikunci ke keirbanannya sendiri.
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
  return {
    sql: syarat.length ? ' AND ' + syarat.join(' AND ') : '',
    rep,
    tahun: th || null,
    keirbanan: filter.keirbanan || null,
    sumber: rep.sumber || null
  };
};

const WARNA = {
  penugasan: 'FF1E40AF',
  spt: 'FF0F766E',
  temuan: 'FFB45309',
  rekomendasi: 'FF6D28D9',
  tindakLanjut: 'FF047857',
  bukti: 'FF475569',
  tgr: 'FF1E40AF'
};
const FORMAT_RUPIAH = '"Rp" #,##0';
const FORMAT_TANGGAL = 'dd/mm/yyyy';

// Pasang header berwarna per kelompok kolom, filter, dan pembeku baris judul.
const rapikanSheet = (sheet, kolom) => {
  sheet.columns = kolom.map((k) => ({ header: k.header, key: k.key, width: k.lebar }));
  const header = sheet.getRow(1);
  header.height = 34;
  header.eachCell((cell, nomor) => {
    const k = kolom[nomor - 1];
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WARNA[k.kelompok] } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } } };
  });
  kolom.forEach((k, i) => {
    const col = sheet.getColumn(i + 1);
    if (k.tipe === 'rupiah') col.numFmt = FORMAT_RUPIAH;
    if (k.tipe === 'tanggal') col.numFmt = FORMAT_TANGGAL;
    if (k.tipe === 'persen') col.numFmt = '0.0%';
  });
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: kolom.length } };
};

const gayaIsi = (sheet, kolom, dariBaris) => {
  for (let r = dariBaris; r <= sheet.rowCount; r += 1) {
    const baris = sheet.getRow(r);
    kolom.forEach((k, i) => {
      const cell = baris.getCell(i + 1);
      cell.alignment = {
        vertical: 'top',
        wrapText: !!k.bungkus,
        horizontal: k.tipe === 'rupiah' ? 'right' : undefined
      };
    });
  }
};

// ═══════════════════════════════════════════
// SHEET 1 — PENUGASAN (satu tabel: penugasan, SPT + tim, temuan, rekomendasi,
// tindak lanjut, bukti TL). Link/berkas file TIDAK disertakan.
// Satu baris per bukti TL; kalau suatu tingkat tidak punya data di bawahnya,
// barisnya tetap muncul dengan kolom di bawahnya kosong.
// ═══════════════════════════════════════════
const KOLOM_PENUGASAN = [
  { key: 'tahun', header: 'Tahun', lebar: 8, kelompok: 'penugasan' },
  { key: 'keirbanan', header: 'Keirbanan', lebar: 11, kelompok: 'penugasan' },
  { key: 'sumber', header: 'Sumber', lebar: 11, kelompok: 'penugasan' },
  { key: 'dasar_penugasan', header: 'Dasar Penugasan', lebar: 22, kelompok: 'penugasan', bungkus: true },
  { key: 'jenis_penugasan', header: 'Jenis Penugasan', lebar: 16, kelompok: 'penugasan' },
  { key: 'nama_penugasan', header: 'Nama Penugasan', lebar: 40, kelompok: 'penugasan', bungkus: true },
  { key: 'status_penugasan', header: 'Status Penugasan', lebar: 15, kelompok: 'penugasan' },
  { key: 'penugasan_mulai', header: 'Tanggal Mulai Penugasan', lebar: 14, kelompok: 'penugasan', tipe: 'tanggal' },
  { key: 'penugasan_selesai', header: 'Tanggal Selesai Penugasan', lebar: 14, kelompok: 'penugasan', tipe: 'tanggal' },
  { key: 'tanggal_lhp', header: 'Tanggal LHP', lebar: 13, kelompok: 'penugasan', tipe: 'tanggal' },

  { key: 'nomor_spt', header: 'Nomor SPT', lebar: 26, kelompok: 'spt' },
  { key: 'jenis_kegiatan', header: 'Jenis Kegiatan SPT', lebar: 20, kelompok: 'spt', bungkus: true },
  { key: 'uraian_kegiatan', header: 'Uraian Kegiatan', lebar: 28, kelompok: 'spt', bungkus: true },
  { key: 'spt_mulai', header: 'Tanggal Mulai SPT', lebar: 14, kelompok: 'spt', tipe: 'tanggal' },
  { key: 'spt_selesai', header: 'Tanggal Selesai SPT', lebar: 14, kelompok: 'spt', tipe: 'tanggal' },
  { key: 'jumlah_hari', header: 'Jumlah Hari SPT', lebar: 10, kelompok: 'spt' },
  { key: 'ketua_tim', header: 'Ketua Tim', lebar: 24, kelompok: 'spt', bungkus: true },
  { key: 'tim_spt', header: 'Tim SPT (Nama dan Jabatan, dipisah ";")', lebar: 48, kelompok: 'spt', bungkus: true },

  { key: 'kode_temuan', header: 'Kode Temuan', lebar: 12, kelompok: 'temuan' },
  { key: 'kategori_temuan', header: 'Kategori Temuan', lebar: 26, kelompok: 'temuan', bungkus: true },
  { key: 'judul_temuan', header: 'Judul Temuan', lebar: 36, kelompok: 'temuan', bungkus: true },
  { key: 'uraian_temuan', header: 'Uraian Temuan', lebar: 50, kelompok: 'temuan', bungkus: true },

  { key: 'uraian_rekomendasi', header: 'Uraian Rekomendasi', lebar: 50, kelompok: 'rekomendasi', bungkus: true },
  { key: 'ditujukan_kepada', header: 'Ditujukan Kepada', lebar: 26, kelompok: 'rekomendasi', bungkus: true },
  { key: 'pihak', header: 'Pihak Terkait', lebar: 24, kelompok: 'rekomendasi', bungkus: true },
  { key: 'jenis_rekomendasi', header: 'Jenis Rekomendasi', lebar: 15, kelompok: 'rekomendasi' },
  { key: 'nilai_tgr', header: 'Nilai TGR (Rp)', lebar: 18, kelompok: 'rekomendasi', tipe: 'rupiah' },
  { key: 'terlunasi', header: 'Terlunasi (Rp)', lebar: 18, kelompok: 'rekomendasi', tipe: 'rupiah' },
  { key: 'sisa', header: 'Sisa TGR (Rp)', lebar: 18, kelompok: 'rekomendasi', tipe: 'rupiah' },
  { key: 'batas_tl', header: 'Batas Waktu TL', lebar: 14, kelompok: 'rekomendasi', tipe: 'tanggal' },
  { key: 'status_rekomendasi', header: 'Status Rekomendasi', lebar: 22, kelompok: 'rekomendasi' },

  { key: 'uraian_tl', header: 'Uraian Tindak Lanjut', lebar: 50, kelompok: 'tindakLanjut', bungkus: true },
  { key: 'tanggal_tl', header: 'Tanggal TL', lebar: 13, kelompok: 'tindakLanjut', tipe: 'tanggal' },
  { key: 'status_penerimaan', header: 'Status Penerimaan TL', lebar: 20, kelompok: 'tindakLanjut' },

  { key: 'judul_bukti', header: 'Judul Bukti TL', lebar: 34, kelompok: 'bukti', bungkus: true },
  { key: 'keterangan_bukti', header: 'Keterangan Bukti TL', lebar: 34, kelompok: 'bukti', bungkus: true }
];

const ambilPenugasan = (scope) =>
  jalankan(
    `SELECT k.tahun, k.keirbanan, k.sumber, p.dasar_penugasan, p.jenis_penugasan,
            p.nama_penugasan, p.status AS status_penugasan,
            DATE_FORMAT(p.tanggal_mulai, '%Y-%m-%d') AS penugasan_mulai,
            DATE_FORMAT(p.tanggal_selesai, '%Y-%m-%d') AS penugasan_selesai,
            (SELECT MIN(${WITA('d2.created_at')}) FROM dokumen_penugasans d2
              WHERE d2.penugasan_id = p.id AND d2.jenis_dokumen = 'LHP') AS tanggal_lhp,
            s.nomor_spt, s.jenis_kegiatan, s.jenis_kegiatan_lainnya, s.uraian_kegiatan,
            DATE_FORMAT(s.tanggal_mulai, '%Y-%m-%d') AS spt_mulai,
            DATE_FORMAT(s.tanggal_selesai, '%Y-%m-%d') AS spt_selesai,
            s.jumlah_hari,
            (SELECT GROUP_CONCAT(tm.nama ORDER BY tm.id SEPARATOR '; ')
               FROM tims tm WHERE tm.spt_id = s.id AND tm.jabatan_tim = 'Ketua Tim') AS ketua_tim,
            (SELECT GROUP_CONCAT(CONCAT(tm.nama, ' (', tm.jabatan_tim, ')') ORDER BY tm.id SEPARATOR '; ')
               FROM tims tm WHERE tm.spt_id = s.id) AS tim_spt,
            j.kode AS kode_temuan, kat.nama AS kategori_temuan, t.judul_temuan, t.uraian_temuan,
            r.uraian_rekomendasi, r.ditujukan_kepada, ph.nama AS pihak, r.adalah_tgr,
            r.nilai_temuan, r.nilai_terlunasi,
            DATE_FORMAT(r.batas_waktu_tl, '%Y-%m-%d') AS batas_tl, r.status AS status_rekomendasi,
            x.uraian_tl, DATE_FORMAT(x.tanggal_tl, '%Y-%m-%d') AS tanggal_tl, x.status_penerimaan,
            b.judul_bukti, b.keterangan AS keterangan_bukti
     FROM penugasans p
     JOIN pkpt k ON k.id = p.pkpt_id
     LEFT JOIN spts s ON s.id = (SELECT MIN(s2.id) FROM spts s2 WHERE s2.penugasan_id = p.id)
     LEFT JOIN temuan t ON t.dokumen_penugasan_id IN
          (SELECT d3.id FROM dokumen_penugasans d3 WHERE d3.penugasan_id = p.id)
     LEFT JOIN jenis_temuan j ON j.id = t.jenis_temuan_id
     LEFT JOIN kategori_temuan kat ON kat.id = COALESCE(j.kategori_id, t.kategori_temuan_id)
     LEFT JOIN rekomendasis r ON r.temuan_id = t.id
     LEFT JOIN pihaks ph ON ph.id = r.pihak_id
     LEFT JOIN tindak_lanjuts x ON x.rekomendasi_id = r.id
     LEFT JOIN tindak_lanjut_buktis xb ON xb.tindak_lanjut_id = x.id
     LEFT JOIN bukti_tl b ON b.id = xb.bukti_id
     WHERE 1=1${scope.sql}
     ORDER BY k.tahun DESC, k.keirbanan ASC, p.nama_penugasan ASC, p.id ASC,
              t.id ASC, r.id ASC, x.tanggal_tl ASC, x.id ASC, b.id ASC`,
    scope.rep
  );

const isiSheetPenugasan = (workbook, rows) => {
  const sheet = workbook.addWorksheet('Penugasan');
  rapikanSheet(sheet, KOLOM_PENUGASAN);

  rows.forEach((r) => {
    const adaRek = r.uraian_rekomendasi !== null;
    const tgr = adaRek && r.adalah_tgr ? num(r.nilai_temuan) : null;
    const lunas = adaRek && r.adalah_tgr ? num(r.nilai_terlunasi) : null;
    sheet.addRow({
      tahun: r.tahun,
      keirbanan: r.keirbanan,
      sumber: r.sumber === 'NON_PKPT' ? 'Non-PKPT' : 'PKPT',
      dasar_penugasan: r.dasar_penugasan,
      jenis_penugasan: r.jenis_penugasan,
      nama_penugasan: r.nama_penugasan,
      status_penugasan: r.status_penugasan,
      penugasan_mulai: tgl(r.penugasan_mulai),
      penugasan_selesai: tgl(r.penugasan_selesai),
      tanggal_lhp: tgl(r.tanggal_lhp),
      nomor_spt: r.nomor_spt,
      jenis_kegiatan: r.jenis_kegiatan
        ? (r.jenis_kegiatan_lainnya ? `${r.jenis_kegiatan} (${r.jenis_kegiatan_lainnya})` : r.jenis_kegiatan)
        : null,
      uraian_kegiatan: r.uraian_kegiatan,
      spt_mulai: tgl(r.spt_mulai),
      spt_selesai: tgl(r.spt_selesai),
      jumlah_hari: r.jumlah_hari,
      ketua_tim: r.ketua_tim,
      tim_spt: r.tim_spt,
      kode_temuan: r.kode_temuan,
      kategori_temuan: r.kategori_temuan,
      judul_temuan: r.judul_temuan,
      uraian_temuan: r.uraian_temuan,
      uraian_rekomendasi: r.uraian_rekomendasi,
      ditujukan_kepada: r.ditujukan_kepada,
      pihak: r.pihak,
      jenis_rekomendasi: adaRek ? (r.adalah_tgr ? 'TGR' : 'Administratif') : null,
      nilai_tgr: tgr,
      terlunasi: lunas,
      sisa: tgr === null ? null : Math.max(tgr - lunas, 0),
      batas_tl: tgl(r.batas_tl),
      status_rekomendasi: r.status_rekomendasi,
      uraian_tl: r.uraian_tl,
      tanggal_tl: tgl(r.tanggal_tl),
      status_penerimaan: r.status_penerimaan,
      judul_bukti: r.judul_bukti,
      keterangan_bukti: r.keterangan_bukti
    });
  });
  gayaIsi(sheet, KOLOM_PENUGASAN, 2);
};

// ═══════════════════════════════════════════
// SHEET 2 — PIUTANG TGR (satu baris per rekomendasi TGR)
// Umur piutang dihitung sejak tanggal LHP (WITA). Piutang macet: sisa > 0, umur > 90 hari,
// dan tidak ada setoran dalam 90 hari terakhir.
// ═══════════════════════════════════════════
const KOLOM_TGR = [
  { key: 'no', header: 'No', lebar: 6, kelompok: 'tgr' },
  { key: 'tahun', header: 'Tahun', lebar: 8, kelompok: 'tgr' },
  { key: 'keirbanan', header: 'Keirbanan', lebar: 11, kelompok: 'tgr' },
  { key: 'sumber', header: 'Sumber', lebar: 11, kelompok: 'tgr' },
  { key: 'nama_penugasan', header: 'Nama Penugasan', lebar: 40, kelompok: 'tgr', bungkus: true },
  { key: 'jenis_penugasan', header: 'Jenis Penugasan', lebar: 16, kelompok: 'tgr' },
  { key: 'kode_temuan', header: 'Kode Temuan', lebar: 12, kelompok: 'tgr' },
  { key: 'judul_temuan', header: 'Judul Temuan', lebar: 36, kelompok: 'tgr', bungkus: true },
  { key: 'kategori_temuan', header: 'Kategori Temuan', lebar: 26, kelompok: 'tgr', bungkus: true },
  { key: 'uraian_rekomendasi', header: 'Uraian Rekomendasi', lebar: 46, kelompok: 'tgr', bungkus: true },
  { key: 'pihak', header: 'Pihak Terkait', lebar: 26, kelompok: 'tgr', bungkus: true },
  { key: 'jenis_pihak', header: 'Jenis Pihak', lebar: 14, kelompok: 'tgr' },
  { key: 'instansi', header: 'Instansi / Perusahaan', lebar: 28, kelompok: 'tgr', bungkus: true },
  { key: 'ditujukan_kepada', header: 'Ditujukan Kepada', lebar: 26, kelompok: 'tgr', bungkus: true },
  { key: 'nilai_tgr', header: 'Nilai TGR (Rp)', lebar: 18, kelompok: 'tgr', tipe: 'rupiah' },
  { key: 'terlunasi', header: 'Terlunasi (Rp)', lebar: 18, kelompok: 'tgr', tipe: 'rupiah' },
  { key: 'sisa', header: 'Sisa Piutang (Rp)', lebar: 18, kelompok: 'tgr', tipe: 'rupiah' },
  { key: 'persen_lunas', header: '% Lunas', lebar: 9, kelompok: 'tgr', tipe: 'persen' },
  { key: 'status_piutang', header: 'Status Piutang', lebar: 15, kelompok: 'tgr' },
  { key: 'tanggal_lhp', header: 'Tanggal LHP', lebar: 13, kelompok: 'tgr', tipe: 'tanggal' },
  { key: 'umur_hari', header: 'Umur Piutang (hari)', lebar: 12, kelompok: 'tgr' },
  { key: 'batas_tl', header: 'Batas Waktu TL', lebar: 14, kelompok: 'tgr', tipe: 'tanggal' },
  { key: 'lewat_jatuh_tempo', header: 'Lewat Jatuh Tempo', lebar: 12, kelompok: 'tgr' },
  { key: 'jumlah_setoran', header: 'Jumlah Setoran (kali)', lebar: 12, kelompok: 'tgr' },
  { key: 'setoran_terakhir', header: 'Setoran Terakhir', lebar: 13, kelompok: 'tgr', tipe: 'tanggal' },
  { key: 'macet', header: 'Piutang Macet', lebar: 11, kelompok: 'tgr' },
  { key: 'status_rekomendasi', header: 'Status Rekomendasi', lebar: 22, kelompok: 'tgr' }
];

const ambilTgr = (scope) =>
  jalankan(
    `SELECT k.tahun, k.keirbanan, k.sumber, p.nama_penugasan, p.jenis_penugasan,
            j.kode AS kode_temuan, t.judul_temuan, kat.nama AS kategori_temuan,
            r.uraian_rekomendasi, ph.nama AS pihak, ph.jenis_pihak,
            ph.instansi_perusahaan AS instansi, r.ditujukan_kepada,
            r.nilai_temuan, r.nilai_terlunasi,
            DATE_FORMAT(r.batas_waktu_tl, '%Y-%m-%d') AS batas_tl, r.status AS status_rekomendasi,
            ${WITA('d.created_at')} AS tanggal_lhp,
            (SELECT COUNT(*) FROM setoran_tgrs sg WHERE sg.rekomendasi_id = r.id) AS jumlah_setoran,
            (SELECT DATE_FORMAT(MAX(sg.tanggal_setor), '%Y-%m-%d') FROM setoran_tgrs sg
              WHERE sg.rekomendasi_id = r.id) AS setoran_terakhir
     FROM rekomendasis r
     JOIN temuan t ON t.id = r.temuan_id
     JOIN dokumen_penugasans d ON d.id = t.dokumen_penugasan_id
     JOIN penugasans p ON p.id = d.penugasan_id
     JOIN pkpt k ON k.id = p.pkpt_id
     LEFT JOIN jenis_temuan j ON j.id = t.jenis_temuan_id
     LEFT JOIN kategori_temuan kat ON kat.id = COALESCE(j.kategori_id, t.kategori_temuan_id)
     LEFT JOIN pihaks ph ON ph.id = r.pihak_id
     WHERE r.adalah_tgr = 1${scope.sql}
     ORDER BY k.tahun DESC, k.keirbanan ASC, p.nama_penugasan ASC, r.id ASC`,
    scope.rep
  );

const isiSheetTgr = (workbook, rows, sekarang) => {
  const sheet = workbook.addWorksheet('Piutang TGR');
  rapikanSheet(sheet, KOLOM_TGR);

  let totalNilai = 0;
  let totalLunas = 0;
  let totalSisa = 0;

  rows.forEach((r, i) => {
    const nilai = num(r.nilai_temuan);
    const lunas = num(r.nilai_terlunasi);
    const sisa = Math.max(nilai - lunas, 0);
    const umur = selisihHari(sekarang, r.tanggal_lhp);
    const sejakSetor = r.setoran_terakhir ? selisihHari(sekarang, r.setoran_terakhir) : null;
    const lewat = sisa > 0 && r.batas_tl && r.batas_tl < sekarang;
    const macet = sisa > 0 && umur > 90 && (sejakSetor === null || sejakSetor > 90);

    totalNilai += nilai;
    totalLunas += lunas;
    totalSisa += sisa;

    sheet.addRow({
      no: i + 1,
      tahun: r.tahun,
      keirbanan: r.keirbanan,
      sumber: r.sumber === 'NON_PKPT' ? 'Non-PKPT' : 'PKPT',
      nama_penugasan: r.nama_penugasan,
      jenis_penugasan: r.jenis_penugasan,
      kode_temuan: r.kode_temuan,
      judul_temuan: r.judul_temuan,
      kategori_temuan: r.kategori_temuan,
      uraian_rekomendasi: r.uraian_rekomendasi,
      pihak: r.pihak,
      jenis_pihak: r.jenis_pihak,
      instansi: r.instansi,
      ditujukan_kepada: r.ditujukan_kepada,
      nilai_tgr: nilai,
      terlunasi: lunas,
      sisa,
      persen_lunas: nilai > 0 ? Math.round((lunas / nilai) * 1000) / 1000 : 0,
      status_piutang: sisa <= 0 ? 'Lunas' : lunas > 0 ? 'Mencicil' : 'Belum dibayar',
      tanggal_lhp: tgl(r.tanggal_lhp),
      umur_hari: sisa > 0 ? umur : null,
      batas_tl: tgl(r.batas_tl),
      lewat_jatuh_tempo: sisa > 0 ? (lewat ? 'Ya' : 'Tidak') : null,
      jumlah_setoran: num(r.jumlah_setoran),
      setoran_terakhir: tgl(r.setoran_terakhir),
      macet: sisa > 0 ? (macet ? 'Ya' : 'Tidak') : null,
      status_rekomendasi: r.status_rekomendasi
    });
  });
  gayaIsi(sheet, KOLOM_TGR, 2);

  // Baris total (rumus SUM, nilainya juga disimpan supaya langsung tampil)
  if (rows.length) {
    const akhir = rows.length + 1;
    const kolomHuruf = (key) => sheet.getColumn(KOLOM_TGR.findIndex((k) => k.key === key) + 1).letter;
    const total = sheet.addRow({ no: 'TOTAL' });
    [['nilai_tgr', totalNilai], ['terlunasi', totalLunas], ['sisa', totalSisa]].forEach(([key, nilai]) => {
      const huruf = kolomHuruf(key);
      const cell = total.getCell(KOLOM_TGR.findIndex((k) => k.key === key) + 1);
      cell.value = { formula: `SUM(${huruf}2:${huruf}${akhir})`, result: nilai };
    });
    total.font = { bold: true };
    total.eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      cell.border = { top: { style: 'thin' } };
    });
  }
};

// ═══════════════════════════════════════════
// GET /api/export/excel?tahun=&keirbanan=&sumber=
// Satu file, dua sheet: "Penugasan" dan "Piutang TGR". Sesuai scope pengguna.
// ═══════════════════════════════════════════
const exportExcel = async (req, res) => {
  try {
    const scope = buatScope(req);
    const sekarang = hariIni();

    const [barisPenugasan, barisTgr] = await Promise.all([ambilPenugasan(scope), ambilTgr(scope)]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SI-PASTI';
    workbook.created = new Date();
    // Excel menghitung ulang rumus (baris TOTAL) saat file dibuka
    workbook.calcProperties.fullCalcOnLoad = true;
    isiSheetPenugasan(workbook, barisPenugasan);
    isiSheetTgr(workbook, barisTgr, sekarang);

    const labelKb = scope.keirbanan ? `Keirbanan-${scope.keirbanan}` : 'Semua-Keirbanan';
    const labelTh = scope.tahun ? `${scope.tahun}` : 'Semua-Tahun';
    const nama = `SI-PASTI_${labelKb}_${labelTh}_${sekarang.replace(/-/g, '')}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nama}"`);
    await workbook.xlsx.write(res);
    res.end();

    writeLog(
      req.user.id,
      req.user.nama,
      'Ekspor Excel',
      'Ekspor',
      `Penugasan (${barisPenugasan.length} baris), Piutang TGR (${barisTgr.length} baris) — ${labelKb}, ${labelTh}`,
      req.user.keirbanan
    );
  } catch (e) {
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server: ' + e.message
      });
    }
    return res.end();
  }
};

module.exports = { exportExcel };