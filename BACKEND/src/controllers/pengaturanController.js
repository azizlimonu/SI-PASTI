const { Pengaturan } = require('../models');
const writeLog = require('../utils/writeLog');
const fs = require('fs');

// Ambil satu-satunya baris pengaturan, bikin default kalau belum ada.
const ambilAtauBuatDefault = async () => {
  let pengaturan = await Pengaturan.findOne();
  if (!pengaturan) {
    pengaturan = await Pengaturan.create({ nama_aplikasi: 'SI PASTI' });
  }
  return pengaturan;
};

// GET — semua user login boleh baca (dipakai buat tampilkan logo di sidebar)
const getPengaturan = async (req, res) => {
  try {
    const pengaturan = await ambilAtauBuatDefault();
    return res.json({ success: true, data: pengaturan });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

// PUT — cuma superadmin (dijaga middleware di route)
const updatePengaturan = async (req, res) => {
  try {
    const { nama_instansi, nama_aplikasi } = req.body;
    const user = req.user;

    const pengaturan = await ambilAtauBuatDefault();

    if (req.file && pengaturan.logo_path && fs.existsSync(pengaturan.logo_path)) {
      fs.unlinkSync(pengaturan.logo_path);
    }

    await pengaturan.update({
      nama_instansi: nama_instansi !== undefined ? nama_instansi : pengaturan.nama_instansi,
      nama_aplikasi: nama_aplikasi || pengaturan.nama_aplikasi,
      logo_path: req.file ? req.file.path : pengaturan.logo_path
    });

    await writeLog(
      user.id,
      user.nama,
      'Update Pengaturan Aplikasi',
      'Pengaturan',
      `${pengaturan.nama_aplikasi} — ${pengaturan.nama_instansi || '-'}`,
      user.keirbanan
    );

    return res.json({
      success: true,
      message: 'Pengaturan berhasil disimpan.',
      data: pengaturan
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + e.message
    });
  }
};

module.exports = { getPengaturan, updatePengaturan };