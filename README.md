# FritoGrafi

**FritoGrafi** adalah aplikasi web chatbot berbasis *Large Language Model (LLM)* yang dirancang dengan fokus pada transparansi sumber melalui **verifikasi klaim rinci (KBP)**. Setiap pernyataan faktual dalam jawaban AI dipecah menjadi klaim yang dapat diperiksa beserta tingkat keyakinan, ringkasan verifikasi, sumber utama, dan kutipan langsung dari sumber terbuka maupun dokumen pengguna.

Proyek ini dikembangkan untuk mata kuliah **Human-Computer Interaction (HCI)** oleh **Kelompok Hore Cinta Indonesia**.

---

## Anggota Kelompok

### Kelompok Hore Cinta Indonesia

| No | Nama | NIM |
| :--- | :--- | :--- |
| 1 | Muhammad Al Farel Azhar | 241401009 |
| 2 | Frito Radestya. S | 241401030 |
| 3 | El Fahreza Sufi | 241401042 |
| 4 | Frans M. Ginting | 241401049 |
| 5 | Akief Maulana Aulia | 241401072 |

---

## Fitur Utama

### Pengalaman Percakapan

- **Antarmuka Chatbot Modern Nusantara**: Mendukung tema **Terang** dan **Gelap** dengan kontras tinggi sesuai standar aksesibilitas WCAG 2.1 AA.
- **Layar Awal Interaktif**: Dilengkapi kartu contoh pertanyaan awal agar pengguna dapat langsung mencoba alur verifikasi klaim.
- **Rendering Markdown Lengkap**: Mendukung paragraf terstruktur, daftar, tabel responsif, kutipan, dan blok kode dengan tombol salin.
- **Kontrol Percakapan Penuh**: Tampilan respons halus, tombol **Hentikan**, **Salin**, **Ubah dan Kirim Ulang**, **Jawab Ulang**, penilaian (`👍` / `👎`), serta saran pertanyaan lanjutan.
- **Upload File dan Dokumen**: Mendukung lampiran dokumen (`PDF`, `DOCX`, `TXT`, `MD`, `CSV`) dan gambar (`PNG`, `JPG`, `WEBP`) hingga 3 file per pesan (total maksimal 4 MB per pesan) melalui tombol lampirkan, *drag and drop*, maupun tempel gambar (`Ctrl+V`) lengkap dengan pratinjau.
- **Manajemen Riwayat (Mode Tamu Lokal)**: Multi-sesi percakapan tersimpan otomatis di `localStorage`, dikelompokkan berdasarkan waktu (*Hari Ini*, *Kemarin*, *7 Hari Terakhir*, *Lebih Lama*), dilengkapi pencarian instan (`Ctrl+K`), ubah judul inline, dan dialog konfirmasi hapus.

### Verifikasi Klaim & Referensi Sumber (KBP)

- **Penanda Sitasi Inline (`[1]`, `[2]`)**: Hover menampilkan pratinjau singkat status klaim; klik langsung membuka dan menyorot detail bukti klaim terkait.
- **Panel Ringkasan Klaim (Master-Detail)**:
  - **Daftar Klaim**: Menampilkan status verifikasi (`Didukung`, `Sebagian Didukung`, `Bertentangan`, `Belum Terverifikasi`), skor **Keyakinan**, indikator bilah progres, dan jumlah sumber.
  - **Detail Klaim**: Menampilkan pernyataan klaim lengkap, ringkasan analisis, daftar **Sumber Utama**, serta kartu **Bukti Rujukan** berisi tipe pencarian (`Pencarian Web`, `Jurnal Ilmiah`, `Dokumen Resmi`, `Ensiklopedia`, `Dokumen Pengguna`), sikap bukti (`Mendukung`, `Netral`, `Membantah`), skor **Kredibilitas**, skor **Relevansi**, tautan asli, dan **Kutipan Sumber**.
- **Anti-Halusinasi Sumber**: Backend melakukan pencarian web nyata melalui Tavily terlebih dahulu lalu memetakan URL asli secara ketat agar AI tidak pernah mengarang tautan palsu.
- **Mode Verifikasi Dasar dan Mendalam**: Mode **Dasar** memberi verifikasi cepat (pencarian `basic`), sedangkan Mode **Mendalam** memakai pencarian `advanced` beserta penalaran langkah demi langkah. Pengguna juga dapat mengklik **Lihat Mode Mendalam** pada pesan Mode Dasar untuk memperdalam analisis bukti melalui `/api/chat/deepen`.
- **Filter Sikap Sumber & Tampilan Fokus**: Menyaring kartu bukti berdasarkan sikapnya serta memperbesar panel ke mode layar penuh (`Perbesar`) untuk pembacaan yang lebih leluasa.

---

## Tech Stack

| Lapisan | Teknologi |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), Lucide React, `react-markdown`, `remark-gfm`, `clsx`, `tailwind-merge`, Oxlint |
| **Backend** | Node.js 22+, Express 5, CORS, Helmet, Express Rate Limit, Multer (`memoryStorage`), `pdf-parse`, Mammoth, Dotenv |
| **AI & Pencarian Web** | Zro API (`deepseek-v4.1-flash`, dukungan teks, penalaran, dan gambar/vision) serta Tavily Search API |
| **Deployment** | Vercel All-in-One (Static Frontend + Express Serverless Functions pada 1 domain, gratis tanpa kartu kredit) |

---

## Struktur Proyek

```text
HCI-HoreCintaIndonesia/
├── api/
│   └── index.js                    # Entry point Vercel Serverless untuk Express
├── client/                         # Aplikasi Frontend (React + Vite + Tailwind v4)
│   ├── public/
│   │   ├── favicon.svg
│   │   └── fritografi-icon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/               # Workspace, MessageList, MessageItem, Composer, Attachments
│   │   │   ├── claims/             # ClaimsOverview, ClaimListItem, ClaimDetailPanel, EvidenceCard
│   │   │   ├── layout/             # AppShell, TopHeader
│   │   │   ├── sidebar/            # Sidebar, SessionItem, SessionSearch
│   │   │   └── ui/                 # BrandLogo, Modal, ConfirmDialog, Toast
│   │   ├── context/                # ThemeContext & ChatContext (localStorage)
│   │   ├── data/                   # Starter prompts & dataset simulasi offline
│   │   ├── hooks/                  # useChat, useTheme, useAutoScroll, useKeyboardShortcuts
│   │   ├── services/               # chatService.js (integrasi /api/chat & /api/chat/deepen)
│   │   └── utils/                  # cn, dateGroups, fileAttachments, verificationLabels
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js              # Konfigurasi Tailwind v4 & proxy /api -> localhost:5000
├── server/                         # Aplikasi Backend (Express, stateless tanpa database)
│   ├── config/
│   │   └── env.js                  # Pemuatan & validasi environment variables
│   ├── middleware/
│   │   ├── errorHandler.js         # Penanganan error terpusat
│   │   ├── rateLimit.js            # Rate limiter per IP
│   │   └── upload.js               # Konfigurasi multer memoryStorage (3 file, 4 MB)
│   ├── routes/
│   │   └── chatRoutes.js           # Endpoint POST /api/chat dan POST /api/chat/deepen
│   ├── services/
│   │   ├── fileProcessor.js        # Ekstraksi PDF, DOCX, TXT/MD/CSV & gambar base64
│   │   ├── tavilyService.js        # Pencarian sumber web nyata + deteksi sapaan
│   │   └── zroService.js           # Integrasi Zro API (deepseek-v4.1-flash)
│   ├── utils/
│   │   └── responseNormalizer.js   # Parser JSON & Ground-Truth URL hydrator
│   ├── .env.example
│   ├── index.js
│   └── package.json
├── package.json                    # Script root (dev, dev:client, dev:server, install:all)
├── vercel.json                     # Konfigurasi Vercel All-in-One (frontend + /api/*)
└── README.md
```

---

## Prasyarat & Cara Menjalankan Lokal

### Prasyarat

- **Node.js** versi `22.x` atau lebih baru
- **npm** versi `10.x` atau lebih baru
- API Key gratis dari **Zro** (`zro.moonmath.ai`) dan **Tavily** (`app.tavily.com`)

### 1. Clone Repository & Pasang Dependensi

Jalankan perintah berikut di folder root proyek untuk memasang seluruh dependensi root, `client`, dan `server` sekaligus:

```bash
git clone <url-repository>
cd HCI-HoreCintaIndonesia
npm run install:all
```

### 2. Konfigurasi Variabel Lingkungan (`server/.env`)

Salin template `server/.env.example` menjadi `server/.env` lalu isi API key milikmu (file `.env` sudah masuk `.gitignore` sehingga tidak ikut ter-commit):

```env
PORT=5000
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:5173
ZRO_BASE_URL=https://zro.moonmath.ai/v1
ZRO_MODEL=deepseek-v4.1-flash
ZRO_API_KEY=isi_api_key_zro_kamu
TAVILY_API_KEY=isi_api_key_tavily_kamu
```

### 3. Jalankan Mode Development

Menjalankan server Express (`http://localhost:5000`) dan client Vite (`http://localhost:5173`) bersamaan dalam satu terminal:

```bash
npm run dev
```

Atau jalankan secara terpisah bila diperlukan:

```bash
npm run dev:client   # Hanya frontend (Vite)
npm run dev:server   # Hanya backend (Express dengan node --watch)
```

### 4. Linting & Build Produksi (Frontend)

```bash
npm run lint --prefix client
npm run build --prefix client
```

---

## Endpoint API Backend

- **`GET /api/health`**: Mengecek status kesehatan server, kesiapan variabel lingkungan, dan model aktif.
- **`POST /api/chat`**: Menerima JSON (`application/json`) untuk pesan teks saja atau `multipart/form-data` untuk pesan beserta 1 hingga 3 file lampiran (`message`, `sessionId`, `mode`, `history`, `files`). Mengembalikan `{ reply, mode, claims, followUps }`.
- **`POST /api/chat/deepen`**: Menerima `{ query, claims }` dan mengembalikan penalaran mendalam `{ mode: "comprehensive", reasoningByClaimId }` dari bukti yang sudah ada tanpa pencarian web ulang.

---

## Panduan Deployment Online di Vercel (100% Gratis, Tanpa Kartu Kredit)

Frontend (`client/`) dan Backend Express (`server/` melalui `api/index.js`) langsung di-deploy bersama dalam **1 proyek Vercel**:

1. Pastikan seluruh commit terbaru sudah di-push ke GitHub (`git push origin main`).
2. Buka `https://vercel.com` dan login menggunakan akun GitHub.
3. Klik **Add New** → **Project** → klik **Import** pada repository `HCI-HoreCintaIndonesia`.
4. Biarkan **Root Directory** tetap di root repository (`.` / kosong). Vercel otomatis membaca konfigurasi build, output `client/dist`, dan routing `/api/*` dari `vercel.json`.
5. Buka bagian **Environment Variables**, lalu tambahkan:
   - `ZRO_API_KEY` = *(API key Zro kamu)*
   - `TAVILY_API_KEY` = *(API key Tavily kamu)*
   - `ZRO_BASE_URL` = `https://zro.moonmath.ai/v1`
   - `ZRO_MODEL` = `deepseek-v4.1-flash`
   - `NODE_ENV` = `production`
6. Klik **Deploy** dan tunggu proses build selesai (~1 menit).
7. Uji alamat `https://<domain-kamu>.vercel.app/api/health` untuk memastikan backend merespons `"status": "ok"`, lalu buka `https://<domain-kamu>.vercel.app` untuk memakai **FritoGrafi**!

---

## Status Pengembangan

- [x] Setup struktur monorepo (`client`, `server`, dan script root)
- [x] Desain dan implementasi lengkap UI Frontend **FritoGrafi** (tema Modern Nusantara, mode Terang/Gelap, responsif, aksesibilitas)
- [x] Implementasi panel **Ringkasan Klaim** (Master-Detail, sitasi inline, filter sikap, modal layar penuh)
- [x] Implementasi upload file dan dokumen (tombol lampirkan, *drag and drop*, tempel gambar, pratinjau, dan sumber `Dokumen Pengguna`)
- [x] Implementasi backend Express dengan Zro (`deepseek-v4.1-flash`), Tavily Search API, parser PDF/DOCX/TXT/gambar, serta endpoint `/api/chat` dan `/api/chat/deepen`
- [x] Konfigurasi Vercel All-in-One (`vercel.json` dan `api/index.js`) untuk deployment 1 klik gratis tanpa kartu kredit
- [ ] Deployment online ke Vercel menggunakan akun tim
- [ ] Evaluasi HCI / *usability testing* (opsional sesuai kebutuhan laporan mata kuliah)
