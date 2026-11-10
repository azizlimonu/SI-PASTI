const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Kategori temuan (±9 baris) untuk mengelompokkan SEMUA temuan di monitoring.
// Isinya bisa diubah langsung di database (nama, urutan, aktif), tidak perlu lewat aplikasi.
const KategoriTemuan = sequelize.define('KategoriTemuan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  kode: { type: DataTypes.STRING(5), allowNull: false, unique: true },
  nama: { type: DataTypes.STRING(150), allowNull: false },
  keterangan: { type: DataTypes.STRING(500), allowNull: true },
  urutan: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  aktif: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'kategori_temuan',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = KategoriTemuan;