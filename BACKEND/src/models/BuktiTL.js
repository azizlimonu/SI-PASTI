const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BuktiTL = sequelize.define('BuktiTL', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  judul_bukti: { type: DataTypes.STRING(255), allowNull: false },
  keterangan: { type: DataTypes.TEXT, allowNull: true },
  uploaded_by: { type: DataTypes.INTEGER, allowNull: true },
  file_path: { type: DataTypes.STRING(500), allowNull: true },
  link_bukti: { type: DataTypes.STRING(500), allowNull: true }
}, {
  tableName: 'bukti_tl',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = BuktiTL;