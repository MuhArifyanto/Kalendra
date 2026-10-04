import { CalIcon, GridOutlineIcon, ClockIcon, CalLinesIcon, PlusIcon, ChevR } from '../../icons';
import { DAYS_FULL, MONTHS_ID, formatTime } from '../../utils/calendarHelpers';

export default function SummaryView({ events = [], today = new Date(), onSelectEvent, onOpenNewModal }) {
  const currentDayIndex = today.getDay();
  const todayEvents     = events.filter(e => e.day === currentDayIndex);

  return (
    <div className="db-summary">
      <div className="db-sum-header">
        <h1 className="db-sum-title">Ringkasan</h1>
        <p className="db-sum-subtitle">
          Sekilas jadwal Anda, {DAYS_FULL[currentDayIndex]}, {today.getDate()} {MONTHS_ID[today.getMonth()]} {today.getFullYear()}.
        </p>
      </div>

      <div className="db-sum-cards">
        <div className="db-sum-card">
          <div className="db-sum-card-header">
            <span>Acara hari ini</span>
            <span className="db-sum-card-icon"><CalLinesIcon /></span>
          </div>
          <div className="db-sum-card-value">{todayEvents.length}</div>
          <div className="db-sum-card-desc">Terjadwal hari ini</div>
        </div>

        <div className="db-sum-card">
          <div className="db-sum-card-header">
            <span>Acara minggu ini</span>
            <span className="db-sum-card-icon"><GridOutlineIcon /></span>
          </div>
          <div className="db-sum-card-value">{events.length}</div>
          <div className="db-sum-card-desc">Total acara aktif</div>
        </div>

        <div className="db-sum-card">
          <div className="db-sum-card-header">
            <span>Waktu luang hari ini</span>
            <span className="db-sum-card-icon"><ClockIcon /></span>
          </div>
          <div className="db-sum-card-value">
            {Math.max(0, 9 - todayEvents.reduce((acc, ev) => acc + (ev.end - ev.start), 0))} jam
          </div>
          <div className="db-sum-card-desc">Dalam rentang 09.00 - 18.00</div>
        </div>
      </div>

      <div className="db-sum-section">
        <div className="db-sum-section-header">
          <span className="db-sum-section-title">Acara berikutnya</span>
          <button className="db-btn-outline" onClick={onOpenNewModal}><PlusIcon /> Acara baru</button>
        </div>
        <div className="db-sum-list">
          {events.slice(0, 5).map(ev => (
            <div
              key={ev.id}
              className="db-sum-item"
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectEvent && onSelectEvent(ev)}
              title="Klik untuk melihat detail acara"
            >
              <div className={`db-sum-item-icon ${ev.color || 'blue'}`}><CalIcon /></div>
              <div className="db-sum-item-body">
                <div className="db-sum-item-title">{ev.title}</div>
                <div className="db-sum-item-time">
                  {DAYS_FULL[ev.day]} · {formatTime(ev.start)} – {formatTime(ev.end)} · {ev.subtitle}
                </div>
              </div>
              <div className="db-sum-item-arrow"><ChevR /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
