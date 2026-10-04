import { useState } from 'react';
import { XIcon } from '../../icons';
import { HOURS, DAYS_FULL } from '../../utils/calendarHelpers';

export default function NewEventModal({ onClose, onAdd, initialData = {} }) {
  const [title,    setTitle]    = useState(initialData?.title    || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [day,      setDay]      = useState(initialData?.day   !== undefined ? initialData.day   : 1);
  const [start,    setStart]    = useState(initialData?.start !== undefined ? initialData.start : 9);
  const [end,      setEnd]      = useState(initialData?.end   !== undefined ? initialData.end   : Math.min((initialData?.start || 9) + 1, 20));
  const [type,     setType]     = useState(initialData?.type    || 'kerja');

  const endHourOptions = [...HOURS.filter(h => h > start), (HOURS[HOURS.length - 1] + 1)];

  const handleStartChange = (val) => {
    const s = Number(val);
    setStart(s);
    if (Number(end) <= s) setEnd(s + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title:    title.trim(),
      subtitle: subtitle.trim() || (type === 'kerja' ? 'Ditambahkan manual' : 'Waktu pribadi'),
      start:    Number(start),
      end:      Number(end),
      day:      Number(day),
      date:     initialData?.date || null,
      color:    type === 'kerja' ? 'blue' : 'purple',
      type,
    });
  };

  return (
    <div className="db-modal-overlay" onClick={onClose}>
      <div className="db-modal" onClick={e => e.stopPropagation()}>
        <div className="db-modal-header">
          <h3>Tambah Acara Baru</h3>
          <button className="db-modal-close" onClick={onClose}><XIcon /></button>
        </div>

        <form className="db-modal-body" onSubmit={handleSubmit}>
          <div className="db-form-group">
            <label className="db-form-label">Nama Acara</label>
            <input className="db-form-input" placeholder="Contoh: Rapat Tim" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
          </div>

          <div className="db-form-group">
            <label className="db-form-label">Hari</label>
            <select className="db-form-select" value={day} onChange={e => setDay(Number(e.target.value))}>
              {DAYS_FULL.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>

          <div className="db-form-row">
            <div className="db-form-group">
              <label className="db-form-label">Mulai (Jam)</label>
              <select className="db-form-select" value={start} onChange={e => handleStartChange(e.target.value)}>
                {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
              </select>
            </div>
            <div className="db-form-group">
              <label className="db-form-label">Selesai (Jam)</label>
              <select className="db-form-select" value={end} onChange={e => setEnd(Number(e.target.value))}>
                {endHourOptions.map(h => <option key={h} value={h}>{h}:00</option>)}
              </select>
            </div>
          </div>

          <div className="db-form-group">
            <label className="db-form-label">Keterangan / Lokasi (Opsional)</label>
            <input className="db-form-input" placeholder="Contoh: Tim produk · Google Meet" value={subtitle} onChange={e => setSubtitle(e.target.value)} />
          </div>

          <div className="db-form-group">
            <label className="db-form-label">Kategori</label>
            <select className="db-form-select" value={type} onChange={e => setType(e.target.value)}>
              <option value="kerja">Kerja (Biru)</option>
              <option value="pribadi">Pribadi (Ungu)</option>
            </select>
          </div>

          <div className="db-modal-footer">
            <button type="button" className="db-btn-outline" onClick={onClose}>Batal</button>
            <button type="submit" className="db-btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}
