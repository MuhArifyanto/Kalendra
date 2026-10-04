// ── Demo / Seed Events ──────────────────────────────────────────────────────
// Terpisah dari logic komponen agar modular dan mudah di-maintain.

/** Kembalikan daftar demo events yang tanggalnya diselaraskan dengan pekan saat ini */
export function createDemoEvents(baseDate = new Date()) {
  const today = new Date(baseDate);
  const sun = new Date(today);
  sun.setDate(today.getDate() - today.getDay());
  sun.setHours(0, 0, 0, 0);

  const getDateForDay = (dayIndex) => {
    const d = new Date(sun);
    d.setDate(sun.getDate() + dayIndex);
    return d;
  };

  return [
    { id: 1,  title: 'Rencana mingguan',          subtitle: 'Waktu pribadi',            start: 8,    end: 10,   day: 1, date: getDateForDay(1), color: 'purple', type: 'pribadi' },
    { id: 2,  title: 'Kerja fokus',               subtitle: 'Tanpa gangguan',           start: 8,    end: 10,   day: 2, date: getDateForDay(2), color: 'blue',   type: 'kerja'   },
    { id: 3,  title: 'Rapat desain',              subtitle: 'Tim desain · Google Meet', start: 8,    end: 10,   day: 3, date: getDateForDay(3), color: 'blue',   type: 'kerja'   },
    { id: 4,  title: 'Evaluasi mingguan',         subtitle: 'Tim produk · Google Meet', start: 10,   end: 12,   day: 5, date: getDateForDay(5), color: 'blue',   type: 'kerja'   },
    { id: 5,  title: 'Rapat desain',              subtitle: 'Tim desain · Google Meet', start: 13,   end: 14.5, day: 1, date: getDateForDay(1), color: 'red',    type: 'kerja'   },
    { id: 6,  title: 'Kerja fokus',               subtitle: 'Tanpa gangguan',           start: 10,   end: 12,   day: 4, date: getDateForDay(4), color: 'blue',   type: 'kerja'   },
    { id: 7,  title: 'Makan siang bersama Sarah', subtitle: 'Linda Coffee',             start: 12,   end: 13,   day: 2, date: getDateForDay(2), color: 'yellow', type: 'pribadi' },
    { id: 8,  title: 'Ngopi bersama Alex',        subtitle: 'Blue Bottle Coffee',       start: 13,   end: 14,   day: 5, date: getDateForDay(5), color: 'green',  type: 'pribadi' },
    { id: 9,  title: 'Tinjauan produk',           subtitle: 'Google Meet',              start: 14,   end: 15.5, day: 1, date: getDateForDay(1), color: 'purple', type: 'kerja'   },
    { id: 10, title: 'Demo klien',                subtitle: 'Google Meet',              start: 14,   end: 15.5, day: 3, date: getDateForDay(3), color: 'blue',   type: 'kerja'   },
    { id: 11, title: 'Koordinasi pemasaran',      subtitle: 'Ruang rapat A',            start: 15,   end: 16,   day: 1, date: getDateForDay(1), color: 'yellow', type: 'kerja'   },
  ];
}

export const DEMO_EVENTS = createDemoEvents();
export default DEMO_EVENTS;
