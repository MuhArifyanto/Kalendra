import { useState } from 'react';
import {
  CalIcon, ClockIcon, MapPinIcon, GoogleCalIcon,
  CheckIcon2, TrashIcon, EditIcon, DownloadIcon, XIcon,
} from '../../icons';
import { EVENT_COLORS, HOURS, DAYS_FULL, MONTHS_ID, formatTime } from '../../utils/calendarHelpers';

export default function EventDetailModal({ event, weekDates, onClose, onDelete, onUpdate, onToggleComplete, onExportSingleICS }) {
  if (!event) return null;

  const [isEditing,    setIsEditing]    = useState(false);
  const [editTitle,    setEditTitle]    = useState(event.title    || '');
  const [editSubtitle, setEditSubtitle] = useState(event.subtitle || '');
  const [editDay,      setEditDay]      = useState(event.day   !== undefined ? event.day   : 1);
  const [editStart,    setEditStart]    = useState(event.start !== undefined ? event.start : 9);
  const [editEnd,      setEditEnd]      = useState(event.end   !== undefined ? event.end   : 10);
  const [editType,     setEditType]     = useState(event.type    || 'kerja');

  const c = EVENT_COLORS[event.color] || EVENT_COLORS.blue;

  const eventDate  = weekDates && event.day !== undefined ? weekDates[event.day] : null;
  const dateStr    = eventDate
    ? `${DAYS_FULL[eventDate.getDay()]}, ${eventDate.getDate()} ${MONTHS_ID[eventDate.getMonth()]} ${eventDate.getFullYear()}`
    : (event.day !== undefined ? DAYS_FULL[event.day] : 'Hari ini');

  const startTimeStr  = formatTime(event.start);
  const endTimeStr    = formatTime(event.end);
  const duration      = event.end - event.start;
  const durationStr   = duration % 1 === 0
    ? `${duration} jam`
    : `${Math.floor(duration)} jam ${Math.round((duration % 1) * 60)} menit`;

  const isMeet          = event.subtitle && event.subtitle.toLowerCase().includes('google meet');
  const endHourOptions  = [...HOURS.filter(h => h > editStart), (HOURS[HOURS.length - 1] + 1)];

  const handleStartChange = (val) => {
    const s = Number(val);
    setEditStart(s);
    if (Number(editEnd) <= s) setEditEnd(s + 1);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    if (onUpdate) {
      onUpdate({
        ...event,
        title:    editTitle.trim(),
        subtitle: editSubtitle.trim() || (editType === 'kerja' ? 'Ditambahkan manual' : 'Waktu pribadi'),
        day:      Number(editDay),
        start:    Number(editStart),
        end:      Number(editEnd),
        type:     editType,
        color:    editType === 'kerja' ? 'blue' : 'purple',
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="db-modal-overlay" onClick={onClose}>
      <div className="db-modal db-event-modal" onClick={e => e.stopPropagation()}>
        <div className="db-event-modal-accent" style={{ background: c.border }} />

        <div className="db-event-modal-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="db-event-badge" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
              <span className="db-event-badge-dot" style={{ background: c.text }} />
              {event.type === 'kerja' ? 'Kalender Kerja' : 'Kalender Pribadi'}
            </div>
            {!isEditing && onToggleComplete && (
              <button
                type="button"
                className={`db-event-status-pill ${event.completed ? 'is-completed' : ''}`}
                onClick={() => onToggleComplete(event.id)}
                title={event.completed ? 'Klik untuk tandai belum selesai' : 'Klik untuk tandai selesai'}
              >
                <CheckIcon2 /> {event.completed ? 'Selesai' : 'Tandai Selesai'}
              </button>
            )}
          </div>
          <button className="db-modal-close" onClick={onClose} aria-label="Tutup">
            <XIcon />
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="db-modal-body">
            <h2 className="db-event-modal-title" style={{ marginBottom: 14 }}>Ubah Acara</h2>
            <div className="db-form-group">
              <label className="db-form-label">Nama Acara</label>
              <input className="db-form-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} autoFocus />
            </div>
            <div className="db-form-group">
              <label className="db-form-label">Hari</label>
              <select className="db-form-select" value={editDay} onChange={e => setEditDay(Number(e.target.value))}>
                {DAYS_FULL.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div className="db-form-row">
              <div className="db-form-group">
                <label className="db-form-label">Mulai (Jam)</label>
                <select className="db-form-select" value={editStart} onChange={e => handleStartChange(e.target.value)}>
                  {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
                </select>
              </div>
              <div className="db-form-group">
                <label className="db-form-label">Selesai (Jam)</label>
                <select className="db-form-select" value={editEnd} onChange={e => setEditEnd(Number(e.target.value))}>
                  {endHourOptions.map(h => <option key={h} value={h}>{h}:00</option>)}
                </select>
              </div>
            </div>
            <div className="db-form-group">
              <label className="db-form-label">Keterangan / Lokasi</label>
              <input className="db-form-input" value={editSubtitle} onChange={e => setEditSubtitle(e.target.value)} />
            </div>
            <div className="db-form-group">
              <label className="db-form-label">Kategori</label>
              <select className="db-form-select" value={editType} onChange={e => setEditType(e.target.value)}>
                <option value="kerja">Kerja (Biru)</option>
                <option value="pribadi">Pribadi (Ungu)</option>
              </select>
            </div>
            <div className="db-modal-footer db-event-modal-footer" style={{ padding: '14px 0 0', marginTop: 16 }}>
              <button type="button" className="db-btn-outline" onClick={() => setIsEditing(false)}>Batal</button>
              <button type="submit" className="db-btn-primary">Simpan Perubahan</button>
            </div>
          </form>
        ) : (
          <>
            <div className="db-event-modal-body">
              <h2 className="db-event-modal-title" style={{ textDecoration: event.completed ? 'line-through' : 'none', opacity: event.completed ? 0.75 : 1 }}>
                {event.title}
                {event.completed && <span style={{ marginLeft: 8, fontSize: 13, color: '#16a34a', fontWeight: 600 }}>(Selesai)</span>}
              </h2>

              <div className="db-event-details-list">
                <div className="db-event-detail-item">
                  <span className="db-event-detail-icon"><CalIcon /></span>
                  <div className="db-event-detail-content">
                    <div className="db-event-detail-label">Hari & Tanggal</div>
                    <div className="db-event-detail-val">{dateStr}</div>
                  </div>
                </div>

                <div className="db-event-detail-item">
                  <span className="db-event-detail-icon"><ClockIcon /></span>
                  <div className="db-event-detail-content">
                    <div className="db-event-detail-label">Waktu & Durasi</div>
                    <div className="db-event-detail-val">
                      {startTimeStr} – {endTimeStr} WIB
                      <span className="db-event-duration-tag">{durationStr}</span>
                    </div>
                  </div>
                </div>

                {event.subtitle && (
                  <div className="db-event-detail-item">
                    <span className="db-event-detail-icon"><MapPinIcon /></span>
                    <div className="db-event-detail-content">
                      <div className="db-event-detail-label">Keterangan / Lokasi</div>
                      <div className="db-event-detail-val">{event.subtitle}</div>
                    </div>
                  </div>
                )}

                {isMeet && (
                  <div className="db-event-meet-box">
                    <GoogleCalIcon />
                    <div className="db-event-meet-text">
                      <div className="db-event-meet-title">Google Meet</div>
                      <div className="db-event-meet-sub">Tautan rapat daring terhubung</div>
                    </div>
                    <button type="button" className="db-event-meet-btn" onClick={() => window.open('https://meet.google.com', '_blank')}>
                      Gabung Rapat
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="db-modal-footer db-event-modal-footer">
              <button type="button" className="db-btn-danger" onClick={() => onDelete(event.id)}>
                <TrashIcon /> Hapus Acara
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="db-btn-outline" onClick={() => onExportSingleICS && onExportSingleICS(event)} title="Ekspor acara ini saja ke file .ics" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <DownloadIcon /> Ekspor .ics
                </button>
                <button type="button" className="db-btn-outline" onClick={() => setIsEditing(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <EditIcon /> Ubah
                </button>
                <button type="button" className="db-btn-primary" style={{ padding: '8px 20px' }} onClick={onClose}>
                  Tutup
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
