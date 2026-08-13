await User.create({
  nip: '19981031202504001',
  nama: 'Abdul Aziz Limonu',
  jabatan: 'Auditor Ahli Pertama',
  status: 'AKTIF',
  role: 'superadmin',
  keirbanan: 'ALL',
  password: hashedPassword,
  first_login: true
});