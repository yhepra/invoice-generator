# Invoice Generator

Proyek web aplikasi untuk membuat dan mengunduh invoice sebagai PDF.
Project ini terdiri dari Frontend (React) dan Backend (Laravel).

## Struktur Project
- `frontend/`: Aplikasi React (Vite)
- `backend/`: API Server (Laravel)

## Cara Menjalankan

### Frontend
1. Masuk ke folder frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Jalankan server development: `npm run dev`

### Backend
1. Masuk ke folder backend: `cd backend`
2. Install dependencies: `composer install`
3. Copy `.env.example` ke `.env` dan setting database
4. Generate key: `php artisan key:generate`
5. Migrasi database: `php artisan migrate`
6. Jalankan server: `php artisan serve`

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, html2pdf.js
- **Backend**: PHP Laravel, MySQL

## Fitur
- Form input Seller, Customer, Invoice Details, dan Items
- Perhitungan Subtotal, Tax, dan Grand Total otomatis
- Preview invoice real-time
- Unduh invoice sebagai PDF
- Manajemen data via Database (Invoices, Contacts, Settings)

