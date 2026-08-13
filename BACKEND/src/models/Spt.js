const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Spt = sequelize.define('Spt', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  penugasan_id: { type: DataTypes.INTEGER, allowNull: false },
  nomor_spt: { type: DataTypes.STRING(100), allowNull: false },
  jenis_kegiatan: {
    type: DataTypes.ENUM(
      'Audit',
      'Reviu',
      'Monitoring',
      'Evaluasi',
      'Pemeriksaan Khusus',
      'Lainnya'
    ),
    allowNull: false
  },
  jenis_kegiatan_lainnya: {
    type: DataTypes.STRING(100),
    allowNull: true  // diisi kalau jenis_kegiatan = Lainnya
  },
  uraian_kegiatan: {
    type: DataTypes.STRING(255),
    allowNull: false  // input manual, contoh: Audit Ketaatan, Audit Investigatif
  },
  tanggal_mulai: { type: DataTypes.DATEONLY, allowNull: false },
  tanggal_selesai: { type: DataTypes.DATEONLY, allowNull: false },
  jumlah_hari: {
    type: DataTypes.INTEGER,
    allowNull: true  // bisa dihitung otomatis dari tanggal mulai - selesai
  },
  file_spt: { type: DataTypes.STRING(500), allowNull: true },
  link_spt: { type: DataTypes.STRING(500), allowNull: true },
  created_by: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'spts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Spt;