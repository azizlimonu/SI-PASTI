const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Jenis temuan berkode (mis. "1.01.03 Kekurangan volume pekerjaan dan/atau barang").
// kategori_id menentukan kategori temuan; ubah langsung di database bila perlu.
const JenisTemuan = sequelize.define('JenisTemuan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sub_kelompok_id: { type: DataTypes.INTEGER, allowNull: false },
  kategori_id: { type: DataTypes.INTEGER, allowNull: false },
  kode: { type: DataTypes.STRING(12), allowNull: false, unique: true },
  uraian: { type: DataTypes.STRING(500), allowNull: false },
  aktif: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'jenis_temuan',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = JenisTemuan;