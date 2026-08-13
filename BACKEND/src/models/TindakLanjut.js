const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TindakLanjut = sequelize.define('TindakLanjut', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  rekomendasi_id: { type: DataTypes.INTEGER, allowNull: false },
  uraian_tl: { type: DataTypes.TEXT, allowNull: false },
  tanggal_tl: { type: DataTypes.DATEONLY, allowNull: false },
  status_penerimaan: {
    type: DataTypes.ENUM('Diterima', 'Belum Diterima', 'Sebagian Diterima'),
    defaultValue: 'Belum Diterima'
  },
  created_by: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'tindak_lanjuts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TindakLanjut;