import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckIcon2 } from '../../icons';

export default function SettingsView({ currentUser }) {
  const { addToast } = useToast();
  const [voiceOn, setVoiceOn] = useState(false);

  return (
    <div className="db-page">
      <div className="db-page-header">
        <h1 className="db-page-title">Pengaturan</h1>
        <p className="db-page-subtitle">Sesuaikan kalender dan cara asisten membantu Anda.</p>
      </div>

      <div className="db-card" style={{paddingBottom: 24}}>
        <div className="set-row">
          <div>
            <div className="db-card-title" style={{marginBottom: 4}}>Koneksi Google Calendar</div>
            <div className="set-info">{currentUser?.email}</div>
          </div>
          <button className="db-btn-outline" onClick={() => addToast('Mode demo: Tidak dapat memutuskan koneksi.', 'error')}>
            Putuskan
          </button>
        </div>

        <div className="set-box">
          <CheckIcon2 /> <span>Kalender tersinkron (simulasi)</span>
        </div>
        <div className="db-hint-text">Mode proyek kuliah: koneksi Google disimulasikan, belum memakai OAuth atau API.</div>
      </div>

      <div className="db-card">
        <div className="db-card-title">Kalender & suara</div>

        <div className="db-form-group">
          <label className="db-form-label">Zona waktu</label>
          <select className="db-form-select">
            <option>GMT+7 · WIB (Jakarta)</option>
            <option>GMT+8 · WITA (Bali)</option>
            <option>GMT+9 · WIT (Jayapura)</option>
          </select>
        </div>

        <div className="db-form-group">
          <label className="db-form-label">Bahasa suara</label>
          <select className="db-form-select">
            <option>Bahasa Indonesia</option>
            <option>English</option>
          </select>
        </div>

        <div className="db-form-group" style={{marginBottom: 24}}>
          <label className="db-form-label">Pengingat acara</label>
          <select className="db-form-select">
            <option>10 menit sebelum acara</option>
            <option>30 menit sebelum acara</option>
            <option>1 jam sebelum acara</option>
          </select>
        </div>

        <div className="db-toggle-row">
          <div>
            <div className="db-toggle-label">Balasan suara</div>
            <div className="db-toggle-sub">Bacakan jawaban asisten secara otomatis.</div>
          </div>
          <div className={`toggle-switch ${voiceOn ? 'on' : ''}`} onClick={() => setVoiceOn(!voiceOn)} />
        </div>
      </div>

      <div className="db-card" style={{padding: 16}}>
        <div className="db-accordion">
          <span style={{fontSize: 10}}>▶</span> Pengujian status proyek
        </div>
      </div>

      <div className="db-footer-status">
        <CheckIcon2 /> Pengaturan tersimpan otomatis.
      </div>
    </div>
  );
}
