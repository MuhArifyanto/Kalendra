// ── Demo / Seed Data ───────────────────────────────────────────────────────
export { DEMO_EVENTS, createDemoEvents } from './demoEvents';

export const INITIAL_CHAT_HISTORY = [
  { id: 1, role: 'user', text: 'Jadwalkan koordinasi tim Kamis depan pukul 15:00.' },
  {
    id: 2, role: 'ai',
    text: 'Berikut jadwal yang saya siapkan. Apakah sudah sesuai?',
    card: {
      icon: '📅', title: 'Koordinasi tim',
      date: 'Kamis, 29 Oktober 2026', time: '15:00 – WIB',
      eventData: { title: 'Koordinasi tim', subtitle: 'Dijadwalkan via AI', start: 15, end: 16, day: 4, color: 'blue', type: 'kerja' },
    },
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 1, icon: '⏰', iconBg: '#eff6ff', iconColor: '#2563eb',
    title: 'Demo klien dimulai dalam 15 menit',
    desc: 'Google Meet dengan tim eksternal · 14:00 WIB', time: '15 mnt lalu', unread: true, type: 'event',
  },
  {
    id: 2, icon: '⚠️', iconBg: '#fffbeb', iconColor: '#d97706',
    title: 'Jadwal padat di hari Kamis',
    desc: 'Asisten AI mendeteksi 3 rapat berturut-turut tanpa jeda istirahat.', time: '1 jam lalu', unread: true, type: 'ai',
  },
  {
    id: 3, icon: '🔄', iconBg: '#f0fdf4', iconColor: '#16a34a',
    title: 'Sinkronisasi Google Calendar berhasil',
    desc: '11 acara terbaru berhasil diselaraskan otomatis.', time: '2 jam lalu', unread: true, type: 'sync',
  },
  {
    id: 4, icon: '📊', iconBg: '#faf5ff', iconColor: '#9333ea',
    title: 'Ringkasan mingguan Anda sudah siap',
    desc: 'Cek 7 jam waktu fokus dan produktivitas minggu ini.', time: 'Kemarin', unread: true, type: 'summary',
  },
];
