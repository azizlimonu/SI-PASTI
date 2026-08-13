const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LogAktivitas = sequelize.define('LogAktivitas', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  nama: { type: DataTypes.STRING(100), allowNull: true },
  aksi: { type: DataTypes.STRING(50), allowNull: false },
  jenis_dokumen: { type: DataTypes.STRING(50), allowNull: true },
  detail: { type: DataTypes.TEXT, allowNull: true },
  keirbanan: { type: DataTypes.ENUM('I', 'II', 'III', 'IV', 'V', 'ALL'), allowNull: true }
}, {
  tableName: 'log_aktivitas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = LogAktivitas;