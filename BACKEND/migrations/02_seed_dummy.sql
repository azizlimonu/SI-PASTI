-- ============================================================
-- SI-PASTI — 02_seed_dummy.sql
-- DATA DUMMY untuk pengembangan (termasuk 3 penugasan NON PKPT dengan 'wadah' Non-PKPT per tahun+keirbanan). Semua nama, NIP, nilai, dan link adalah fiktif.
-- File tidak diunggah: kolom file_* dikosongkan, bukti berupa link Google Drive dummy.
-- Password semua akun dummy:  Dummy@2026
-- Jalankan:  mysql -u root -p si_pasti < 02_seed_dummy.sql
-- ============================================================
USE si_pasti;
SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ---------- USERS (7) ----------
INSERT INTO users (id, nip, nama, jabatan, status, role, keirbanan, password, first_login, created_at, updated_at) VALUES
(1,'199001010000000001','Dummy Superadmin','Administrator Sistem','AKTIF','superadmin','ALL','$2b$10$muE0MAaRKSnO9wqwgN5aX.eU/DPAZnw75PDiTqXJV9bqREL2BKrL.',0,'2026-01-05 08:00:00','2026-01-05 08:00:00'),
(2,'199001010000000002','Dummy Inspektur','Inspektur Daerah','AKTIF','inspektur','ALL','$2b$10$muE0MAaRKSnO9wqwgN5aX.eU/DPAZnw75PDiTqXJV9bqREL2BKrL.',0,'2026-01-05 08:00:00','2026-01-05 08:00:00'),
(3,'199001010000000003','Dummy Tim Tindak Lanjut','Auditor Tim Tindak Lanjut','AKTIF','admin_tl','ALL','$2b$10$muE0MAaRKSnO9wqwgN5aX.eU/DPAZnw75PDiTqXJV9bqREL2BKrL.',0,'2026-01-05 08:00:00','2026-01-05 08:00:00'),
(4,'199001010000000004','Dummy Admin Irban I','Auditor Keirbanan I','AKTIF','admin','I','$2b$10$muE0MAaRKSnO9wqwgN5aX.eU/DPAZnw75PDiTqXJV9bqREL2BKrL.',0,'2026-01-05 08:00:00','2026-01-05 08:00:00'),
(5,'199001010000000005','Dummy Admin Irban II','Auditor Keirbanan II','AKTIF','admin','II','$2b$10$muE0MAaRKSnO9wqwgN5aX.eU/DPAZnw75PDiTqXJV9bqREL2BKrL.',0,'2026-01-05 08:00:00','2026-01-05 08:00:00'),
(6,'199001010000000006','Dummy Admin Irban III','Auditor Keirbanan III','AKTIF','admin','III','$2b$10$muE0MAaRKSnO9wqwgN5aX.eU/DPAZnw75PDiTqXJV9bqREL2BKrL.',0,'2026-01-05 08:00:00','2026-01-05 08:00:00'),
(7,'199001010000000007','Dummy Irban II','Inspektur Pembantu Wilayah II','AKTIF','irban','II','$2b$10$muE0MAaRKSnO9wqwgN5aX.eU/DPAZnw75PDiTqXJV9bqREL2BKrL.',0,'2026-01-05 08:00:00','2026-01-05 08:00:00');

-- ---------- PENGATURAN ----------
INSERT INTO pengaturans (id, nama_instansi, nama_aplikasi, logo_path, created_at, updated_at) VALUES
(1,'Inspektorat Daerah Kabupaten Gorontalo','SI PASTI',NULL,'2026-01-05 08:00:00','2026-01-05 08:00:00');

-- ---------- PIHAK (6) ----------
INSERT INTO pihaks (id, nama, nip, nik, jabatan, instansi_perusahaan, jenis_pihak, jenis_pihak_lainnya, keterangan, created_by, created_at, updated_at) VALUES
(1,'Budi Dummy Santoso','198501012010011001',NULL,'Bendahara Pengeluaran','Dinas Dummy Pekerjaan Umum','ASN',NULL,'Pihak dummy',5,'2026-02-01 09:00:00','2026-02-01 09:00:00'),
(2,'Dinas Dummy Pendidikan',NULL,NULL,NULL,'Dinas Dummy Pendidikan','Instansi/OPD',NULL,'OPD dummy',5,'2026-02-01 09:00:00','2026-02-01 09:00:00'),
(3,'CV Dummy Karya Mandiri',NULL,NULL,'Direktur','CV Dummy Karya Mandiri','Perusahaan',NULL,'Rekanan dummy',5,'2026-02-01 09:00:00','2026-02-01 09:00:00'),
(4,'Siti Dummy Rahmawati',NULL,'7501000000000001',NULL,NULL,'Perorangan',NULL,'Perorangan dummy',4,'2026-02-01 09:00:00','2026-02-01 09:00:00'),
(5,'Andi Dummy Pratama','199002022015021002',NULL,'Kepala Seksi','Kecamatan Dummy Satu','ASN',NULL,'Pihak dummy',6,'2026-02-01 09:00:00','2026-02-01 09:00:00'),
(6,'PT Dummy Konstruksi Utama',NULL,NULL,'Direktur Utama','PT Dummy Konstruksi Utama','Perusahaan',NULL,'Rekanan dummy',6,'2026-02-01 09:00:00','2026-02-01 09:00:00');

-- ---------- PKPT (5) ----------
INSERT INTO pkpt (id, tahun, nama_program, status, keirbanan, sumber, created_by, created_at, updated_at) VALUES
(1,2025,'Audit Kepatuhan Pengelolaan Belanja Barang dan Jasa','Selesai','I','PKPT',4,'2025-01-10 08:00:00','2025-12-20 08:00:00'),
(2,2025,'Reviu Laporan Keuangan Perangkat Daerah','Selesai','II','PKPT',5,'2025-01-10 08:00:00','2025-12-20 08:00:00'),
(3,2025,'Audit Pengadaan Barang dan Jasa Pemerintah','Selesai','III','PKPT',6,'2025-01-10 08:00:00','2025-12-20 08:00:00'),
(4,2026,'Audit Kinerja Pelayanan Dasar','Aktif','II','PKPT',5,'2026-01-12 08:00:00','2026-01-12 08:00:00'),
(5,2026,'Evaluasi Pelaksanaan Dana Desa','Aktif','III','PKPT',6,'2026-01-12 08:00:00','2026-01-12 08:00:00'),
(6,2026,'Penugasan Non-PKPT Tahun 2026 - Keirbanan II','Aktif','II','NON_PKPT',5,'2026-07-01 08:00:00','2026-07-01 08:00:00'),
(7,2026,'Penugasan Non-PKPT Tahun 2026 - Keirbanan III','Aktif','III','NON_PKPT',6,'2026-08-03 08:00:00','2026-08-03 08:00:00'),
(8,2025,'Penugasan Non-PKPT Tahun 2025 - Keirbanan I','Selesai','I','NON_PKPT',4,'2025-09-01 08:00:00','2025-12-20 08:00:00');

-- ---------- PENUGASAN (7) ----------
INSERT INTO penugasans (id, pkpt_id, nama_penugasan, jenis_penugasan, dasar_penugasan, tanggal_mulai, tanggal_selesai, status, created_by, created_at, updated_at) VALUES
(1,1,'Audit Belanja Barang dan Jasa Dinas Dummy Kesehatan','Audit',NULL,'2025-03-03','2025-03-21','Selesai',4,'2025-02-20 08:00:00','2025-04-01 08:00:00'),
(2,2,'Reviu Laporan Keuangan Dinas Dummy Pendidikan','Reviu',NULL,'2025-04-07','2025-04-18','Selesai',5,'2025-03-25 08:00:00','2025-05-02 08:00:00'),
(3,2,'Reviu Laporan Keuangan Kecamatan Dummy Satu','Reviu',NULL,'2025-05-05','2025-05-16','Selesai',5,'2025-04-25 08:00:00','2025-06-02 08:00:00'),
(4,3,'Audit Pengadaan Jalan Lingkungan Dummy','Audit',NULL,'2025-06-02','2025-06-27','Selesai',6,'2025-05-20 08:00:00','2025-07-10 08:00:00'),
(5,4,'Audit Kinerja Puskesmas Dummy Satu','Audit',NULL,'2026-03-02','2026-03-27','Dalam Proses',5,'2026-02-20 08:00:00','2026-04-02 08:00:00'),
(6,5,'Evaluasi Dana Desa Desa Dummy Makmur','Evaluasi',NULL,'2026-04-06','2026-04-24','Dalam Proses',6,'2026-03-25 08:00:00','2026-05-04 08:00:00'),
(7,4,'Audit Kinerja Sekolah Dasar Dummy','Audit',NULL,'2026-06-01','2026-06-19','Belum Mulai',5,'2026-05-20 08:00:00','2026-05-20 08:00:00'),
(8,6,'Reviu Dokumen Pengadaan atas Permintaan Bupati','Reviu','Permintaan Bupati','2026-07-06','2026-07-24','Dalam Proses',5,'2026-07-01 09:00:00','2026-07-06 08:00:00'),
(9,7,'Audit atas Pengaduan Masyarakat Dana Desa Dummy','Audit','Pengaduan Masyarakat','2026-08-10','2026-09-04','Selesai',6,'2026-08-05 09:00:00','2026-09-15 08:00:00'),
(10,8,'Reviu Aset Daerah atas Arahan Inspektur','Reviu','Arahan Inspektur','2025-09-08','2025-09-19','Selesai',4,'2025-09-02 09:00:00','2025-10-20 08:00:00');

-- ---------- SPT (6) — file dikosongkan, link Drive dummy ----------
INSERT INTO spts (id, penugasan_id, nomor_spt, jenis_kegiatan, jenis_kegiatan_lainnya, uraian_kegiatan, tanggal_mulai, tanggal_selesai, jumlah_hari, file_spt, link_spt, created_by, created_at, updated_at) VALUES
(1,1,'700/SPT/IRBAN-I/012/2025','Audit',NULL,'Audit Ketaatan','2025-03-03','2025-03-21',15,NULL,'https://drive.google.com/file/d/dummy-spt-001/view',4,'2025-02-24 08:00:00','2025-02-24 08:00:00'),
(2,2,'700/SPT/IRBAN-II/021/2025','Reviu',NULL,'Reviu Laporan Keuangan','2025-04-07','2025-04-18',10,NULL,'https://drive.google.com/file/d/dummy-spt-002/view',5,'2025-04-01 08:00:00','2025-04-01 08:00:00'),
(3,3,'700/SPT/IRBAN-II/030/2025','Reviu',NULL,'Reviu Laporan Keuangan','2025-05-05','2025-05-16',10,NULL,'https://drive.google.com/file/d/dummy-spt-003/view',5,'2025-04-29 08:00:00','2025-04-29 08:00:00'),
(4,4,'700/SPT/IRBAN-III/044/2025','Audit',NULL,'Audit Ketaatan Pengadaan','2025-06-02','2025-06-27',20,NULL,'https://drive.google.com/file/d/dummy-spt-004/view',6,'2025-05-26 08:00:00','2025-05-26 08:00:00'),
(5,5,'700/SPT/IRBAN-II/009/2026','Audit',NULL,'Audit Kinerja','2026-03-02','2026-03-27',20,NULL,'https://drive.google.com/file/d/dummy-spt-005/view',5,'2026-02-25 08:00:00','2026-02-25 08:00:00'),
(6,6,'700/SPT/IRBAN-III/015/2026','Evaluasi',NULL,'Evaluasi Dana Desa','2026-04-06','2026-04-24',15,NULL,'https://drive.google.com/file/d/dummy-spt-006/view',6,'2026-03-30 08:00:00','2026-03-30 08:00:00'),
(7,8,'700/SPT/IRBAN-II/031/2026','Reviu',NULL,'Reviu Dokumen Pengadaan','2026-07-06','2026-07-24',15,NULL,'https://drive.google.com/file/d/dummy-spt-007/view',5,'2026-07-02 08:00:00','2026-07-02 08:00:00'),
(8,9,'700/SPT/IRBAN-III/052/2026','Audit',NULL,'Audit Investigatif','2026-08-10','2026-09-04',20,NULL,'https://drive.google.com/file/d/dummy-spt-008/view',6,'2026-08-06 08:00:00','2026-08-06 08:00:00'),
(9,10,'700/SPT/IRBAN-I/040/2025','Reviu',NULL,'Reviu Aset Daerah','2025-09-08','2025-09-19',10,NULL,'https://drive.google.com/file/d/dummy-spt-009/view',4,'2025-09-03 08:00:00','2025-09-03 08:00:00');

-- ---------- TIM (SPT 1-6) ----------
INSERT INTO tims (id, spt_id, nip, nama, jabatan_tim) VALUES
(1,1,'199001010000000011','Dummy Ketua Satu','Ketua Tim'),
(2,1,'199001010000000012','Dummy Anggota Satu','Anggota'),
(3,1,'199001010000000013','Dummy Pengendali Teknis Satu','Pengendali Teknis'),
(4,2,'199001010000000021','Dummy Ketua Dua','Ketua Tim'),
(5,2,'199001010000000022','Dummy Anggota Dua','Anggota'),
(6,3,'199001010000000021','Dummy Ketua Dua','Ketua Tim'),
(7,3,'199001010000000023','Dummy Anggota Tiga','Anggota'),
(8,4,'199001010000000031','Dummy Ketua Tiga','Ketua Tim'),
(9,4,'199001010000000032','Dummy Anggota Empat','Anggota'),
(10,4,'199001010000000033','Dummy Pengendali Mutu Satu','Pengendali Mutu'),
(11,5,'199001010000000021','Dummy Ketua Dua','Ketua Tim'),
(12,5,'199001010000000024','Dummy Anggota Lima','Anggota'),
(13,6,'199001010000000031','Dummy Ketua Tiga','Ketua Tim'),
(14,6,'199001010000000034','Dummy Anggota Enam','Anggota'),
(15,7,'199001010000000041','Dummy Ketua Empat','Ketua Tim'),
(16,7,'199001010000000042','Dummy Anggota Tujuh','Anggota'),
(17,8,'199001010000000031','Dummy Ketua Tiga','Ketua Tim'),
(18,8,'199001010000000035','Dummy Anggota Delapan','Anggota'),
(19,9,'199001010000000011','Dummy Ketua Satu','Ketua Tim'),
(20,9,'199001010000000012','Dummy Anggota Satu','Anggota');

-- ---------- DOKUMEN PENUGASAN (LHP & lainnya, link Drive dummy) ----------
INSERT INTO dokumen_penugasans (id, penugasan_id, jenis_dokumen, jenis_dokumen_lainnya, judul_dokumen, created_by, file_path, link_dokumen, created_at, updated_at) VALUES
(1,1,'LHP',NULL,'LHP Audit Belanja Barang dan Jasa Dinas Dummy Kesehatan',4,NULL,'https://drive.google.com/file/d/dummy-lhp-001/view','2025-04-01 10:00:00','2025-04-01 10:00:00'),
(2,1,'Kertas Kerja',NULL,'KKA Audit Belanja Dinas Dummy Kesehatan',4,NULL,'https://drive.google.com/file/d/dummy-kka-001/view','2025-04-02 10:00:00','2025-04-02 10:00:00'),
(3,2,'LHP',NULL,'LHR Laporan Keuangan Dinas Dummy Pendidikan',5,NULL,'https://drive.google.com/file/d/dummy-lhp-002/view','2025-05-02 10:00:00','2025-05-02 10:00:00'),
(4,3,'LHP',NULL,'LHR Laporan Keuangan Kecamatan Dummy Satu',5,NULL,'https://drive.google.com/file/d/dummy-lhp-003/view','2025-06-02 10:00:00','2025-06-02 10:00:00'),
(5,4,'LHP',NULL,'LHP Audit Pengadaan Jalan Lingkungan Dummy',6,NULL,'https://drive.google.com/file/d/dummy-lhp-004/view','2025-07-10 10:00:00','2025-07-10 10:00:00'),
(6,4,'P2HP',NULL,'P2HP Audit Pengadaan Jalan Lingkungan Dummy',6,NULL,'https://drive.google.com/file/d/dummy-p2hp-004/view','2025-06-30 10:00:00','2025-06-30 10:00:00'),
(7,5,'Telaahan Awal',NULL,'Telaahan Awal Audit Kinerja Puskesmas Dummy',5,NULL,'https://drive.google.com/file/d/dummy-telaahan-005/view','2026-02-27 10:00:00','2026-02-27 10:00:00'),
(8,6,'LHP',NULL,'LHE Dana Desa Desa Dummy Makmur',6,NULL,'https://drive.google.com/file/d/dummy-lhp-006/view','2026-05-04 10:00:00','2026-05-04 10:00:00'),
(9,9,'LHP',NULL,'LHP Audit Pengaduan Masyarakat Dana Desa Dummy',6,NULL,'https://drive.google.com/file/d/dummy-lhp-009/view','2026-09-15 10:00:00','2026-09-15 10:00:00'),
(10,10,'LHP',NULL,'LHR Reviu Aset Daerah atas Arahan Inspektur',4,NULL,'https://drive.google.com/file/d/dummy-lhp-010/view','2025-10-20 10:00:00','2025-10-20 10:00:00');

-- ---------- TEMUAN (6) ----------
INSERT INTO temuan (id, dokumen_penugasan_id, judul_temuan, uraian_temuan, created_by, created_at, updated_at) VALUES
(1,1,'Pertanggungjawaban belanja tidak didukung bukti lengkap','Terdapat belanja barang dan jasa yang bukti pertanggungjawabannya tidak lengkap dan tidak valid (data dummy).',4,'2025-04-01 11:00:00','2025-04-01 11:00:00'),
(2,1,'Kelebihan pembayaran perjalanan dinas','Terdapat pembayaran perjalanan dinas melebihi standar yang ditetapkan (data dummy).',4,'2025-04-01 11:10:00','2025-04-01 11:10:00'),
(3,3,'Pencatatan aset tidak akurat','Pencatatan aset tetap tidak sesuai dengan kondisi fisik (data dummy).',5,'2025-05-02 11:00:00','2025-05-02 11:00:00'),
(4,5,'Kekurangan volume pekerjaan jalan lingkungan','Terdapat selisih volume pekerjaan antara kontrak dan hasil pemeriksaan fisik (data dummy).',6,'2025-07-10 11:00:00','2025-07-10 11:00:00'),
(5,5,'Denda keterlambatan belum dipungut','Denda keterlambatan pekerjaan belum ditetapkan dan disetor ke kas daerah (data dummy).',6,'2025-07-10 11:10:00','2025-07-10 11:10:00'),
(6,8,'Belanja Dana Desa tidak sesuai peruntukan','Penggunaan Dana Desa tidak sesuai prioritas penggunaan (data dummy).',6,'2026-05-04 11:00:00','2026-05-04 11:00:00'),
(7,9,'Pengadaan barang desa tidak sesuai mekanisme','Pengadaan barang di desa dilakukan tanpa mekanisme yang berlaku (data dummy).',6,'2026-09-15 11:00:00','2026-09-15 11:00:00'),
(8,10,'Aset daerah dikuasai pihak lain','Aset daerah berupa tanah dikuasai pihak ketiga tanpa dasar yang sah (data dummy).',4,'2025-10-20 11:00:00','2025-10-20 11:00:00');

-- ---------- REKOMENDASI (8; 4 TGR) ----------
-- R3 sengaja dibuat nilai_terlunasi (3.000.000) <> jumlah setoran (2.500.000) untuk uji laporan selisih.
INSERT INTO rekomendasis (id, temuan_id, uraian_rekomendasi, pihak_id, ditujukan_kepada, adalah_tgr, nilai_temuan, nilai_terlunasi, batas_waktu_tl, status, created_by, created_at, updated_at) VALUES
(1,1,'Melengkapi bukti pertanggungjawaban belanja dan menyampaikan ke Inspektorat.',2,'Kepala Dinas Dummy Pendidikan',0,NULL,0,'2025-06-01','Selesai',4,'2025-04-01 12:00:00','2025-05-20 08:00:00'),
(2,2,'Menyetorkan kelebihan pembayaran perjalanan dinas ke Kas Daerah.',1,'Budi Dummy Santoso',1,15000000.00,5000000.00,'2025-06-15','Dalam Proses',4,'2025-04-01 12:10:00','2025-09-10 08:00:00'),
(3,4,'Menyetorkan kekurangan volume pekerjaan ke Kas Daerah.',3,'CV Dummy Karya Mandiri',1,10000000.00,3000000.00,'2025-09-10','Dalam Proses',6,'2025-07-10 12:00:00','2025-10-05 08:00:00'),
(4,5,'Menetapkan dan memungut denda keterlambatan dan menyetorkan ke Kas Daerah.',6,'PT Dummy Konstruksi Utama',1,8000000.00,8000000.00,'2025-09-10','Selesai',6,'2025-07-10 12:10:00','2025-10-20 08:00:00'),
(5,3,'Melakukan inventarisasi dan perbaikan pencatatan aset tetap.',5,'Andi Dummy Pratama',0,NULL,0,'2025-08-02','Dalam Proses',5,'2025-05-02 12:00:00','2025-07-15 08:00:00'),
(6,6,'Mengembalikan belanja Dana Desa yang tidak sesuai peruntukan ke Kas Desa.',4,'Siti Dummy Rahmawati',1,20000000.00,0,'2026-07-04','Belum Ditindaklanjuti',6,'2026-05-04 12:00:00','2026-05-04 12:00:00'),
(7,6,'Menyusun ulang rencana penggunaan Dana Desa sesuai prioritas.',5,'Andi Dummy Pratama',0,NULL,0,'2026-07-04','Belum Ditindaklanjuti',6,'2026-05-04 12:10:00','2026-05-04 12:10:00'),
(8,2,'Menyusun SOP perjalanan dinas.',2,'Kepala Dinas Dummy Pendidikan',0,NULL,0,'2025-07-15','Selesai',4,'2025-04-01 12:20:00','2025-06-30 08:00:00'),
(9,7,'Menyetorkan kelebihan pembayaran pengadaan barang desa ke Kas Desa.',5,'Andi Dummy Pratama',1,12000000.00,4000000.00,'2026-11-15','Dalam Proses',6,'2026-09-15 12:00:00','2026-10-10 08:00:00'),
(10,7,'Menyusun ulang prosedur pengadaan barang desa dan melakukan sosialisasi.',5,'Andi Dummy Pratama',0,NULL,0,'2026-11-30','Belum Ditindaklanjuti',6,'2026-09-15 12:10:00','2026-09-15 12:10:00'),
(11,8,'Menertibkan aset yang dikuasai pihak ketiga dan mengembalikannya ke Pemda.',2,'Kepala Dinas Dummy Pendidikan',0,NULL,0,'2026-01-31','Selesai',4,'2025-10-20 12:00:00','2025-12-15 08:00:00');

-- ---------- TINDAK LANJUT (7) ----------
INSERT INTO tindak_lanjuts (id, rekomendasi_id, uraian_tl, tanggal_tl, status_penerimaan, created_by, created_at, updated_at) VALUES
(1,1,'Bukti pertanggungjawaban dilengkapi dan diserahkan ke Inspektorat.','2025-05-15','Diterima',4,'2025-05-15 09:00:00','2025-05-20 08:00:00'),
(2,2,'Setoran tahap pertama sebesar Rp5.000.000 ke Kas Daerah.','2025-09-05','Sebagian Diterima',4,'2025-09-05 09:00:00','2025-09-10 08:00:00'),
(3,3,'Setoran sebagian sebesar Rp2.500.000 ke Kas Daerah.','2025-10-01','Sebagian Diterima',6,'2025-10-01 09:00:00','2025-10-05 08:00:00'),
(4,4,'Setoran denda keterlambatan tahap pertama Rp4.000.000.','2025-09-20','Diterima',6,'2025-09-20 09:00:00','2025-09-25 08:00:00'),
(5,4,'Setoran denda keterlambatan tahap kedua Rp4.000.000.','2025-10-15','Diterima',6,'2025-10-15 09:00:00','2025-10-20 08:00:00'),
(6,5,'Inventarisasi aset sedang dilakukan.','2025-07-10','Belum Diterima',5,'2025-07-10 09:00:00','2025-07-15 08:00:00'),
(7,8,'SOP perjalanan dinas telah ditetapkan.','2025-06-25','Diterima',4,'2025-06-25 09:00:00','2025-06-30 08:00:00'),
(8,9,'Setoran tahap pertama sebesar Rp4.000.000 ke Kas Desa.','2026-10-10','Sebagian Diterima',6,'2026-10-10 09:00:00','2026-10-10 09:00:00'),
(9,11,'Aset telah ditertibkan dan dikembalikan ke Pemda.','2025-12-15','Diterima',4,'2025-12-15 09:00:00','2025-12-15 09:00:00');

-- ---------- BUKTI TL (5, link Drive dummy) ----------
INSERT INTO bukti_tl (id, judul_bukti, keterangan, uploaded_by, file_path, link_bukti, created_at) VALUES
(1,'Bukti pertanggungjawaban lengkap','Kuitansi dan nota (dummy)',4,NULL,'https://drive.google.com/file/d/dummy-bukti-001/view','2025-05-15 09:30:00'),
(2,'Bukti setoran Rp5.000.000','STS tahap 1 (dummy)',4,NULL,'https://drive.google.com/file/d/dummy-bukti-002/view','2025-09-05 09:30:00'),
(3,'Bukti setoran denda tahap 1','STS (dummy)',6,NULL,'https://drive.google.com/file/d/dummy-bukti-003/view','2025-09-20 09:30:00'),
(4,'Bukti setoran denda tahap 2','STS (dummy)',6,NULL,'https://drive.google.com/file/d/dummy-bukti-004/view','2025-10-15 09:30:00'),
(5,'SK Penetapan SOP perjalanan dinas','SK (dummy)',4,NULL,'https://drive.google.com/file/d/dummy-bukti-005/view','2025-06-25 09:30:00'),
(6,'Bukti setoran Rp4.000.000 (Non-PKPT)','STS tahap 1 (dummy)',6,NULL,'https://drive.google.com/file/d/dummy-bukti-006/view','2026-10-10 09:30:00'),
(7,'Berita acara penertiban aset','BA (dummy)',4,NULL,'https://drive.google.com/file/d/dummy-bukti-007/view','2025-12-15 09:30:00');

INSERT INTO tindak_lanjut_buktis (id, tindak_lanjut_id, bukti_id) VALUES
(1,1,1),(2,2,2),(3,4,3),(4,5,4),(5,7,5),(6,8,6),(7,9,7);

-- ---------- SETORAN TGR (4, link Drive dummy) ----------
INSERT INTO setoran_tgrs (id, rekomendasi_id, jumlah_setoran, tanggal_setor, keterangan, file_path, link_bukti, created_by, created_at) VALUES
(1,2,5000000.00,'2025-09-05','Setoran tahap 1 (dummy)',NULL,'https://drive.google.com/file/d/dummy-setoran-001/view',4,'2025-09-05 10:00:00'),
(2,3,2500000.00,'2025-10-01','Setoran sebagian (dummy)',NULL,'https://drive.google.com/file/d/dummy-setoran-002/view',6,'2025-10-01 10:00:00'),
(3,4,4000000.00,'2025-09-20','Setoran denda tahap 1 (dummy)',NULL,'https://drive.google.com/file/d/dummy-setoran-003/view',6,'2025-09-20 10:00:00'),
(4,4,4000000.00,'2025-10-15','Setoran denda tahap 2 (dummy)',NULL,'https://drive.google.com/file/d/dummy-setoran-004/view',6,'2025-10-15 10:00:00'),
(5,9,4000000.00,'2026-10-10','Setoran tahap 1 Non-PKPT (dummy)',NULL,'https://drive.google.com/file/d/dummy-setoran-005/view',6,'2026-10-10 10:00:00');

-- ---------- LOG AKTIVITAS (5) ----------
INSERT INTO log_aktivitas (id, user_id, nama, aksi, jenis_dokumen, detail, keirbanan, created_at) VALUES
(1,4,'Dummy Admin Irban I','Upload Dokumen','LHP','LHP Audit Belanja Barang dan Jasa Dinas Dummy Kesehatan','I','2025-04-01 10:00:00'),
(2,5,'Dummy Admin Irban II','Upload Dokumen','LHP','LHR Laporan Keuangan Dinas Dummy Pendidikan','II','2025-05-02 10:00:00'),
(3,6,'Dummy Admin Irban III','Upload Dokumen','LHP','LHP Audit Pengadaan Jalan Lingkungan Dummy','III','2025-07-10 10:00:00'),
(4,6,'Dummy Admin Irban III','Tambah Setoran TGR','Setoran','PT Dummy Konstruksi Utama','III','2025-10-15 10:00:00'),
(5,1,'Dummy Superadmin','Login',NULL,'Login berhasil','ALL','2026-11-06 08:00:00');

SET FOREIGN_KEY_CHECKS = 1;
