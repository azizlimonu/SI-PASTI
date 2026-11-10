-- ============================================================
-- SI-PASTI — 01_schema.sql
-- Skema database (dihasilkan dari model Sequelize di BACKEND/src/models)
-- Sudah termasuk migrasi 001_non_pkpt dan 002_kode_temuan.
-- Jalankan:  mysql -u root -p < 01_schema.sql
-- Setelah itu isi master kode temuan:  npm run import-kode-temuan  (di folder BACKEND)
-- ============================================================
-- Hapus tanda -- pada baris di bawah hanya jika ingin reset total:
-- DROP DATABASE IF EXISTS si_pasti;

CREATE DATABASE IF NOT EXISTS si_pasti
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE si_pasti;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE `bukti_tl` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `judul_bukti` varchar(255) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `link_bukti` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `bukti_tl_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `dokumen_penugasans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `penugasan_id` int(11) NOT NULL,
  `jenis_dokumen` enum('LHP','P2HP','Telaahan Awal','Kertas Kerja','Lainnya') NOT NULL,
  `jenis_dokumen_lainnya` varchar(100) DEFAULT NULL,
  `judul_dokumen` varchar(255) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `link_dokumen` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `penugasan_id` (`penugasan_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `dokumen_penugasans_ibfk_1` FOREIGN KEY (`penugasan_id`) REFERENCES `penugasans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `dokumen_penugasans_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `jenis_temuan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sub_kelompok_id` int(11) NOT NULL,
  `kategori_id` int(11) NOT NULL,
  `kode` varchar(12) NOT NULL,
  `uraian` varchar(500) NOT NULL,
  `aktif` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode` (`kode`),
  KEY `sub_kelompok_id` (`sub_kelompok_id`),
  KEY `kategori_id` (`kategori_id`),
  CONSTRAINT `jenis_temuan_ibfk_1` FOREIGN KEY (`sub_kelompok_id`) REFERENCES `sub_kelompok_temuan` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `jenis_temuan_ibfk_2` FOREIGN KEY (`kategori_id`) REFERENCES `kategori_temuan` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `kategori_temuan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kode` varchar(5) NOT NULL,
  `nama` varchar(150) NOT NULL,
  `keterangan` varchar(500) DEFAULT NULL,
  `urutan` int(11) NOT NULL DEFAULT 0,
  `aktif` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode` (`kode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `kelompok_temuan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kode` varchar(5) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `catatan` varchar(255) DEFAULT NULL,
  `berlaku_untuk` varchar(255) DEFAULT NULL,
  `sumber` varchar(255) DEFAULT NULL,
  `urutan` int(11) NOT NULL DEFAULT 0,
  `aktif` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode` (`kode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `log_aktivitas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `nama` varchar(100) DEFAULT NULL,
  `aksi` varchar(50) NOT NULL,
  `jenis_dokumen` varchar(50) DEFAULT NULL,
  `detail` text DEFAULT NULL,
  `keirbanan` enum('I','II','III','IV','V','ALL') DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `log_aktivitas_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `pengaturans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_instansi` varchar(255) DEFAULT NULL,
  `nama_aplikasi` varchar(100) DEFAULT 'SI PASTI',
  `logo_path` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `penugasans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pkpt_id` int(11) NOT NULL,
  `nama_penugasan` varchar(255) NOT NULL,
  `jenis_penugasan` varchar(100) NOT NULL,
  `dasar_penugasan` varchar(150) DEFAULT NULL,
  `tanggal_mulai` date DEFAULT NULL,
  `tanggal_selesai` date DEFAULT NULL,
  `status` enum('Belum Mulai','Dalam Proses','Selesai') DEFAULT 'Belum Mulai',
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pkpt_id` (`pkpt_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `penugasans_ibfk_1` FOREIGN KEY (`pkpt_id`) REFERENCES `pkpt` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `penugasans_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `pihaks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(255) NOT NULL,
  `nip` varchar(20) DEFAULT NULL,
  `nik` varchar(20) DEFAULT NULL,
  `jabatan` varchar(255) DEFAULT NULL,
  `instansi_perusahaan` varchar(255) DEFAULT NULL,
  `jenis_pihak` enum('ASN','Instansi/OPD','Perusahaan','Perorangan','Lainnya') NOT NULL,
  `jenis_pihak_lainnya` varchar(100) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `pihaks_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `pkpt` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tahun` int(11) NOT NULL,
  `nama_program` varchar(255) NOT NULL,
  `status` enum('Aktif','Selesai') DEFAULT 'Aktif',
  `keirbanan` enum('I','II','III','IV','V') NOT NULL,
  `sumber` enum('PKPT','NON_PKPT') NOT NULL DEFAULT 'PKPT',
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `pkpt_tahun_keirbanan_sumber` (`tahun`,`keirbanan`,`sumber`),
  CONSTRAINT `pkpt_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `rekomendasis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `temuan_id` int(11) NOT NULL,
  `uraian_rekomendasi` text NOT NULL,
  `pihak_id` int(11) DEFAULT NULL,
  `ditujukan_kepada` varchar(255) NOT NULL,
  `adalah_tgr` tinyint(1) DEFAULT 0,
  `nilai_temuan` decimal(15,2) DEFAULT NULL,
  `nilai_terlunasi` decimal(15,2) DEFAULT 0.00,
  `batas_waktu_tl` date DEFAULT NULL,
  `status` enum('Belum Ditindaklanjuti','Dalam Proses','Selesai') DEFAULT 'Belum Ditindaklanjuti',
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `temuan_id` (`temuan_id`),
  KEY `pihak_id` (`pihak_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `rekomendasis_ibfk_1` FOREIGN KEY (`temuan_id`) REFERENCES `temuan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rekomendasis_ibfk_2` FOREIGN KEY (`pihak_id`) REFERENCES `pihaks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `rekomendasis_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `setoran_tgrs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rekomendasi_id` int(11) NOT NULL,
  `jumlah_setoran` decimal(15,2) NOT NULL,
  `tanggal_setor` date NOT NULL,
  `keterangan` text DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `link_bukti` varchar(500) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rekomendasi_id` (`rekomendasi_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `setoran_tgrs_ibfk_1` FOREIGN KEY (`rekomendasi_id`) REFERENCES `rekomendasis` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `setoran_tgrs_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `spts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `penugasan_id` int(11) NOT NULL,
  `nomor_spt` varchar(100) NOT NULL,
  `jenis_kegiatan` enum('Audit','Reviu','Monitoring','Evaluasi','Pemeriksaan Khusus','Lainnya') NOT NULL,
  `jenis_kegiatan_lainnya` varchar(100) DEFAULT NULL,
  `uraian_kegiatan` varchar(255) NOT NULL,
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date NOT NULL,
  `jumlah_hari` int(11) DEFAULT NULL,
  `file_spt` varchar(500) DEFAULT NULL,
  `link_spt` varchar(500) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `penugasan_id` (`penugasan_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `spts_ibfk_1` FOREIGN KEY (`penugasan_id`) REFERENCES `penugasans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `spts_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `sub_kelompok_temuan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kelompok_id` int(11) NOT NULL,
  `kode` varchar(12) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `benang_merah` text DEFAULT NULL,
  `aktif` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode` (`kode`),
  KEY `kelompok_id` (`kelompok_id`),
  CONSTRAINT `sub_kelompok_temuan_ibfk_1` FOREIGN KEY (`kelompok_id`) REFERENCES `kelompok_temuan` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `temuan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dokumen_penugasan_id` int(11) NOT NULL,
  `jenis_temuan_id` int(11) DEFAULT NULL,
  `kategori_temuan_id` int(11) DEFAULT NULL,
  `judul_temuan` varchar(255) NOT NULL,
  `uraian_temuan` text NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `dokumen_penugasan_id` (`dokumen_penugasan_id`),
  KEY `jenis_temuan_id` (`jenis_temuan_id`),
  KEY `kategori_temuan_id` (`kategori_temuan_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `temuan_ibfk_1` FOREIGN KEY (`dokumen_penugasan_id`) REFERENCES `dokumen_penugasans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `temuan_ibfk_2` FOREIGN KEY (`jenis_temuan_id`) REFERENCES `jenis_temuan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `temuan_ibfk_3` FOREIGN KEY (`kategori_temuan_id`) REFERENCES `kategori_temuan` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `temuan_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `tims` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `spt_id` int(11) NOT NULL,
  `nip` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `jabatan_tim` enum('Ketua Tim','Anggota','Pengendali Teknis','Pengendali Mutu') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `spt_id` (`spt_id`),
  CONSTRAINT `tims_ibfk_1` FOREIGN KEY (`spt_id`) REFERENCES `spts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `tindak_lanjut_buktis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tindak_lanjut_id` int(11) NOT NULL,
  `bukti_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tindak_lanjut_buktis_bukti_id_tindak_lanjut_id_unique` (`tindak_lanjut_id`,`bukti_id`),
  KEY `bukti_id` (`bukti_id`),
  CONSTRAINT `tindak_lanjut_buktis_ibfk_1` FOREIGN KEY (`tindak_lanjut_id`) REFERENCES `tindak_lanjuts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tindak_lanjut_buktis_ibfk_2` FOREIGN KEY (`bukti_id`) REFERENCES `bukti_tl` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `tindak_lanjuts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rekomendasi_id` int(11) NOT NULL,
  `uraian_tl` text NOT NULL,
  `tanggal_tl` date NOT NULL,
  `status_penerimaan` enum('Diterima','Belum Diterima','Sebagian Diterima') DEFAULT 'Belum Diterima',
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rekomendasi_id` (`rekomendasi_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `tindak_lanjuts_ibfk_1` FOREIGN KEY (`rekomendasi_id`) REFERENCES `rekomendasis` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tindak_lanjuts_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nip` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `jabatan` varchar(100) NOT NULL,
  `status` enum('AKTIF','NONAKTIF') DEFAULT 'AKTIF',
  `role` enum('superadmin','admin','admin_tl','irban','inspektur') NOT NULL DEFAULT 'admin',
  `keirbanan` enum('I','II','III','IV','V','ALL') NOT NULL DEFAULT 'ALL',
  `password` varchar(255) NOT NULL,
  `first_login` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nip` (`nip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
