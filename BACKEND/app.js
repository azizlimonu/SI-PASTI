require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// ═══════════════════════════════════════════
// MIDDLEWARE — harus sebelum routes
// ═══════════════════════════════════════════
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://domain-han.go.id'
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ═══════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const pkptRoutes = require('./src/routes/pkptRoutes');
const penugasanRoutes = require('./src/routes/penugasanRoutes');
const sptRoutes = require('./src/routes/sptRoutes');
const dokumenRoutes = require('./src/routes/dokumenRoutes');
const buktiTLRoutes = require('./src/routes/buktiTLRoutes');
const tindakLanjutRoutes = require('./src/routes/tindakLanjutRoutes');
const pihakRoutes = require('./src/routes/pihakRoutes');
const monitoringRoutes = require('./src/routes/monitoringRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pkpt', pkptRoutes);
app.use('/api/penugasan', penugasanRoutes);
app.use('/api/spt', sptRoutes);
app.use('/api/dokumen', dokumenRoutes);
app.use('/api/bukti', buktiTLRoutes);
app.use('/api/tindak-lanjut', tindakLanjutRoutes);
app.use('/api/pihak', pihakRoutes);
app.use('/api/monitoring', monitoringRoutes);

// Static files untuk akses file upload
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.json({ message: 'SI PASTI API berjalan dengan baik.' });
});

// ═══════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════
const { sequelize } = require('./src/models');
const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Koneksi database berhasil.');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('✅ Tabel database berhasil disinkronkan.');
    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
  });

module.exports = app;