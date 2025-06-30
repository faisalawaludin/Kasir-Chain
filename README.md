# Kasir Chain POS

![image](https://github.com/user-attachments/assets/ab172782-1e32-478b-8dcc-c235a287c40a)

**Kasir Chain POS** adalah sistem Point of Sale (POS) modern berbasis **blockchain**, dibangun di atas platform **Internet Computer Protocol (ICP)**. Sistem ini dirancang untuk mendukung UMKM dalam mengelola penjualan secara **real-time**, **transparan**, **aman**, dan **bebas perantara**, dengan mendukung **pembayaran Web3** maupun **pembayaran lokal** (local payment) sebagai metode transaksi digital yang fleksibel.


## 🔗 Canister Deployment

- **Backend Canister:**  
  [https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=7pant-ciaaa-aaaad-aawqq-cai](https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=7pant-ciaaa-aaaad-aawqq-cai)

- **Frontend Canister:**  
  [https://7gdgp-uaaaa-aaaad-aawra-cai.icp0.io/](https://7gdgp-uaaaa-aaaad-aawra-cai.icp0.io/)



---

## 🎯 Tujuan Utama

- Menyediakan kasir digital Web3 tanpa ketergantungan sistem tradisional.
- Memudahkan manajemen produk, pesanan, dan laporan keuangan.
- Memfasilitasi pembayaran trustless langsung ke wallet UMKM.
- Memberikan fitur AI cerdas untuk analitik dan rekomendasi menu populer.

---

## ✨ Fitur Unggulan

### 🔐 Multi-User Admin Panel
- Login terpisah untuk **kasir** dan **admin**.
- Pengaturan **toko**, **pengguna**, dan **hak akses**.

### 📦 Produk & Kategori
- **CRUD** produk, kategori, dan sub-kategori *(contoh: ukuran, topping, jenis minuman, dll)*.

### 🧾 Order Management
- Buat, ubah, batalkan, dan kelola pesanan.
- Riwayat transaksi pelanggan.

### ⏳ Sistem Antrian Pelanggan
- Setiap pesanan masuk ke **antrian dinamis**.
- Kasir dapat melihat daftar pesanan: **menunggu**, **sedang dibuat**, atau **siap diambil**.
- Antrian dapat diurutkan berdasarkan **waktu** atau **status** pesanan.

### 💸 Pembayaran Web3
- Pembayaran via **QR Code** tanpa login – cukup scan dan bayar.
- Opsi pembayaran **fiat** *(off-chain, opsional)*.

### 🎟️ Voucher & Diskon
- **CRUD voucher** berbasis data on-chain.
- Otomatisasi penerapan **diskon** saat checkout.

### 📊 Laporan & Statistik
- Rekap transaksi harian/mingguan.
- Grafik penjualan berdasarkan waktu, kategori, dan item.

### 🧠 AI Rekomendasi Menu Populer
- Analisis data penjualan untuk memunculkan:
  - **Top-selling menu** (produk paling laku).
  - **Waktu ramai** penjualan.
  - **Rekomendasi pairing** menu populer.

---

## 🧰 Teknologi yang Digunakan (Tech Stack)

### 🔹 Frontend (Client)
- `React.js + TypeScript`
- `Tailwind CSS` (UI Styling)
- `@dfinity/agent`, `@dfinity/auth-client` untuk komunikasi dengan canister

### 🔸 Backend (ICP Canister)
- Bahasa: `Motoko`
- Fitur backend:
  - Manajemen Produk, Pesanan, Voucher
  - AI LLM
  - Statistik dan AI Analitik Penjualan

---

## 💼 Use Cases (Contoh Penggunaan oleh UMKM)

| Sektor UMKM         | Contoh Implementasi                                                                 |
|---------------------|--------------------------------------------------------------------------------------|
| Kopi Shop / Café     | Menampilkan menu populer berbasis AI saat pelanggan datang, pembayaran via scan.   |
| Street Food         | Pembayaran ICP via QR scan cepat tanpa login, cocok untuk lingkungan non-bankable. |
| Retail Fashion Lokal | Stok dan transaksi on-chain, sistem kasir Web3 sepenuhnya.                         |
| Barbershop / Salon   | Kelola layanan + voucher promosi + pembayaran langsung Web3 payment.               |

---

## 🌟 Keuntungan ICP untuk POS UMKM

- 🚫 **Tanpa biaya transaksi** (bebas dari potongan payment gateway).
- 💾 **Data disimpan on-chain** – aman, tidak bisa dimanipulasi.
- 🔒 **Privasi dan kontrol data** di tangan UMKM sendiri.
- 🌐 **Tanpa infrastruktur bank** – cocok untuk daerah pelosok.
- ⚡ **Ringan, cepat, dan scalable** – dari skala kecil hingga besar.

> ## 📝 Note
> 
> 🔧 Saat ini, implementasi fitur **user** (ACL) **belum tersedia** karena keterbatasan waktu pengembangan.  
> 🤖 Fitur **AI LLM** masih dalam tahap **uji coba dan evaluasi**. Untuk pengujian AI, terdapat fungsi `listProductsAI` di dalam backend.  
> 💳 Fitur **pembayaran** (Web3 dan fiat) juga masih dalam **tahap pengembangan**.  
> 🎥 **Video demonstrasi** saat ini belum tersedia karena project belum selesai sepenuhnya.

Admin

![image](https://github.com/user-attachments/assets/7ff072b4-bb3f-4f9f-aa59-bb9a75d044e5)

Product

![image](https://github.com/user-attachments/assets/ad4454b7-75f6-4ff5-8c4b-27006ed638a7)

Order Management 

![image](https://github.com/user-attachments/assets/476c66a9-14b6-42dc-935f-08f93f53b3d9)

Voucher

![image](https://github.com/user-attachments/assets/cf285e77-332e-4626-9f22-31618e8779cb)

Antrian

![image](https://github.com/user-attachments/assets/54e5ee16-7a7d-4cc4-aa80-587c5cc57f74)


