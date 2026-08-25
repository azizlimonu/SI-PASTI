const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SetoranTgr = sequelize.define('SetoranTgr', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  rekomendasi_id: { type: DataTypes.INTEGER, allowNull: false },
  jumlah_setoran: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  tanggal_setor: { type: DataTypes.DATEONLY, allowNull: false },
  keterangan: { type: DataTypes.TEXT, allowNull: true },
  file_path: { type: DataTypes.STRING(500), allowNull: true },
  link_bukti: { type: DataTypes.STRING(500), allowNull: true },
  created_by: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'setoran_tgrs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = SetoranTgr;