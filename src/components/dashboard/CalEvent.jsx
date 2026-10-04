import { EVENT_COLORS } from '../../utils/calendarHelpers';

export default function CalEvent({ event, top, height, onClick, isMatched = false, isDimmed = false }) {
  const c = EVENT_COLORS[event.color] || EVENT_COLORS.blue;

  return (
    <div
      className={`cal-event${event.completed ? ' completed' : ''}${isMatched ? ' search-matched' : ''}${isDimmed ? ' search-dimmed' : ''}`}
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(event.id));
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      style={{
        top, height,
        background:  event.completed ? '#f1f5f9' : c.bg,
        borderLeft:  `3px solid ${event.completed ? '#94a3b8' : c.border}`,
        color:       event.completed ? '#64748b' : c.text,
      }}
      title={`${event.title} - Klik detail / Seret untuk memindahkan jam`}
    >
      <div className="cal-event-title" style={{ textDecoration: event.completed ? 'line-through' : 'none' }}>
        {isMatched  && <span style={{ marginRight: 4, display: 'inline-block' }}>✨</span>}
        {event.completed && <span style={{ marginRight: 4, color: '#16a34a', fontWeight: 'bold' }}>✓</span>}
        {event.title}
      </div>
      {height > 36 && <div className="cal-event-sub">{event.subtitle}</div>}
    </div>
  );
}
