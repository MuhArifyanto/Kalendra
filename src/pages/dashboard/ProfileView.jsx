import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { LogoutIcon } from '../../icons';

export default function ProfileView({ currentUser, onLogout }) {
  const { addToast } = useToast();
  const [name,  setName]  = useState(currentUser?.name  || '');
  const [email, setEmail] = useState(currentUser?.email || '');

  const handleSave = () => {
    addToast('Profil berhasil disimpan (simulasi lokal).', 'success');
  };

  return (
    <div className="db-page">
      <div className="db-page-header">
        <h1 className="db-page-title">Profil</h1>
        <p className="db-page-subtitle">Informasi akun Anda.</p>
      </div>

      <div className="db-card">
        <div className="profile-avatar-large">{currentUser?.avatar}</div>

        <div className="db-form-group">
          <label className="db-form-label">Nama lengkap</label>
          <input className="db-form-input" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="db-form-group">
          <label className="db-form-label">Email</label>
          <input className="db-form-input" value={email} onChange={e => setEmail(e.target.value)} disabled />
        </div>

        <button className="db-btn-primary" onClick={handleSave}>Simpan profil</button>
        <div className="db-hint-text">Akun proyek Daylight. Data sesi akun aktif tersimpan di perangkat ini.</div>
      </div>

      {/* Account Session & Logout */}
      <div className="db-card" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="db-card-title" style={{ marginBottom: 4 }}>Keluar dari Akun</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              Akhiri sesi aktif Anda di browser ini dan kembali ke halaman masuk.
            </div>
          </div>
          <button
            type="button"
            className="db-btn-danger"
            onClick={onLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #ef4444',
              background: '#fef2f2',
              color: '#dc2626',
              fontWeight: 600,
              fontSize: 13.5,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <LogoutIcon /> Keluar dari Akun
          </button>
        </div>
      </div>
    </div>
  );
}
