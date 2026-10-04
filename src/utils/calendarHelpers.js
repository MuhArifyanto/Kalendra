// ── Calendar Helper Utilities & Constants ──────────────────────────────────

export const DAYS_ID   = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
export const DAYS_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export const HOURS       = Array.from({ length: 13 }, (_, i) => i + 7); // 07:00 – 19:00
export const PX_PER_HOUR = 64;
export const START_HOUR  = 7;

export const EVENT_COLORS = {
  blue:   { bg: '#dbeafe', border: '#93c5fd', text: '#1d4ed8' },
  purple: { bg: '#ede9fe', border: '#c4b5fd', text: '#6d28d9' },
  red:    { bg: '#fee2e2', border: '#fca5a5', text: '#b91c1c' },
  green:  { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46' },
  yellow: { bg: '#fef9c3', border: '#fde047', text: '#854d0e' },
};

/** Kembalikan 7 Date mulai Minggu dari pekan yang mengandung baseDate */
export function getWeekDates(baseDate) {
  const d   = new Date(baseDate);
  const day = d.getDay();
  const sun = new Date(d);
  sun.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(sun);
    dt.setDate(sun.getDate() + i);
    return dt;
  });
}

/** Kembalikan array sel mini-calendar (null = padding) */
export function getMiniCalDays(year, month) {
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  return cells;
}

/** Kembalikan array sel month-view (35 atau 42 sel) */
export function getMonthViewDays(year, month) {
  const firstDayOfWeek    = new Date(year, month, 1).getDay();
  const totalDaysCurrent  = new Date(year, month + 1, 0).getDate();
  const totalDaysPrev     = new Date(year, month, 0).getDate();
  const days = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({ dayNumber: totalDaysPrev - i, date: new Date(year, month - 1, totalDaysPrev - i), isCurrentMonth: false });
  }
  for (let d = 1; d <= totalDaysCurrent; d++) {
    days.push({ dayNumber: d, date: new Date(year, month, d), isCurrentMonth: true });
  }
  const totalCells = days.length > 35 ? 42 : 35;
  for (let d = 1; d <= totalCells - days.length; d++) {
    days.push({ dayNumber: d, date: new Date(year, month + 1, d), isCurrentMonth: false });
  }
  return days;
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()   === b.getMonth()   &&
    a.getDate()    === b.getDate()
  );
}

export function formatTime(hour) {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
