const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rekomendasi = sequelize.define('Rekomendasi', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  temuan_id: { type: DataTypes.INTEGER, allowNull: false },
  uraian_rekomendasi: { type: DataTypes.TEXT, allowNull: false },
  pihak_id: {
    type: DataTypes.INTEGER,
    allowNull: true  // relasi ke tabel pihaks
  },
  ditujukan_kepada: {
    type: DataTypes.STRING(255),
    allowNull: false  // tetap ada sebagai display text
  },
  adalah_tgr: { type: DataTypes.BOOLEAN, defaultValue: false },
  nilai_temuan: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
  nilai_terlunasi: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0
  },
  batas_waktu_tl: { type: DataTypes.DATEONLY, allowNull: true },
  status: {
    type: DataTypes.ENUM('Belum Ditindaklanjuti', 'Dalam Proses', 'Selesai'),
    defaultValue: 'Belum Ditindaklanjuti'
  },
  created_by: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'rekomendasis',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Rekomendasi;