# 📅 Kalendra (Daylight) — Smart Calendar & Productivity Web App

> **Jadwal Lebih Rapi, Hari Lebih Terencana.**  
> Aplikasi web manajemen jadwal modern, responsif, dan interaktif dengan asisten AI pintar, visualisasi kalender fleksibel, dan ekspor standar iCalendar (.ics).

---

## 🌟 Gambaran Proyek

**Kalendra (Daylight)** adalah aplikasi kalender modern berbasis React 19 dan Vite yang dirancang dengan pendekatan *mobile-first*, performa ultra-ringan, serta arsitektur komponen yang bersih (*modular & component-driven*). Proyek ini sepenuhnya berfokus pada pengalaman pengguna (*Frontend UX/UI*) yang mulus di berbagai perangkat—mulai dari smartphone (iPhone & Android) hingga monitor desktop lebar.

---

## ✨ Fitur Unggulan (Frontend Showcase)

### 🗓 1. Kalender Multi-Tampilan Fleksibel
- **Tampilan Pekan (Week View)**: Grid 7 hari dengan grid jam dinamis dan garis penanda waktu aktual (*real-time ticking marker*).
- **Tampilan Harian (Day View)**: Format 1 kolom penuh yang sangat nyaman untuk melihat rincian jam kerja dan agenda harian di smartphone.
- **Tampilan Bulanan (Month Matrix)**: Matriks kalender bulanan dengan pill acara yang ringkas dan navigasi cepat antar tanggal.
- **Navigasi Cepat**: Tombol *Hari Ini*, navigasi pekan/bulan sebelumnya/berikutnya, dan kalender mini interaktif.

### 🤖 2. Asisten Penjadwalan AI Pintar (Simulasi Interaktif)
- **Chat Interaktif**: Simulasi asisten penjadwalan cerdas dengan riwayat pesan dan *auto-scroll* ke pesan terbaru.
- **Kartu Aksi Cepat**: Asisten merekomendasikan jadwal baru dalam bentuk kartu konfirmasi (*Ya*, *Ubah*, *Batal*). Mengklik "Ya" langsung memasukkan acara ke kalender!
- **Mobile Floating Action Button (FAB)**: Pada perangkat mobile/tablet (< 1024px), Asisten AI tampil sebagai tombol melayang `✨ Asisten` di pojok kanan bawah yang membuka *bottom sheet* elegan setinggi `85dvh`.

### 📱 3. Desain Responsif & Ramah Mobile
- **Navigasi Drawer**: Sidebar kiri berubah otomatis menjadi *off-canvas drawer* bersudut halus dengan overlay gelap di layar kecil.
- **Pencarian Adaptif**: Bilah pencarian desktop berubah menjadi tombol ikon `🔍` di mobile, yang dapat bertransformasi menjadi pencarian layar penuh (*full-width*) tanpa memotong logo atau elemen header.
- **Anti Auto-Zoom di iOS**: Semua input formulir dirancang dengan ukuran font minimal 16px untuk mencegah pembesaran otomatis (*auto-zoom*) yang mengganggu di Safari iOS.
- **Dukungan Safe-Area iPhone**: Menggunakan `viewport-fit=cover` dan fungsi `env(safe-area-inset-*)` untuk tampilan yang rapi pada perangkat dengan *notch* atau *Dynamic Island*.
- **Sentuhan Nyaman**: Semua tombol memiliki target sentuh minimal 44 × 44 px sesuai standar aksesibilitas mobile.

### ⚡ 4. Manajemen Acara & Pencarian Instan
- **Formulir Acara Baru**: Tambah jadwal lengkap dengan judul, kategori (*Kerja* / *Pribadi*), hari, jam mulai, dan durasi.
- **Detail & Aksi Acara**: Modal detail interaktif untuk melihat, mengubah, menandai selesai (*completed*), atau menghapus acara.
- **Undo Toast**: Notifikasi melayang dengan tombol "Urungkan (Undo)" setiap kali ada acara yang terhapus secara tidak sengaja.
- **Pencarian Real-Time**: Temukan acara secara instan berdasarkan judul, tag, atau hari.

### 📤 5. Ekspor Kalender RFC 5545 (.ics)
- Fitur generator iCalendar bawaan (*pure client-side*) yang kompatibel dengan **Google Calendar**, **Apple Calendar**, dan **Microsoft Outlook**.
- Mendukung ekspor seluruh jadwal aktif sekaligus maupun ekspor per acara individual.

### 🔐 6. Simulasi Autentikasi & Penyimpanan Lokal
- Manajemen sesi berbasis `localStorage` browser (*zero external database dependency*).
- Halaman Masuk (Login) dan Daftar (Register) lengkap dengan validasi formulir dan toast notifikasi.

---

## 🛠 Teknologi & Arsitektur Kode

| Lapisan | Teknologi | Penjelasan |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Library UI modern dengan performa rendering optimal |
| **Build Tool** | [Vite 8](https://vite.dev/) | Server dev berkecepatan tinggi dan *production bundler* ultra-cepat (~330 KB JS) |
| **Routing** | [React Router 7](https://reactrouter.com/) | Client-side routing dengan `BrowserRouter`, `ProtectedRoute`, dan `GuestRoute` |
| **Styling** | Vanilla CSS (Global Design System) | Token desain terpusat di `index.css`, animasi CSS3, glassmorphism, dan zero-runtime CSS |
| **State Management** | Custom Hooks + Context API | Pemisahan logika via `useCalendarNavigation`, `useEventManagement`, `useSearchFilter`, dan `ToastContext` |
| **Keandalan** | React Error Boundary | Mencegah *white screen of death* jika terjadi error data runtime |
| **Standar Ekspor** | RFC 5545 (iCalendar) | Kompatibilitas sinkronisasi kalender lintas platform |
| **Deployment** | Vercel & Netlify Ready | Konfigurasi SPA rewrite (`vercel.json` dan `_redirects`) sudah terpasang |

---

## 📁 Struktur Direktori

```text
kalendra/
├── public/
│   ├── _redirects          # SPA fallback routing untuk Netlify & Cloudflare
│   ├── favicon.svg         # Favicon resmi Daylight
│   └── icons.svg           # Sprite aset ikon
├── src/
│   ├── assets/             # Aset statis
│   ├── components/
│   │   ├── dashboard/      # Sub-komponen dashboard modular
│   │   │   ├── AIAssistant.jsx       # Panel chat asisten AI & bottom sheet
│   │   │   ├── CalEvent.jsx          # Komponen kartu acara kalender
│   │   │   ├── EventDetailModal.jsx  # Modal detail, edit, & ekspor .ics
│   │   │   ├── MiniCalendar.jsx      # Kalender mini dengan penanda dot acara
│   │   │   └── NewEventModal.jsx     # Dialog tambah jadwal baru
│   │   ├── ErrorBoundary.jsx         # Penanganan error runtime tingkat aplikasi
│   │   ├── Toast.jsx                 # Notifikasi toast mengambang
│   │   └── Topbar.jsx                # Header halaman autentikasi (Login/Register)
│   ├── context/
│   │   ├── AuthContext.jsx           # Manajemen sesi pengguna & localStorage
│   │   └── ToastContext.jsx          # Global toast dispatcher (tanpa prop-drilling)
│   ├── data/
│   │   ├── demoData.js               # Data awal chat AI & notifikasi demo
│   │   └── demoEvents.js             # Data awal jadwal kalender
│   ├── hooks/
│   │   ├── useCalendarNavigation.js  # Logika navigasi tanggal, hari, minggu, & bulan
│   │   ├── useEventManagement.js     # Logika CRUD acara & undo stack
│   │   └── useSearchFilter.js        # Logika filter kategori & pencarian instan
│   ├── icons/
│   │   └── index.jsx                 # Koleksi komponen ikon SVG terpusat
│   ├── pages/
│   │   ├── dashboard/                # Halaman utama aplikasi
│   │   │   ├── DashboardPage.jsx     # Layout utama & state dashboard
│   │   │   ├── ProfileView.jsx       # Tampilan rincian profil pengguna
│   │   │   ├── SettingsView.jsx      # Tampilan pengaturan kalender & status demo
│   │   │   └── SummaryView.jsx       # Tampilan agenda & statistik mingguan
│   │   ├── LoginPage.jsx             # Halaman autentikasi masuk
│   │   └── RegisterPage.jsx          # Halaman pembuatan akun baru
│   ├── utils/
│   │   ├── calendarHelpers.js        # Fungsi kalkulasi jam, format waktu, & tanggal
│   │   └── icsGenerator.js           # Generator format RFC 5545 iCalendar (.ics)
│   ├── App.jsx                       # Root routing & provider wrap
│   ├── index.css                     # Design system & stylesheet responsif terpusat
│   └── main.jsx                      # Entry point React DOM
├── index.html                        # Meta viewport cover & OpenGraph social share
├── package.json                      # Dependensi proyek
├── vercel.json                       # Konfigurasi SPA rewrite untuk Vercel
└── vite.config.js                    # Konfigurasi Vite & React plugin
```

---

## 🚀 Panduan Memulai (Quick Start)

### 1. Prasyarat
Pastikan Anda telah menginstal **Node.js** (versi 18 atau lebih baru) dan **npm** di komputer Anda.

### 2. Kloning Repositori
```bash
git clone https://github.com/MuhArifyanto/Kalendra.git
cd Kalendra
```

### 3. Instal Dependensi
```bash
npm install
```

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka browser dan akses `http://localhost:5173`.

### 5. Bangun untuk Produksi (Production Build)
```bash
npm run build
```
File siap saji (*production bundle*) akan dibuat di dalam folder `dist/`.

Untuk menguji hasil build produksi secara lokal:
```bash
npm run preview
```

---

## 🌐 Panduan Deployment

Proyek ini telah dikonfigurasi penuh untuk di-hosting langsung di platform statis modern:

### Opsi A: Vercel (Disarankan)
1. Hubungkan repositori GitHub Anda ke [Vercel](https://vercel.com/).
2. Konfigurasi build otomatis terdeteksi:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. File `vercel.json` akan otomatis menangani *client-side routing* agar tidak 404 saat halaman di-refresh.

### Opsi B: Netlify
1. Impor repositori ke [Netlify](https://www.netlify.com/).
2. Atur **Publish directory** ke `dist`.
3. File `public/_redirects` akan otomatis disalin ke `dist/_redirects` untuk memastikan routing SPA berjalan normal.

---

## 👨‍💻 Kontributor

Dikembangkan oleh **Muhammad Arifyanto**  
GitHub: [@MuhArifyanto](https://github.com/MuhArifyanto)

---

## 📄 Lisensi
Proyek ini bersifat open-source dan dilisensikan di bawah lisensi MIT.
