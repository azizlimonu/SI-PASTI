const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Temuan = sequelize.define('Temuan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  dokumen_penugasan_id: { type: DataTypes.INTEGER, allowNull: false },
  judul_temuan: { type: DataTypes.STRING(255), allowNull: false },
  uraian_temuan: { type: DataTypes.TEXT, allowNull: false },
  created_by: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'temuan',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Temuan;