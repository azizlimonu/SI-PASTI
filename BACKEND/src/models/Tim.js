const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tim = sequelize.define('Tim', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  spt_id: { type: DataTypes.INTEGER, allowNull: false },
  nip: { type: DataTypes.STRING(20), allowNull: false },
  nama: { type: DataTypes.STRING(100), allowNull: false },
  jabatan_tim: { type: DataTypes.ENUM('Ketua Tim', 'Anggota', 'Pengendali Teknis', 'Pengendali Mutu'), allowNull: false }
}, {
  tableName: 'tims',
  timestamps: false
});

module.exports = Tim;