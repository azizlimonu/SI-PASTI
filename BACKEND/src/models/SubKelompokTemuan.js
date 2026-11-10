const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Sub-kelompok (mis. "1.01.00 Kerugian Negara/Daerah") beserta "benang merah"-nya.
const SubKelompokTemuan = sequelize.define('SubKelompokTemuan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  kelompok_id: { type: DataTypes.INTEGER, allowNull: false },
  kode: { type: DataTypes.STRING(12), allowNull: false, unique: true },
  nama: { type: DataTypes.STRING(255), allowNull: false },
  benang_merah: { type: DataTypes.TEXT, allowNull: true },
  aktif: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'sub_kelompok_temuan',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = SubKelompokTemuan;