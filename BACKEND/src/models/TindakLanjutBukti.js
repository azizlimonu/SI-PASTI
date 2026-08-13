const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TindakLanjutBukti = sequelize.define('TindakLanjutBukti', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tindak_lanjut_id: { type: DataTypes.INTEGER, allowNull: false },
  bukti_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'tindak_lanjut_buktis',
  timestamps: false
});

module.exports = TindakLanjutBukti;