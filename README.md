# Invoice Generator

Proyek web aplikasi untuk membuat dan mengunduh invoice sebagai PDF. Dibangun dengan React (Vite), Tailwind CSS, dan html2pdf.js tanpa backend.

## Cara Menjalankan
- Pastikan Node.js terpasang.
- Jalankan:
  - `npm install`
  - `npm run dev`
- Buka URL yang ditampilkan untuk melihat aplikasi.
- Untuk build produksi:
  - `npm run build`
  - `npm run preview`

## Tech Stack
- React (Vite)
- Tailwind CSS
- JavaScript
- html2pdf.js
- Tanpa backend, autentikasi, dan database

## Fitur
- Form input Seller, Customer, Invoice Details, dan Items
- Perhitungan Subtotal, Tax, dan Grand Total otomatis
- Preview invoice real-time dengan layout A4 yang siap cetak
- Unduh invoice sebagai PDF
- Arsitektur bersih dan mudah dikembangkan

## Rencana Pengembangan
- Multiple templates dengan sistem folder `templates/`
- Penyimpanan draft lokal (LocalStorage)
- Impor/Ekspor data invoice dalam format JSON
- Opsi mata uang dan format tanggal yang fleksibel
