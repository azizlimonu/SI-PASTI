const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Singleton — cuma ada 1 baris (id selalu 1), berisi pengaturan
// tampilan aplikasi (nama instansi, nama aplikasi, logo).
const Pengaturan = sequelize.define('Pengaturan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama_instansi: { type: DataTypes.STRING(255), allowNull: true },
  nama_aplikasi: { type: DataTypes.STRING(100), allowNull: true, defaultValue: 'SI PASTI' },
  logo_path: { type: DataTypes.STRING(500), allowNull: true }
}, {
  tableName: 'pengaturans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Pengaturan;