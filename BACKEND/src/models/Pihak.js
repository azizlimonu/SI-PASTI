const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pihak = sequelize.define('Pihak', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama: {
    type: DataTypes.STRING(255),
    allowNull: false  // wajib ada
  },
  nip: {
    type: DataTypes.STRING(20),
    allowNull: true  // untuk ASN
  },
  nik: {
    type: DataTypes.STRING(20),
    allowNull: true  // untuk non-ASN
  },
  jabatan: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  instansi_perusahaan: {
    type: DataTypes.STRING(255),
    allowNull: true  // nama instansi/perusahaan
  },
  jenis_pihak: {
    type: DataTypes.ENUM('ASN', 'Instansi/OPD', 'Perusahaan', 'Perorangan', 'Lainnya'),
    allowNull: false
  },
  jenis_pihak_lainnya: {
    type: DataTypes.STRING(100),
    allowNull: true  // diisi kalau jenis_pihak = Lainnya
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true  // info tambahan
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'pihaks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Pihak;