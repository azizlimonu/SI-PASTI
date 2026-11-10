const {
  JenisTemuan, SubKelompokTemuan, KelompokTemuan, KategoriTemuan
} = require('../models');

// Error yang pesannya aman ditampilkan ke pengguna (status 400).
class InputError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const normal = (s) => String(s || '').trim().toLowerCase();

// berlaku_untuk kosong/NULL = berlaku untuk semua jenis penugasan.
// Selain itu daftar dipisah koma, mis. 'Audit,Evaluasi' (huruf besar/kecil tidak dibedakan).
const berlakuUntuk = (berlaku_untuk, jenisPenugasan) => {
  if (!berlaku_untuk || !String(berlaku_untuk).trim()) return true;
  return String(berlaku_untuk).split(',').map(normal).includes(normal(jenisPenugasan));
};

// Memeriksa pilihan kode/kategori untuk SATU temuan.
//  - jenis_temuan_id diisi  -> temuan berkode; kategori diturunkan dari kodenya (kategori_temuan_id = null)
//  - kategori_temuan_id saja -> temuan manual
// Mengembalikan { jenis_temuan_id, kategori_temuan_id, uraian_kode } atau melempar InputError.
const resolveKodeKategori = async (
  { jenis_temuan_id, kategori_temuan_id },
  jenisPenugasan,
  { kategoriWajib = false, transaction } = {}
) => {
  if (jenis_temuan_id) {
    const jenis = await JenisTemuan.findByPk(jenis_temuan_id, {
      transaction,
      include: [{
        model: SubKelompokTemuan,
        as: 'subKelompok',
        include: [{ model: KelompokTemuan, as: 'kelompok' }]
      }]
    });

    if (!jenis || !jenis.aktif || !jenis.subKelompok?.aktif || !jenis.subKelompok.kelompok?.aktif) {
      throw new InputError(400, 'Kode temuan tidak valid atau tidak aktif.');
    }
    if (!berlakuUntuk(jenis.subKelompok.kelompok.berlaku_untuk, jenisPenugasan)) {
      throw new InputError(
        400,
        `Kode temuan ${jenis.kode} tidak berlaku untuk penugasan jenis ${jenisPenugasan}.`
      );
    }
    return { jenis_temuan_id: jenis.id, kategori_temuan_id: null, uraian_kode: jenis.uraian };
  }

  if (kategori_temuan_id) {
    const kategori = await KategoriTemuan.findByPk(kategori_temuan_id, { transaction });
    if (!kategori || !kategori.aktif) {
      throw new InputError(400, 'Kategori temuan tidak valid atau tidak aktif.');
    }
    return { jenis_temuan_id: null, kategori_temuan_id: kategori.id, uraian_kode: null };
  }

  if (kategoriWajib) {
    throw new InputError(400, 'Pilih kode temuan, atau pilih kategori untuk temuan manual.');
  }
  return { jenis_temuan_id: null, kategori_temuan_id: null, uraian_kode: null };
};

module.exports = { InputError, berlakuUntuk, resolveKodeKategori };