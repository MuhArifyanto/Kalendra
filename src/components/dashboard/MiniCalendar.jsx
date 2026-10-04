import { useState } from 'react';
import {
  ChevL, ChevR, PlusIcon,
} from '../../icons';
import { getMiniCalDays, MONTHS_ID, isSameDay } from '../../utils/calendarHelpers';

export default function MiniCalendar({ selected, onSelect, calFilter, events }) {
  const [view, setView] = useState(() => ({ y: selected.getFullYear(), m: selected.getMonth() }));
  const days  = getMiniCalDays(view.y, view.m);
  const today = new Date();

  const prev = () => setView(v => {
    const m = v.m === 0 ? 11 : v.m - 1;
    return { y: v.m === 0 ? v.y - 1 : v.y, m };
  });
  const next = () => setView(v => {
    const m = v.m === 11 ? 0 : v.m + 1;
    return { y: v.m === 11 ? v.y + 1 : v.y, m };
  });

  return (
    <div className="mini-cal">
      <div className="mini-cal-header">
        <span className="mini-cal-month">{MONTHS_ID[view.m]} {view.y}</span>
        <div className="mini-cal-nav">
          <button onClick={prev}><ChevL /></button>
          <button onClick={next}><ChevR /></button>
        </div>
      </div>

      <div className="mini-cal-grid-header">
        {['M','S','S','R','K','J','S'].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="mini-cal-grid">
        {days.map((d, i) => {
          if (!d) return <span key={i} />;
          const dt     = new Date(view.y, view.m, d);
          const isToday = isSameDay(dt, today);
          const isSel   = isSameDay(dt, selected);
          return (
            <button
              key={i}
              className={`mini-cal-day${isToday ? ' today' : ''}${isSel ? ' selected' : ''}`}
              onClick={() => onSelect(dt)}
            >
              <span className="mini-cal-day-text">{d}</span>
              {events.some(e => {
                if (!calFilter || !calFilter[e.type]) return false;
                if (e.date) {
                  const eDate = e.date instanceof Date ? e.date : new Date(e.date);
                  return isSameDay(eDate, dt);
                }
                return e.day === dt.getDay();
              }) && (
                <div className="mini-cal-indicator" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
