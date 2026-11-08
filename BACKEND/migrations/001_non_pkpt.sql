-- ============================================================
-- SI-PASTI — migrations/001_non_pkpt.sql
-- Menambah dukungan penugasan NON PKPT:
--   * pkpt.sumber               ('PKPT' | 'NON_PKPT'), data lama otomatis 'PKPT'
--   * penugasans.dasar_penugasan (teks bebas, opsional)
--   * indeks pkpt (tahun, keirbanan, sumber) untuk pencarian "wadah" Non-PKPT
-- Aman dijalankan berulang (cek dulu sebelum mengubah). Cocok untuk MySQL 8 dan MariaDB.
-- Jalankan:  mysql -u root -p si_pasti < migrations/001_non_pkpt.sql
-- ============================================================
SET @db = DATABASE();

-- 1) pkpt.sumber
SET @ada = (SELECT COUNT(*) FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'pkpt' AND COLUMN_NAME = 'sumber');
SET @sql = IF(@ada = 0,
  "ALTER TABLE pkpt ADD COLUMN sumber ENUM('PKPT','NON_PKPT') NOT NULL DEFAULT 'PKPT' AFTER keirbanan",
  "SELECT 'pkpt.sumber sudah ada' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2) penugasans.dasar_penugasan
SET @ada = (SELECT COUNT(*) FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'penugasans' AND COLUMN_NAME = 'dasar_penugasan');
SET @sql = IF(@ada = 0,
  "ALTER TABLE penugasans ADD COLUMN dasar_penugasan VARCHAR(150) NULL AFTER jenis_penugasan",
  "SELECT 'penugasans.dasar_penugasan sudah ada' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3) indeks pkpt (tahun, keirbanan, sumber)
SET @ada = (SELECT COUNT(*) FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'pkpt' AND INDEX_NAME = 'pkpt_tahun_keirbanan_sumber');
SET @sql = IF(@ada = 0,
  "CREATE INDEX pkpt_tahun_keirbanan_sumber ON pkpt (tahun, keirbanan, sumber)",
  "SELECT 'indeks pkpt_tahun_keirbanan_sumber sudah ada' AS info");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT 'Migrasi 001_non_pkpt selesai' AS info;