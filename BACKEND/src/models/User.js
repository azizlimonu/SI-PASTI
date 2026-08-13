const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nip: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  nama: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  jabatan: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('AKTIF', 'NONAKTIF'),
    defaultValue: 'AKTIF'
  },
  role: {
    type: DataTypes.ENUM(
      'superadmin',
      'admin',
      'admin_tl',
      'irban',
      'inspektur'
    ),
    allowNull: false,
    defaultValue: 'admin'
  },
  keirbanan: {
    type: DataTypes.ENUM('I', 'II', 'III', 'IV', 'V', 'ALL'),
    allowNull: false,
    defaultValue: 'ALL'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  first_login: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;