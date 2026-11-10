// Mengimpor master kategori temuan & kode temuan dari seeds/kode_temuan.json.
//
// Pakai (dari folder BACKEND, tabel sudah dibuat lewat migrasi 002 / skema terbaru):
//   npm run import-kode-temuan                 -> hanya MENAMBAH yang belum ada (aman, tidak menimpa edit Anda)
//   npm run import-kode-temuan -- --perbarui   -> juga menimpa nama/uraian/kategori sesuai file seed
//
// Setelah diimpor, semua master (kategori, kelompok, sub-kelompok, jenis temuan) bisa
// diubah langsung di database. Status `aktif` tidak pernah ditimpa oleh impor.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
  sequelize, KategoriTemuan, KelompokTemuan, SubKelompokTemuan, JenisTemuan
} = require('../src/models');

const FILE = path.join(__dirname, '..', 'seeds', 'kode_temuan.json');
const PERBARUI = process.argv.includes('--perbarui');

// Buat satu baris kalau belum ada. Kalau sudah ada: dilewati, atau diperbarui bila --perbarui.
// Mengembalikan { row, hasil: 'baru' | 'diperbarui' | 'sama' | 'dilewati' }.
const upsert = async (Model, where, values, transaction) => {
  const existing = await Model.findOne({ where, transaction });
  if (!existing) {
    const row = await Model.create({ ...where, ...values }, { transaction });
    return { row, hasil: 'baru' };
  }
  if (!PERBARUI) return { row: existing, hasil: 'dilewati' };
  existing.set(values);
  if (!existing.changed()) return { row: existing, hasil: 'sama' };
  await existing.save({ transaction });
  return { row: existing, hasil: 'diperbarui' };
};

const validasi = (data) => {
  const kategori = new Set(data.kategori.map((k) => k.kode));
  const kelompok = new Set(data.kelompok.map((k) => k.kode));
  const sub = new Set(data.sub_kelompok.map((s) => s.kode));
  data.sub_kelompok.forEach((s) => {
    if (!kelompok.has(s.kelompok)) throw new Error(`Sub-kelompok ${s.kode}: kelompok ${s.kelompok} tidak ada.`);
  });
  data.jenis_temuan.forEach((j) => {
    if (!sub.has(j.sub_kelompok)) throw new Error(`Jenis ${j.kode}: sub-kelompok ${j.sub_kelompok} tidak ada.`);
    if (!kategori.has(j.kategori)) throw new Error(`Jenis ${j.kode}: kategori ${j.kategori} tidak ada.`);
  });
};

const main = async () => {
  const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  validasi(data);
  await sequelize.authenticate();

  const ringkas = {};
  const catat = (tabel, hasil) => {
    ringkas[tabel] = ringkas[tabel] || { baru: 0, diperbarui: 0, sama: 0, dilewati: 0 };
    ringkas[tabel][hasil] += 1;
  };

  const t = await sequelize.transaction();
  try {
    // 1) Kategori
    const kategoriByKode = {};
    for (const [i, k] of data.kategori.entries()) {
      const { row, hasil } = await upsert(KategoriTemuan, { kode: k.kode }, {
        nama: k.nama, keterangan: k.keterangan || null, urutan: i + 1
      }, t);
      kategoriByKode[k.kode] = row;
      catat('kategori_temuan', hasil);
    }

    // 2) Kelompok
    const kelompokByKode = {};
    for (const [i, k] of data.kelompok.entries()) {
      const { row, hasil } = await upsert(KelompokTemuan, { kode: k.kode }, {
        nama: k.nama,
        catatan: k.catatan || null,
        berlaku_untuk: k.berlaku_untuk || null,
        sumber: k.sumber || null,
        urutan: i + 1
      }, t);
      kelompokByKode[k.kode] = row;
      catat('kelompok_temuan', hasil);
    }

    // 3) Sub-kelompok
    const subByKode = {};
    for (const s of data.sub_kelompok) {
      const { row, hasil } = await upsert(SubKelompokTemuan, { kode: s.kode }, {
        kelompok_id: kelompokByKode[s.kelompok].id,
        nama: s.nama,
        benang_merah: s.benang_merah || null
      }, t);
      subByKode[s.kode] = row;
      catat('sub_kelompok_temuan', hasil);
    }

    // 4) Jenis temuan
    for (const j of data.jenis_temuan) {
      const { hasil } = await upsert(JenisTemuan, { kode: j.kode }, {
        sub_kelompok_id: subByKode[j.sub_kelompok].id,
        kategori_id: kategoriByKode[j.kategori].id,
        uraian: j.uraian
      }, t);
      catat('jenis_temuan', hasil);
    }

    await t.commit();
  } catch (err) {
    await t.rollback();
    throw err;
  }

  console.log(`Sumber: ${data.sumber}`);
  console.log(PERBARUI ? 'Mode: --perbarui (menimpa data yang sudah ada)' : 'Mode: tambah saja (data yang sudah ada tidak diubah)');
  console.table(ringkas);
  console.log('✅ Impor kategori & kode temuan selesai.');
};

main()
  .catch((err) => {
    console.error(`❌ ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());