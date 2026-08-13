POST /api/auth/login
POST /api/auth/change-password
GET /api/auth/profile
POST /api/auth/create-user

GET /api/users
GET /api/users/:id
PUT /api/users/:id
PATCH /api/users/:id/nonaktifkan
PATCH /api/users/:id/aktifkan
PATCH /api/users/:id/reset-password

GET /api/pkpt
GET /api/pkpt/:id
POST /api/pkpt
PUT /api/pkpt/:id
DELETE /api/pkpt/:id

GET /api/penugasan
GET /api/penugasan/:id
POST /api/penugasan
PUT /api/penugasan/:id
DELETE /api/penugasan/:id

GET /api/spt/penugasan/:penugasan_id
POST /api/spt
PUT /api/spt/:id
DELETE /api/spt/:id
POST /api/spt/:spt_id/tim
DELETE /api/spt/:spt_id/tim/:tim_id

GET /api/dokumen/penugasan/:penugasan_id
GET /api/dokumen/:id
POST /api/dokumen
PUT /api/dokumen/:id
DELETE /api/dokumen/:id
GET /api/dokumen/:dokumen_id/temuan
POST /api/dokumen/temuan/batch
PUT /api/dokumen/temuan/:id
DELETE /api/dokumen/temuan/:id
GET /api/dokumen/temuan/:temuan_id/rekomendasi
POST /api/dokumen/rekomendasi
PUT /api/dokumen/rekomendasi/:id
DELETE /api/dokumen/rekomendasi/:id

GET /api/tindak-lanjut
GET /api/tindak-lanjut/rekomendasi/:rekomendasi_id
POST /api/tindak-lanjut
POST /api/tindak-lanjut/batch
PUT /api/tindak-lanjut/:id
DELETE /api/tindak-lanjut/:id

GET /api/bukti
POST /api/bukti
POST /api/bukti/attach
POST /api/bukti/detach
PUT /api/bukti/:id
DELETE /api/bukti/:id

GET /api/pihak
GET /api/pihak/:id
POST /api/pihak
PUT /api/pihak/:id
DELETE /api/pihak/:id
GET /api/pihak/sktjm

GET /api/monitoring/dashboard
GET /api/monitoring/alert/spt
GET /api/monitoring/alert/tl
GET /api/monitoring/progress
GET /api/monitoring/log
