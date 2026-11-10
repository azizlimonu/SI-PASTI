-- ============================================================
-- SI-PASTI — migrations/002_kode_temuan.sql
-- Menambah master KATEGORI TEMUAN dan KODE TEMUAN:
--   * kategori_temuan                 (±9 kategori, bisa diedit langsung di database)
--   * kelompok_temuan -> sub_kelompok_temuan -> jenis_temuan (kode temuan berkode)
--   * temuan.jenis_temuan_id          (kode temuan; kosong = temuan manual / data lama)
--   * temuan.kategori_temuan_id       (kategori untuk temuan manual)
-- Aman dijalankan berulang. Cocok untuk MySQL 8 dan MariaDB.
-- Jalankan:  mysql -u root -p si_pasti < migrations/002_kode_temuan.sql
-- Isi master diimpor terpisah:  npm run import-kode-temuan
-- ============================================================
SET @db = DATABASE();

-- 1) Tabel master
CREATE TABLE IF NOT EXISTS kategori_temuan (
  id int(11) NOT NULL AUTO_INCREMENT,
  kode varchar(5) NOT NULL,
  nama varchar(150) NOT NULL,
  keterangan varchar(500) DEFAULT NULL,
  urutan int(11) NOT NULL DEFAULT 0,
  aktif tinyint(1) NOT NULL DEFAULT 1,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY kode (kode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS kelompok_temuan (
  id int(11) NOT NULL AUTO_INCREMENT,
  kode varchar(5) NOT NULL,
  nama varchar(255) NOT NULL,
  catatan varchar(255) DEFAULT NULL,
  berlaku_untuk varchar(255) DEFAULT NULL,
  sumber varchar(255) DEFAULT NULL,
  urutan int(11) NOT NULL DEFAULT 0,
  aktif tinyint(1) NOT NULL DEFAULT 1,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY kode (kode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sub_kelompok_temuan (
  id int(11) NOT NULL AUTO_INCREMENT,
  kelompok_id int(11) NOT NULL,
  kode varchar(12) NOT NULL,
  nama varchar(255) NOT NULL,
  benang_merah text DEFAULT NULL,
  aktif tinyint(1) NOT NULL DEFAULT 1,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY kode (kode),
  KEY kelompok_id (kelompok_id),
  CONSTRAINT sub_kelompok_temuan_ibfk_1 FOREIGN KEY (kelompok_id) REFERENCES kelompok_temuan (id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS jenis_temuan (
  id int(11) NOT NULL AUTO_INCREMENT,
  sub_kelompok_id int(11) NOT NULL,
  kategori_id int(11) NOT NULL,
  kode varchar(12) NOT NULL,
  uraian varchar(500) NOT NULL,
  aktif tinyint(1) NOT NULL DEFAULT 1,
  created_at datetime NOT NULL,
  updated_at datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY kode (kode),
  KEY sub_kelompok_id (sub_kelompok_id),
  KEY kategori_id (kategori_id),
  CONSTRAINT jenis_temuan_ibfk_1 FOREIGN KEY (sub_kelompok_id) REFERENCES sub_kelompok_temuan (id) ON UPDATE CASCADE,
  CONSTRAINT jenis_temuan_ibfk_2 FOREIGN KEY (kategori_id) REFERENCES kategori_temuan (id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2) temuan.jenis_temuan_id
SET @ada = (SELECT COUNT(*) FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'temuan' AND COLUMN_NAME = 'jenis_temuan_id');
SET @sql = IF(@ada = 0,
  "ALTER TABLE temuan ADD COLUMN jenis_temuan_id int(11) DEFAULT NULL AFTER dokumen_penugasan_id",
  "SELECT 'temuan.jenis_temuan_id sudah ada' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ada = (SELECT COUNT(*) FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'temuan' AND COLUMN_NAME = 'jenis_temuan_id');
SET @sql = IF(@ada = 0,
  "ALTER TABLE temuan ADD KEY jenis_temuan_id (jenis_temuan_id)",
  "SELECT 'indeks temuan.jenis_temuan_id sudah ada' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ada = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'temuan' AND COLUMN_NAME = 'jenis_temuan_id'
              AND REFERENCED_TABLE_NAME = 'jenis_temuan');
SET @sql = IF(@ada = 0,
  "ALTER TABLE temuan ADD CONSTRAINT fk_temuan_jenis_temuan FOREIGN KEY (jenis_temuan_id) REFERENCES jenis_temuan (id) ON DELETE SET NULL ON UPDATE CASCADE",
  "SELECT 'FK temuan.jenis_temuan_id sudah ada' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3) temuan.kategori_temuan_id
SET @ada = (SELECT COUNT(*) FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'temuan' AND COLUMN_NAME = 'kategori_temuan_id');
SET @sql = IF(@ada = 0,
  "ALTER TABLE temuan ADD COLUMN kategori_temuan_id int(11) DEFAULT NULL AFTER jenis_temuan_id",
  "SELECT 'temuan.kategori_temuan_id sudah ada' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ada = (SELECT COUNT(*) FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'temuan' AND COLUMN_NAME = 'kategori_temuan_id');
SET @sql = IF(@ada = 0,
  "ALTER TABLE temuan ADD KEY kategori_temuan_id (kategori_temuan_id)",
  "SELECT 'indeks temuan.kategori_temuan_id sudah ada' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ada = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'temuan' AND COLUMN_NAME = 'kategori_temuan_id'
              AND REFERENCED_TABLE_NAME = 'kategori_temuan');
SET @sql = IF(@ada = 0,
  "ALTER TABLE temuan ADD CONSTRAINT fk_temuan_kategori_temuan FOREIGN KEY (kategori_temuan_id) REFERENCES kategori_temuan (id) ON UPDATE CASCADE",
  "SELECT 'FK temuan.kategori_temuan_id sudah ada' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT 'Migrasi 002_kode_temuan selesai' AS info;
