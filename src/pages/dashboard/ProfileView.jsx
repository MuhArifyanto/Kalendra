import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LogoutIcon } from '../../icons';

export default function ProfileView({ currentUser, onLogout }) {
  const { addToast } = useToast();
  const { updateProfile } = useAuth();
  const [name, setName]         = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email]                 = useState(currentUser?.email || '');
  const [saving, setSaving]     = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      addToast('Nama lengkap wajib diisi.', 'error');
      return;
    }
    const cleanUser = username.trim().replace(/^@/, '');
    if (!cleanUser) {
      addToast('Username wajib diisi.', 'error');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUser)) {
      addToast('Username harus 3-20 karakter (huruf, angka, _).', 'error');
      return;
    }

    setSaving(true);
    const result = updateProfile({ name: name.trim(), username: cleanUser });
    setSaving(false);

    if (result.ok) {
      addToast('Profil dan username berhasil disimpan! ✨', 'success');
    } else {
      addToast(result.message || 'Gagal menyimpan profil.', 'error');
    }
  };

  return (
    <div className="db-page">
      <div className="db-page-header">
        <h1 className="db-page-title">Profil Pengguna</h1>
        <p className="db-page-subtitle">Informasi identitas akun dan kredensial login Anda.</p>
      </div>

      <div className="db-card">
        <div className="profile-avatar-large">{currentUser?.avatar}</div>

        <div className="db-form-group">
          <label className="db-form-label">Nama lengkap</label>
          <input
            className="db-form-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nama lengkap Anda"
          />
        </div>

        <div className="db-form-group">
          <label className="db-form-label">Username (digunakan untuk login)</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{
              position: 'absolute',
              left: 12,
              fontWeight: 600,
              color: 'var(--color-primary)',
              fontSize: 14,
              pointerEvents: 'none'
            }}>@</span>
            <input
              className="db-form-input"
              style={{ paddingLeft: 30 }}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="username"
            />
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Anda dapat menggunakan username ini atau alamat email untuk masuk.
          </div>
        </div>

        <div className="db-form-group">
          <label className="db-form-label">Email</label>
          <input className="db-form-input" value={email} disabled />
        </div>

        <button className="db-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
        <div className="db-hint-text">Data akun dan sesi aktif tersimpan aman di browser Anda.</div>
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
