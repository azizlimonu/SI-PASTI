const sequelize = require('../config/database');

const User = require('./User');
const LogAktivitas = require('./LogAktivitas');
const Pkpt = require('./Pkpt');
const Penugasan = require('./Penugasan');
const Spt = require('./Spt');
const Tim = require('./Tim');
const DokumenPenugasan = require('./DokumenPenugasan');
const Temuan = require('./Temuan');
const Rekomendasi = require('./Rekomendasi');
const TindakLanjut = require('./TindakLanjut');
const BuktiTL = require('./BuktiTL');
const TindakLanjutBukti = require('./TindakLanjutBukti');
const Pihak = require('./Pihak');
const SetoranTgr = require('./SetoranTgr');

// ═══════════════════════════════════════════
// RELASI
// ═══════════════════════════════════════════

// User → Log
User.hasMany(LogAktivitas, { foreignKey: 'user_id', as: 'logs' });
LogAktivitas.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// PKPT → Penugasan
Pkpt.hasMany(Penugasan, { foreignKey: 'pkpt_id', as: 'penugasans' });
Penugasan.belongsTo(Pkpt, { foreignKey: 'pkpt_id', as: 'pkpt' });

// User → PKPT (creator)
User.hasMany(Pkpt, { foreignKey: 'created_by', as: 'pkpts' });
Pkpt.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// User → Penugasan (creator)
User.hasMany(Penugasan, { foreignKey: 'created_by', as: 'penugasans' });
Penugasan.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Penugasan → SPT
Penugasan.hasOne(Spt, { foreignKey: 'penugasan_id', as: 'spt' });
Spt.belongsTo(Penugasan, { foreignKey: 'penugasan_id', as: 'penugasan' });

// SPT → Tim
Spt.hasMany(Tim, { foreignKey: 'spt_id', as: 'tims' });
Tim.belongsTo(Spt, { foreignKey: 'spt_id', as: 'spt' });

// Penugasan → DokumenPenugasan
Penugasan.hasMany(DokumenPenugasan, { foreignKey: 'penugasan_id', as: 'dokumens' });
DokumenPenugasan.belongsTo(Penugasan, { foreignKey: 'penugasan_id', as: 'penugasan' });

// DokumenPenugasan → Temuan (hanya LHP)
DokumenPenugasan.hasMany(Temuan, { foreignKey: 'dokumen_penugasan_id', as: 'temuans' });
Temuan.belongsTo(DokumenPenugasan, { foreignKey: 'dokumen_penugasan_id', as: 'dokumen' });

// Temuan → Rekomendasi
Temuan.hasMany(Rekomendasi, { foreignKey: 'temuan_id', as: 'rekomendasis' });
Rekomendasi.belongsTo(Temuan, { foreignKey: 'temuan_id', as: 'temuan' });

// Rekomendasi → TindakLanjut
Rekomendasi.hasMany(TindakLanjut, { foreignKey: 'rekomendasi_id', as: 'tindakLanjuts' });
TindakLanjut.belongsTo(Rekomendasi, { foreignKey: 'rekomendasi_id', as: 'rekomendasi' });

// User → DokumenPenugasan (creator)
User.hasMany(DokumenPenugasan, { foreignKey: 'created_by', as: 'dokumens' });
DokumenPenugasan.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// User → Temuan (creator)
User.hasMany(Temuan, { foreignKey: 'created_by', as: 'temuans' });
Temuan.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// User → Rekomendasi (creator)
User.hasMany(Rekomendasi, { foreignKey: 'created_by', as: 'rekomendasis' });
Rekomendasi.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// User → TindakLanjut (creator)
User.hasMany(TindakLanjut, { foreignKey: 'created_by', as: 'tindakLanjuts' });
TindakLanjut.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// User → Spt (creator)
User.hasMany(Spt, { foreignKey: 'created_by', as: 'spts' });
Spt.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Pihak → Rekomendasi
Pihak.hasMany(Rekomendasi, { foreignKey: 'pihak_id', as: 'rekomendasis' });
Rekomendasi.belongsTo(Pihak, { foreignKey: 'pihak_id', as: 'pihak' });

// User → Pihak (creator)
User.hasMany(Pihak, { foreignKey: 'created_by', as: 'pihaks' });
Pihak.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });


// TindakLanjut ↔ BuktiTL (many-to-many via pivot)
TindakLanjut.belongsToMany(BuktiTL, {
  through: TindakLanjutBukti,
  foreignKey: 'tindak_lanjut_id',
  otherKey: 'bukti_id',
  as: 'buktis'
});
BuktiTL.belongsToMany(TindakLanjut, {
  through: TindakLanjutBukti,
  foreignKey: 'bukti_id',
  otherKey: 'tindak_lanjut_id',
  as: 'tindakLanjuts'
});

// User → BuktiTL
User.hasMany(BuktiTL, { foreignKey: 'uploaded_by', as: 'buktis' });
BuktiTL.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// Rekomendasi → SetoranTgr
Rekomendasi.hasMany(SetoranTgr, { foreignKey: 'rekomendasi_id', as: 'setorans' });
SetoranTgr.belongsTo(Rekomendasi, { foreignKey: 'rekomendasi_id', as: 'rekomendasi' });

// User → SetoranTgr (creator)
User.hasMany(SetoranTgr, { foreignKey: 'created_by', as: 'setorans' });
SetoranTgr.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

module.exports = {
  sequelize,
  User,
  LogAktivitas,
  Pkpt,
  Penugasan,
  Spt,
  Tim,
  DokumenPenugasan,
  Temuan,
  Rekomendasi,
  TindakLanjut,
  BuktiTL,
  TindakLanjutBukti,
  Pihak,
  SetoranTgr
};
