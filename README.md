# Deptech Frontend - Sistem Manajemen Cuti Pegawai

Aplikasi web untuk pengelolaan data cuti pegawai berbasis Next.js. Sistem ini memungkinkan admin untuk mengelola data admin, pegawai, dan pengajuan cuti.

## Teknologi

- Next.js v15.5.2
- React v19.1.0
- TailwindCSS
- Axios
- React Hook Form & Zod

## Fitur

- Autentikasi admin (login/register)
- Manajemen data admin
- Manajemen data pegawai
- Pengajuan dan persetujuan cuti
- UI yang responsive dengan dukungan dark/light mode

## Cara Menjalankan

### Prasyarat

- Node.js (versi 18+)
- Backend API (lihat bagian Backend)

### Langkah-langkah

1. Clone repositori
   ```bash
   git clone https://github.com/damario789/deptech-fe.git
   cd deptech-fe
   ```

2. Install dependensi
   ```bash
   npm install
   ```

3. Jalankan dalam mode development
   ```bash
   npm run dev
   ```

4. Aplikasi akan berjalan di `http://localhost:3001`

## Backend

Repository backend dapat diakses dan di-clone dari:
```bash
git clone https://github.com/damario789/deptech-be.git
cd deptech-be
```

Pastikan backend sudah berjalan sebelum menggunakan frontend.

## Struktur Proyek

- `/app` - Router dan komponen halaman
- `/components` - Komponen UI yang dapat digunakan kembali
- `/lib` - Utilitas, layanan API, dan validasi

## Halaman Utama

- `/` - Beranda
- `/login` - Login admin
- `/register` - Registrasi admin baru
- `/dashboard` - Dashboard admin
- `/admin` - Manajemen admin
- `/employees` - Manajemen pegawai
- `/leaves` - Manajemen cuti
- `/profile` - Profil admin yang login
