const { Op } = require('sequelize');
const {
  Spt, TindakLanjut, TindakLanjutBukti, Rekomendasi, Temuan,
  DokumenPenugasan, Penugasan, Pkpt
} = require('../models');

// Include berantai dibuat baru setiap dipanggil (Sequelize bisa memodifikasi objek include).
const incPkpt = () => ({ model: Pkpt, as: 'pkpt', attributes: ['keirbanan'] });
const incPenugasan = () => ({ model: Penugasan, as: 'penugasan', attributes: ['id'], include: [incPkpt()] });
const incDokumen = () => ({ model: DokumenPenugasan, as: 'dokumen', attributes: ['id'], include: [incPenugasan()] });
const incTemuan = () => ({ model: Temuan, as: 'temuan', attributes: ['id'], include: [incDokumen()] });
const incRekomendasi = () => ({ model: Rekomendasi, as: 'rekomendasi', attributes: ['id'], include: [incTemuan()] });

// Keirbanan pemilik data. Mengembalikan null kalau datanya tidak ada.
const keirbananDariSpt = async (id) => {
  const d = await Spt.findByPk(id, { attributes: ['id'], include: [incPenugasan()] });
  return d?.penugasan?.pkpt?.keirbanan ?? null;
};

const keirbananDariDokumen = async (id) => {
  const d = await DokumenPenugasan.findByPk(id, { attributes: ['id'], include: [incPenugasan()] });
  return d?.penugasan?.pkpt?.keirbanan ?? null;
};

const keirbananDariTemuan = async (id) => {
  const d = await Temuan.findByPk(id, { attributes: ['id'], include: [incDokumen()] });
  return d?.dokumen?.penugasan?.pkpt?.keirbanan ?? null;
};

const keirbananDariRekomendasi = async (id) => {
  const d = await Rekomendasi.findByPk(id, { attributes: ['id'], include: [incTemuan()] });
  return d?.temuan?.dokumen?.penugasan?.pkpt?.keirbanan ?? null;
};

const keirbananDariTL = async (id) => {
  const d = await TindakLanjut.findByPk(id, { attributes: ['id'], include: [incRekomendasi()] });
  return d?.rekomendasi?.temuan?.dokumen?.penugasan?.pkpt?.keirbanan ?? null;
};

// Superadmin/inspektur/tim TL (keirbanan 'ALL') boleh semua; lainnya hanya keirbanannya sendiri.
const bolehAkses = (user, keirbanan) =>
  user.keirbanan === 'ALL' || (keirbanan !== null && user.keirbanan === keirbanan);

const tolakAkses = (res, user, pesan) =>
  res.status(403).json({
    success: false,
    message: pesan || `Akses ditolak. Anda hanya bisa mengakses Keirbanan ${user.keirbanan}.`
  });

const PESAN_BUKTI_BERSAMA =
  'Akses ditolak. Bukti ini dipakai keirbanan lain, hanya superadmin, inspektur, atau tim tindak lanjut yang bisa mengubah/menghapusnya.';

// Bukti boleh diakses kalau terhubung ke TL di keirbanan user.
// Bukti yang belum terhubung ke TL mana pun hanya boleh diakses pengunggahnya.
const bolehAksesBukti = async (user, bukti) => {
  if (user.keirbanan === 'ALL') return true;

  const links = await TindakLanjutBukti.findAll({
    attributes: ['tindak_lanjut_id'],
    where: { bukti_id: bukti.id }
  });
  if (links.length === 0) return bukti.uploaded_by === user.id;

  for (const link of links) {
    if ((await keirbananDariTL(link.tindak_lanjut_id)) === user.keirbanan) return true;
  }
  return false;
};

// Mengubah/menghapus bukti hanya boleh kalau SEMUA TL pemakainya milik keirbanan user
// (bukti yang dipakai keirbanan lain hanya bisa diubah user 'ALL').
const bolehUbahBukti = async (user, bukti) => {
  if (user.keirbanan === 'ALL') return true;

  const links = await TindakLanjutBukti.findAll({
    attributes: ['tindak_lanjut_id'],
    where: { bukti_id: bukti.id }
  });
  if (links.length === 0) return bukti.uploaded_by === user.id;

  for (const link of links) {
    if ((await keirbananDariTL(link.tindak_lanjut_id)) !== user.keirbanan) return false;
  }
  return true;
};

// Kondisi `where` untuk daftar bukti: {} untuk ALL, selain itu hanya bukti yang boleh dilihat user.
const whereBuktiBoleh = async (user) => {
  if (user.keirbanan === 'ALL') return {};

  const tls = await TindakLanjut.findAll({
    attributes: ['id'],
    include: [{
      model: Rekomendasi, as: 'rekomendasi', attributes: [], required: true,
      include: [{
        model: Temuan, as: 'temuan', attributes: [], required: true,
        include: [{
          model: DokumenPenugasan, as: 'dokumen', attributes: [], required: true,
          include: [{
            model: Penugasan, as: 'penugasan', attributes: [], required: true,
            include: [{
              model: Pkpt, as: 'pkpt', attributes: [], required: true,
              where: { keirbanan: user.keirbanan }
            }]
          }]
        }]
      }]
    }],
    raw: true
  });

  const tlIds = tls.map((t) => t.id);
  const links = tlIds.length
    ? await TindakLanjutBukti.findAll({ attributes: ['bukti_id'], where: { tindak_lanjut_id: tlIds } })
    : [];

  return {
    [Op.or]: [
      { id: { [Op.in]: links.map((l) => l.bukti_id) } },
      { uploaded_by: user.id }
    ]
  };
};

module.exports = {
  bolehAkses,
  tolakAkses,
  keirbananDariSpt,
  keirbananDariDokumen,
  keirbananDariTemuan,
  keirbananDariRekomendasi,
  keirbananDariTL,
  bolehAksesBukti,
  bolehUbahBukti,
  whereBuktiBoleh,
  PESAN_BUKTI_BERSAMA
};