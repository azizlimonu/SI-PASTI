const fs = require('fs');
const path = require('path');

/**
 * Kirim file sebagai attachment (trigger download di browser).
 * File tidak pernah diambil dari input user langsung — selalu lewat filePath dari DB.
 */
const sendFileDownload = (res, filePath, downloadName) => {
  if (!filePath) {
    return res.status(404).json({ success: false, message: 'File tidak tersedia untuk data ini.' });
  }

  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    return res.status(404).json({ success: false, message: 'File fisik tidak ditemukan di server.' });
  }

  const ext = path.extname(absolutePath);
  const safeName = (downloadName || path.basename(absolutePath)).replace(/[\\/:*?"<>|]/g, '-');
  const finalName = safeName.endsWith(ext) ? safeName : `${safeName}${ext}`;

  return res.download(absolutePath, finalName);
};

module.exports = { sendFileDownload };