// Membuat (atau mereset password) akun superadmin lewat terminal.
//
// Pakai (dari folder BACKEND, tabel database harus sudah ada):
//   npm run create-superadmin             -> tanya NIP, nama, jabatan, password
//   npm run create-superadmin -- --reset  -> reset password superadmin yang sudah ada
//
// Non-interaktif (otomatisasi/deploy): isi ADMIN_NIP, ADMIN_NAMA, ADMIN_JABATAN
// (opsional) dan ADMIN_PASSWORD di environment — jangan simpan di file .env repo.
require('dotenv').config();
const readline = require('readline');
const bcrypt = require('bcrypt');
const { User, sequelize } = require('../src/models');

const MIN_PASSWORD = 8;

// Tanya via terminal. hidden=true -> ketikan password tampil sebagai '*'
const ask = (question, { hidden = false } = {}) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    });
    if (hidden) {
      rl._writeToOutput = (text) => {
        process.stdout.write(text.includes(question) ? text : '*');
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer.trim());
    });
  });

const getPassword = async () => {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  const first = await ask('Password baru : ', { hidden: true });
  const second = await ask('Ulangi password: ', { hidden: true });
  if (first !== second) throw new Error('Password dan konfirmasi tidak sama.');
  return first;
};

const main = async () => {
  await sequelize.authenticate();
  const reset = process.argv.includes('--reset');

  const nip = process.env.ADMIN_NIP || (await ask('NIP           : '));
  if (!nip || nip.length > 20) throw new Error('NIP wajib diisi (maksimal 20 karakter).');

  const existing = await User.findOne({ where: { nip } });

  if (reset) {
    if (!existing) throw new Error(`NIP ${nip} tidak ditemukan.`);
    if (existing.role !== 'superadmin') {
      throw new Error(`NIP ${nip} bukan superadmin. Reset password user biasa lewat menu aplikasi.`);
    }
  } else if (existing) {
    throw new Error(`NIP ${nip} sudah terdaftar. Gunakan --reset untuk mereset passwordnya.`);
  }

  const nama = reset ? existing.nama : process.env.ADMIN_NAMA || (await ask('Nama lengkap   : '));
  if (!nama) throw new Error('Nama wajib diisi.');
  const nonInteractive = Boolean(process.env.ADMIN_NIP && process.env.ADMIN_PASSWORD);
  const jabatan = reset
    ? existing.jabatan
    : process.env.ADMIN_JABATAN ||
    (nonInteractive ? '' : await ask('Jabatan (Enter = Administrator Sistem): ')) ||
    'Administrator Sistem';

  const password = await getPassword();
  if (password.length < MIN_PASSWORD) {
    throw new Error(`Password minimal ${MIN_PASSWORD} karakter.`);
  }
  const hashed = await bcrypt.hash(password, 10);

  if (reset) {
    // first_login=true -> wajib ganti password saat login berikutnya
    await existing.update({ password: hashed, first_login: true, status: 'AKTIF' });
    console.log(`✅ Password superadmin ${nama} (${nip}) berhasil direset. Wajib diganti saat login.`);
  } else {
    await User.create({
      nip,
      nama,
      jabatan,
      status: 'AKTIF',
      role: 'superadmin',
      keirbanan: 'ALL',
      password: hashed,
      first_login: true
    });
    console.log(`✅ Superadmin ${nama} (${nip}) berhasil dibuat. Wajib ganti password saat login pertama.`);
  }
};

main()
  .catch((err) => {
    console.error(`❌ ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());