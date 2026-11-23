# FritoGrafi

**FritoGrafi** adalah aplikasi web chatbot berbasis *Large Language Model (LLM)* yang dirancang dengan fokus pada transparansi sumber melalui **verifikasi klaim rinci (KBP)**. Setiap pernyataan faktual dalam jawaban AI dipecah menjadi klaim yang dapat diperiksa beserta tingkat keyakinan, ringkasan verifikasi, sumber utama, dan kutipan langsung dari sumber terbuka.

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
- **Kontrol Percakapan Penuh**: Streaming teks bertahap, tombol **Hentikan**, **Salin**, **Ubah dan Kirim Ulang**, **Jawab Ulang**, penilaian (`👍` / `👎`), serta saran pertanyaan lanjutan.
- **Upload File dan Dokumen**: Mendukung lampiran dokumen (`PDF`, `DOCX`, `TXT`, `MD`, `CSV`) dan gambar (`PNG`, `JPG`, `WEBP`) hingga 3 file per pesan (maksimal 10 MB per file) melalui tombol lampirkan, *drag and drop*, maupun tempel gambar (`Ctrl+V`) lengkap dengan pratinjau.
- **Manajemen Riwayat (Mode Tamu Lokal)**: Multi-sesi percakapan tersimpan otomatis di `localStorage`, dikelompokkan berdasarkan waktu (*Hari Ini*, *Kemarin*, *7 Hari Terakhir*, *Lebih Lama*), dilengkapi pencarian instan (`Ctrl+K`), ubah judul inline, dan dialog konfirmasi hapus.

### Verifikasi Klaim & Referensi Sumber (KBP)

- **Penanda Sitasi Inline (`[1]`, `[2]`)**: Hover menampilkan pratinjau singkat status klaim; klik langsung membuka dan menyorot detail bukti klaim terkait.
- **Panel Ringkasan Klaim (Master-Detail)**:
  - **Daftar Klaim**: Menampilkan status verifikasi (`Didukung`, `Sebagian Didukung`, `Bertentangan`, `Belum Terverifikasi`), skor **Keyakinan**, indikator bilah progres, dan jumlah sumber.
  - **Detail Klaim**: Menampilkan pernyataan klaim lengkap, ringkasan analisis, daftar **Sumber Utama**, serta kartu **Bukti Rujukan** berisi tipe pencarian, sikap bukti (`Mendukung`, `Netral`, `Membantah`), skor **Kredibilitas**, skor **Relevansi**, tautan asli, dan **Kutipan Sumber**.
- **Mode Verifikasi Dasar dan Mendalam**: Pengguna dapat memilih mode sebelum mengirim pertanyaan atau meningkatkan tampilan klaim dari Mode Dasar ke Mode Mendalam secara langsung untuk melihat penalaran lengkap.
- **Filter Sikap Sumber & Tampilan Fokus**: Menyaring kartu bukti berdasarkan sikapnya serta memperbesar panel ke mode layar penuh (`Perbesar`) untuk pembacaan yang lebih leluasa.

---

## Tech Stack

| Lapisan | Teknologi |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), Lucide React, `react-markdown`, `remark-gfm`, `clsx`, `tailwind-merge`, Oxlint |
| **Backend** | Node.js 22+, Express 5, CORS |
| **Development Tooling** | Concurrently (menjalankan frontend dan backend bersamaan dari root) |

---

## Struktur Proyek

```text
HCI-HoreCintaIndonesia/
├── client/                         # Aplikasi Frontend (React + Vite + Tailwind v4)
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/               # Workspace, MessageList, MessageItem, Composer, Attachments
│   │   │   ├── claims/             # ClaimsOverview, ClaimListItem, ClaimDetailPanel, EvidenceCard
│   │   │   ├── layout/             # AppShell, TopHeader
│   │   │   ├── sidebar/            # Sidebar, SessionItem, SessionSearch
│   │   │   └── ui/                 # BrandLogo, Modal, ConfirmDialog, Toast
│   │   ├── context/                # ThemeContext & ChatContext (localStorage)
│   │   ├── data/                   # Starter prompts & dataset simulasi verifikasi klaim
│   │   ├── hooks/                  # useChat, useTheme, useAutoScroll, useKeyboardShortcuts
│   │   ├── services/               # chatService.js (abstraksi Mock -> API Express)
│   │   └── utils/                  # cn, dateGroups, fileAttachments, verificationLabels
│   ├── index.html
│   ├── package.json
│   └── vite.config.js              # Konfigurasi Tailwind v4 & proxy /api -> localhost:5000
├── server/                         # Aplikasi Backend (Express)
│   ├── index.js
│   └── package.json
├── package.json                    # Script root (dev, dev:client, dev:server, install:all)
└── README.md
```

---

## Prasyarat & Cara Menjalankan

### Prasyarat

- **Node.js** versi `22.x` atau lebih baru
- **npm** versi `10.x` atau lebih baru

### 1. Clone Repository & Pasang Dependensi

Jalankan perintah berikut di folder root proyek untuk memasang seluruh dependensi root, `client`, dan `server` sekaligus:

```bash
git clone <url-repository>
cd HCI-HoreCintaIndonesia
npm run install:all
```

### 2. Jalankan Mode Development

Menjalankan server Express (`http://localhost:5000`) dan client Vite (`http://localhost:5173`) bersamaan dalam satu terminal:

```bash
npm run dev
```

Atau jalankan secara terpisah bila diperlukan:

```bash
npm run dev:client   # Hanya frontend (Vite)
npm run dev:server   # Hanya backend (Express dengan node --watch)
```

### 3. Linting & Build Produksi (Frontend)

```bash
npm run lint --prefix client
npm run build --prefix client
```

---

## Integrasi Backend (Kontrak API)

Saat ini frontend berjalan menggunakan lapisan simulasi di `client/src/services/chatService.js` agar seluruh fitur antarmuka dan verifikasi klaim dapat diuji secara mandiri.

Ketika endpoint backend LLM selesai dibangun:

1. Sediakan endpoint `POST /api/chat` pada `server/index.js` (Vite sudah mem-proxy `/api` ke `http://localhost:5000`).
2. Ubah `USE_LIVE_API` menjadi `true` pada `client/src/services/chatService.js`.

### Format Request (`POST /api/chat`)

Untuk pesan teks saja, frontend mengirim JSON (`application/json`):

```json
{
  "message": "Benarkah jalan kaki 10.000 langkah per hari menurunkan risiko demensia?",
  "sessionId": "sess_12345678",
  "history": [
    { "role": "user", "content": "..." }
  ],
  "mode": "basic"
}
```

Jika pengguna melampirkan file, frontend otomatis mengirim `multipart/form-data` dengan field `message`, `sessionId`, `mode`, `history` (string JSON), dan `files` (maksimal 3 file, 10 MB per file).

### Format Response

```json
{
  "reply": "Penelitian tahun 2022 menunjukkan berjalan sekitar 10.000 langkah per hari berkaitan dengan penurunan risiko demensia hingga 50% [1].",
  "mode": "basic",
  "claims": [
    {
      "id": "claim_1",
      "index": 1,
      "verdict": "SUPPORTED",
      "confidence": 0.82,
      "statement": "Studi tahun 2022 menemukan berjalan 10.000 langkah per hari berkaitan dengan penurunan risiko demensia hingga 50%.",
      "summary": "Ringkasan kecocokan klaim terhadap sumber rujukan.",
      "reasoning": "Analisis penalaran lengkap yang ditampilkan pada mode Mendalam.",
      "keySources": [
        { "title": "Judul Sumber Utama", "url": "https://contoh.org/artikel" }
      ],
      "evidence": [
        {
          "id": "ev_1",
          "sourceType": "WEB_SEARCH",
          "stance": "SUPPORTS",
          "credibility": 0.78,
          "relevance": 0.92,
          "title": "Judul Artikel Rujukan",
          "url": "https://contoh.org/artikel",
          "snippet": "Kutipan teks relevan dari halaman sumber."
        }
      ]
    }
  ],
  "followUps": [
    "Apakah kecepatan jalan kaki lebih penting daripada jumlah langkah?"
  ]
}
```

Nilai enum yang didukung antarmuka:

- `verdict`: `"SUPPORTED"`, `"PARTIAL"`, `"CONTRADICTED"`, `"UNVERIFIED"`
- `stance`: `"SUPPORTS"`, `"NEUTRAL"`, `"CONTRADICTS"`
- `sourceType`: `"WEB_SEARCH"`, `"JOURNAL"`, `"OFFICIAL"`, `"ENCYCLOPEDIA"`, `"USER_DOCUMENT"`
- `mode`: `"basic"`, `"comprehensive"`

---

## Status Pengembangan

- [x] Setup struktur monorepo (`client`, `server`, dan script root)
- [x] Desain dan implementasi lengkap UI Frontend **FritoGrafi** (tema Modern Nusantara, mode Terang/Gelap, responsif, aksesibilitas)
- [x] Implementasi panel **Ringkasan Klaim** beserta mesin simulasi verifikasi frontend
- [x] Implementasi upload file dan dokumen (tombol lampirkan, *drag and drop*, tempel gambar, pratinjau, dan sumber `Dokumen Pengguna`)
- [ ] Integrasi backend Express dengan layanan LLM + pencarian sumber web (*grounding*)
- [ ] Pengujian kegunaan (*usability testing*) dan evaluasi HCI
