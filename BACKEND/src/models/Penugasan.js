const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Penugasan = sequelize.define('Penugasan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  pkpt_id: { type: DataTypes.INTEGER, allowNull: false },
  nama_penugasan: { type: DataTypes.STRING(255), allowNull: false },
  jenis_penugasan: { type: DataTypes.STRING(100), allowNull: false },
  tanggal_mulai: { type: DataTypes.DATEONLY, allowNull: true },
  tanggal_selesai: { type: DataTypes.DATEONLY, allowNull: true },
  status: { type: DataTypes.ENUM('Belum Mulai', 'Dalam Proses', 'Selesai'), defaultValue: 'Belum Mulai' },
  created_by: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'penugasans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Penugasan;