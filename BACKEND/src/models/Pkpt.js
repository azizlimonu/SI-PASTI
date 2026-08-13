const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pkpt = sequelize.define('Pkpt', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tahun: { type: DataTypes.INTEGER, allowNull: false },
  nama_program: { type: DataTypes.STRING(255), allowNull: false },
  status: { type: DataTypes.ENUM('Aktif', 'Selesai'), defaultValue: 'Aktif' },
  keirbanan: {
    type: DataTypes.ENUM('I', 'II', 'III', 'IV', 'V'),
    allowNull: false
  },
  created_by: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'pkpt',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Pkpt;