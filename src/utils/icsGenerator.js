// ── iCalendar (.ics) Generator — RFC 5545 ─────────────────────────────────

const pad = (n) => String(n).padStart(2, '0');

function formatICSDate(dt) {
  return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}${pad(dt.getSeconds())}`;
}

function escapeText(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export function generateICSContent(eventList, baseWeekDates) {
  const dtStamp = formatICSDate(new Date());

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Daylight Calendar//Daylight Jadwal v1.0//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Daylight Jadwal',
    'X-WR-TIMEZONE:Asia/Jakarta',
  ];

  eventList.forEach((ev) => {
    const dayIndex  = ev.day !== undefined ? ev.day : 1;
    const targetDate = (baseWeekDates && baseWeekDates[dayIndex])
      ? new Date(baseWeekDates[dayIndex])
      : new Date();

    const startHour = Math.floor(ev.start);
    const startMin  = Math.round((ev.start - startHour) * 60);
    const endHour   = Math.floor(ev.end);
    const endMin    = Math.round((ev.end - endHour) * 60);

    const startDate = new Date(targetDate);
    startDate.setHours(startHour, startMin, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(endHour, endMin, 0, 0);

    const uid         = `daylight-${ev.id}-${startDate.getTime()}@daylight.app`;
    const summary     = escapeText(ev.title || 'Acara Daylight');
    const description = escapeText(`${ev.subtitle || ''}${ev.completed ? ' [Status: Selesai]' : ''}`);
    const categories  = ev.type === 'kerja' ? 'BUSINESS,WORK' : 'PERSONAL';

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtStamp}`);
    lines.push(`DTSTART:${formatICSDate(startDate)}`);
    lines.push(`DTEND:${formatICSDate(endDate)}`);
    lines.push(`SUMMARY:${summary}`);
    if (description) lines.push(`DESCRIPTION:${description}`);
    if (ev.subtitle && (ev.subtitle.includes('Google Meet') || ev.subtitle.includes('Meet'))) {
      lines.push('LOCATION:Google Meet (https://meet.google.com)');
    } else if (ev.subtitle) {
      lines.push(`LOCATION:${escapeText(ev.subtitle)}`);
    }
    lines.push(`CATEGORIES:${categories}`);
    lines.push(`STATUS:${ev.completed ? 'COMPLETED' : 'CONFIRMED'}`);
    lines.push('TRANSP:OPAQUE');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICSFile(filename, content) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href  = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
