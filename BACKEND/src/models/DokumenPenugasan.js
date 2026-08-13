const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DokumenPenugasan = sequelize.define('DokumenPenugasan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  penugasan_id: { type: DataTypes.INTEGER, allowNull: false },
  jenis_dokumen: {
    type: DataTypes.ENUM('LHP', 'P2HP', 'Telaahan Awal', 'Kertas Kerja', 'Lainnya'),
    allowNull: false
  },
  judul_dokumen: { type: DataTypes.STRING(255), allowNull: false },
  created_by: { type: DataTypes.INTEGER, allowNull: true },
  file_path: { type: DataTypes.STRING(500), allowNull: true },
  link_dokumen: { type: DataTypes.STRING(500), allowNull: true }
}, {
  tableName: 'dokumen_penugasans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DokumenPenugasan;