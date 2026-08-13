const { LogAktivitas } = require('../models');

const writeLog = async (userId, nama, aksi, jenisDokumen, detail, keirbanan = null) => {
  try {
    await LogAktivitas.create({
      user_id: userId,
      nama,
      aksi,
      jenis_dokumen: jenisDokumen,
      detail,
      keirbanan
    });
  } catch (e) {
    console.error('Write log error:', e.message);
  }
};

module.exports = writeLog;