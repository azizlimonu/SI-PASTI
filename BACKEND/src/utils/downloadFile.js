const fs = require('fs');
const path = require('path');

// Folder BACKEND. file_path di DB bersifat relatif terhadap folder ini,
// contoh: "uploads/dokumen/abc.pdf" atau "uploads\\dokumen\\abc.pdf" (Windows).
const BACKEND_ROOT = path.resolve(__dirname, '..', '..');
const UPLOAD_DIR = path.join(BACKEND_ROOT, 'uploads');

/**
 * Kirim file sebagai attachment (trigger download di browser).
 * File tidak pernah diambil dari input user langsung — selalu lewat filePath dari DB.
 */
const sendFileDownload = (res, filePath, downloadName) => {
  if (!filePath) {
    return res.status(404).json({ success: false, message: 'File tidak tersedia untuk data ini.' });
  }

  // Samakan backslash Windows jadi "/", lalu resolve dari folder BACKEND
  // (bukan dari folder tempat server kebetulan dijalankan).
  const normalized = String(filePath).replace(/\\/g, '/');
  const absolutePath = path.resolve(BACKEND_ROOT, normalized);

  // Cegah path traversal: file wajib berada di dalam folder uploads.
  if (!absolutePath.startsWith(UPLOAD_DIR + path.sep)) {
    return res.status(400).json({ success: false, message: 'Path file tidak valid.' });
  }

  if (!fs.existsSync(absolutePath)) {
    return res.status(404).json({ success: false, message: 'File fisik tidak ditemukan di server.' });
  }

  const ext = path.extname(absolutePath);
  const safeName = (downloadName || path.basename(absolutePath)).replace(/[\\/:*?"<>|]/g, '-');
  const finalName = safeName.endsWith(ext) ? safeName : `${safeName}${ext}`;

  return res.download(absolutePath, finalName);
};

module.exports = { sendFileDownload };