const {
  KelompokTemuan, SubKelompokTemuan, JenisTemuan, KategoriTemuan
} = require('../models');
const { berlakuUntuk } = require('../utils/kodeTemuan');

// ═══════════════════════════════════════════
// DAFTAR KODE TEMUAN (bertingkat: kelompok → sub-kelompok → jenis temuan)
// Query: ?jenis_penugasan=Audit  → hanya kelompok yang berlaku untuk jenis penugasan itu
// Hanya data aktif yang dikirim. Master diedit langsung di database.
// ═══════════════════════════════════════════
const getKodeTemuan = async (req, res) => {
  try {
    const { jenis_penugasan } = req.query;

    const kelompoks = await KelompokTemuan.findAll({
      where: { aktif: true },
      include: [{
        model: SubKelompokTemuan,
        as: 'subKelompoks',
        required: false,
        where: { aktif: true },
        include: [{
          model: JenisTemuan,
          as: 'jenisTemuans',
          required: false,
          where: { aktif: true },
          include: [{
            model: KategoriTemuan,
            as: 'kategori',
            attributes: ['id', 'kode', 'nama']
          }]
        }]
      }],
      order: [
        ['urutan', 'ASC'],
        [{ model: SubKelompokTemuan, as: 'subKelompoks' }, 'kode', 'ASC'],
        [
          { model: SubKelompokTemuan, as: 'subKelompoks' },
          { model: JenisTemuan, as: 'jenisTemuans' },
          'kode',
          'ASC'
        ]
      ]
    });

    const data = kelompoks
      .map((k) => k.toJSON())
      .filter((k) => !jenis_penugasan || berlakuUntuk(k.berlaku_untuk, jenis_penugasan))
      .map((k) => ({
        ...k,
        subKelompoks: (k.subKelompoks || []).filter((s) => (s.jenisTemuans || []).length > 0)
      }))
      .filter((k) => k.subKelompoks.length > 0);

    return res.json({ success: true, data });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// ═══════════════════════════════════════════
// DAFTAR KATEGORI TEMUAN (aktif, urut sesuai kolom `urutan`)
// ═══════════════════════════════════════════
const getKategoriTemuan = async (req, res) => {
  try {
    const data = await KategoriTemuan.findAll({
      where: { aktif: true },
      attributes: ['id', 'kode', 'nama', 'keterangan', 'urutan'],
      order: [['urutan', 'ASC'], ['id', 'ASC']]
    });
    return res.json({ success: true, data });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

module.exports = { getKodeTemuan, getKategoriTemuan };