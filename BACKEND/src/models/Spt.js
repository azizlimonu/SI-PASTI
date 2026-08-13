const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Spt = sequelize.define('Spt', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  penugasan_id: { type: DataTypes.INTEGER, allowNull: false },
  nomor_spt: { type: DataTypes.STRING(100), allowNull: false },
  tanggal_spt: { type: DataTypes.DATEONLY, allowNull: false },
  file_spt: { type: DataTypes.STRING(500), allowNull: true },
  link_spt: { type: DataTypes.STRING(500), allowNull: true },
  created_by: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'spts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Spt;