import { useState } from 'react';
import { useToast } from '../../context/ToastContext';

export default function ProfileView({ currentUser }) {
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
        <div className="db-hint-text">Akun demo untuk proyek kuliah. Data akun disimpan secara lokal.</div>
      </div>
    </div>
  );
}
