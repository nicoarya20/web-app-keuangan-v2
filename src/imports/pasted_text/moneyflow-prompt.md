Berikut prompt yang bisa langsung kamu pakai untuk Vibe Coding (misalnya di Cursor, Windsurf, Claude Code, Lovable, Bolt, atau AI coding agent lainnya):

---

# Prompt Vibe Coding

Buatkan sebuah aplikasi web full-stack modern bernama **MoneyFlow** yang berfungsi sebagai sistem manajemen keuangan pribadi.

## Tujuan Utama

Aplikasi harus membantu pengguna mengelola:

* Pemasukan
* Pengeluaran
* Investasi
* Tabungan
* Dompet (Wallet Management)

dalam satu dashboard yang mudah digunakan dan mobile-friendly.

---

## Tech Stack

Gunakan teknologi modern:

* Frontend: React + TypeScript + Tailwind CSS
* Backend: Node.js + Express
* Database: PostgreSQL
* ORM: Prisma
* Authentication: JWT + bcrypt
* State Management: Zustand
* Chart: Recharts
* Deployment Ready

Gunakan struktur project yang scalable dan clean architecture.

---

# Fitur Utama

## 1. Dashboard

Dashboard menampilkan ringkasan keuangan secara realtime:

### Kartu Statistik

* Total Saldo Dompet
* Total Pemasukan Bulan Ini
* Total Pengeluaran Bulan Ini
* Total Investasi
* Total Tabungan
* Cash Flow Bulan Ini

### Grafik

* Grafik pemasukan vs pengeluaran
* Grafik perkembangan saldo
* Grafik alokasi keuangan

### Ringkasan

* Transaksi terakhir
* Top kategori pengeluaran
* Target tabungan

---

# 2. Modul Pemasukan

Pengguna dapat menambah pemasukan.

Field:

* Tanggal
* Nominal
* Sumber pendapatan
* Kategori
* Catatan

Contoh:

* Gaji
* Freelance
* Bonus
* Ojek Online
* Investasi Cair

Ketika pemasukan dibuat:

* Saldo dompet bertambah otomatis

---

# 3. Modul Pengeluaran

Pengguna dapat mencatat pengeluaran.

Field:

* Tanggal
* Nominal
* Kategori
* Metode pembayaran
* Catatan

Kategori:

* Makanan
* Transportasi
* Belanja
* Hiburan
* Kesehatan
* Pendidikan
* Lainnya

Saat pengeluaran dibuat:

* Saldo dompet berkurang otomatis

---

# 4. Modul Dompet (Wallet Management)

Fitur utama aplikasi.

Pengguna dapat membuat banyak dompet.

Contoh:

### Dompet Digital

* GoPay
* DANA
* OVO
* ShopeePay
* LinkAja

### Rekening Bank

* BCA
* BRI
* BNI
* Mandiri

### Dompet Fisik

* Cash
* Uang Tunai

Field Wallet:

* Nama Wallet
* Jenis Wallet
* Saldo Awal
* Saldo Saat Ini

Fitur:

* Tambah Wallet
* Edit Wallet
* Hapus Wallet
* Transfer Antar Wallet

Contoh:

Transfer Rp100.000 dari BCA ke DANA.

Maka:

* Saldo BCA berkurang
* Saldo DANA bertambah

Semua tercatat dalam riwayat transaksi.

---

# 5. Modul Tabungan

Pengguna dapat membuat target tabungan.

Field:

* Nama Target
* Target Nominal
* Saldo Saat Ini
* Deadline

Contoh:

* Dana Darurat
* Beli Motor
* Liburan Bali

Fitur:

* Setor ke tabungan
* Tarik dari tabungan

Saat setor:

* Saldo wallet berkurang
* Saldo tabungan bertambah

---

# 6. Modul Investasi

Pengguna dapat mencatat investasi.

Jenis investasi:

* Saham
* Reksa Dana
* Emas
* Crypto
* Deposito
* Lainnya

Field:

* Nama Investasi
* Jenis
* Modal Awal
* Nilai Saat Ini
* Tanggal Pembelian

Fitur:

* Beli investasi
* Jual investasi
* Tracking keuntungan/rugi

Saat beli investasi:

* Saldo wallet berkurang

Saat jual investasi:

* Saldo wallet bertambah

---

# 7. Riwayat Transaksi

Gabungkan seluruh transaksi:

* Pemasukan
* Pengeluaran
* Investasi
* Tabungan
* Transfer Wallet

Filter:

* Tanggal
* Jenis transaksi
* Kategori

Fitur:

* Search
* Pagination
* Export Excel
* Export PDF

---

# 8. Laporan

Laporan bulanan dan tahunan.

Menampilkan:

* Total pemasukan
* Total pengeluaran
* Total tabungan
* Total investasi
* Net Worth

Grafik perkembangan keuangan.

---

# Database Schema

Buat schema Prisma yang mencakup:

User

Wallet

Income

Expense

Savings

SavingsTransaction

Investment

InvestmentTransaction

WalletTransfer

TransactionHistory

Gunakan relasi yang benar antar tabel.

---

# UI/UX

Desain modern seperti:

* Monzo
* Spendee
* Wallet by BudgetBakers
* Money Lover

Warna:

* Primary: Emerald
* Secondary: Slate
* Accent: Blue

Gunakan:

* Dark Mode
* Light Mode
* Responsive Mobile First

---

# Fitur Tambahan

* Multi-user
* Login/Register
* Backup Data
* Import Excel
* Export Excel
* Export PDF
* PWA Support
* Notifikasi target tabungan
* Reminder transaksi rutin

---

# Business Logic Penting

Semua saldo harus selalu sinkron.

Contoh:

Wallet BCA = Rp5.000.000

Tambah Pengeluaran Rp100.000

Maka:

Wallet BCA = Rp4.900.000

Tambah Pemasukan Rp1.000.000

Maka:

Wallet BCA = Rp5.900.000

Tambah Tabungan Rp500.000

Maka:

Wallet BCA = Rp5.400.000
Tabungan = Rp500.000

Beli Emas Rp1.000.000

Maka:

Wallet BCA = Rp4.400.000
Investasi Emas = Rp1.000.000

Seluruh perubahan harus tercatat otomatis dalam Transaction History.

---

# Output Yang Diharapkan

Generate:

1. Arsitektur project lengkap
2. Struktur folder production-ready
3. Prisma schema lengkap
4. API endpoints lengkap
5. React pages lengkap
6. Dashboard analytics
7. Authentication system
8. Database migration
9. Seed data
10. Dokumentasi instalasi dan deployment

Fokus pada clean code, reusable component, scalable architecture, dan siap digunakan untuk aplikasi keuangan pribadi production-level.
