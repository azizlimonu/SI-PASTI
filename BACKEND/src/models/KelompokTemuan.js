const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Kelompok kode temuan tingkat atas (mis. "1 = Ketidakpatuhan", "2 = Kelemahan SPI", "3 = 3E").
const KelompokTemuan = sequelize.define('KelompokTemuan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  kode: { type: DataTypes.STRING(5), allowNull: false, unique: true },
  nama: { type: DataTypes.STRING(255), allowNull: false },
  catatan: { type: DataTypes.STRING(255), allowNull: true },
  // Jenis penugasan yang boleh memakai kelompok ini, dipisah koma (mis. 'Audit,Evaluasi').
  // NULL = berlaku untuk semua jenis penugasan.
  berlaku_untuk: { type: DataTypes.STRING(255), allowNull: true },
  sumber: { type: DataTypes.STRING(255), allowNull: true },
  urutan: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  aktif: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'kelompok_temuan',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = KelompokTemuan;