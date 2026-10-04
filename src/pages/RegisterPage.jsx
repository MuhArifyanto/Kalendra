import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CalendarIcon, GoogleIcon, EyeIcon, ShieldIcon } from '../icons';

function PasswordStrength({ password }) {
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6)             score++;
    if (password.length >= 10)            score++;
    if (/[A-Z]/.test(password))           score++;
    if (/[0-9]/.test(password))           score++;
    if (/[^A-Za-z0-9]/.test(password))   score++;
    if (score <= 1) return { level: 1, label: 'Lemah',  color: '#e05555' };
    if (score <= 3) return { level: 2, label: 'Sedang', color: '#e07b39' };
    return              { level: 3, label: 'Kuat',   color: '#2dbb7c' };
  };
  const { level, label, color } = getStrength();
  if (!password) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 3 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= level ? color : '#dce8f0', transition: 'background 0.3s' }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 500 }}>{label}</span>
    </div>
  );
}

export default function RegisterPage() {
  const { addToast }     = useToast();
  const navigate         = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [form, setForm]               = useState({ name: '', username: '', email: '', password: '' });
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nama lengkap wajib diisi';
    else if (form.name.trim().length < 2) errs.name = 'Nama minimal 2 karakter';

    const cleanUsername = form.username.trim().replace(/^@/, '');
    if (!cleanUsername) {
      errs.username = 'Username wajib diisi';
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
      errs.username = 'Username harus 3-20 karakter (huruf, angka, atau underscore _)';
    }

    if (!form.email) errs.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Format email tidak valid';

    if (!form.password) errs.password = 'Kata sandi wajib diisi';
    else if (form.password.length < 6) errs.password = 'Minimal 6 karakter';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = register({
      name: form.name.trim(),
      username: form.username.trim().replace(/^@/, ''),
      email: form.email,
      password: form.password
    });
    setLoading(false);

    if (result.ok) {
      addToast(`Akun @${result.user?.username || form.username} berhasil dibuat! Selamat datang di Daylight 🌤`, 'success');
      navigate('/dashboard');
    } else {
      addToast(result.message, 'error');
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);

    if (result.ok) {
      addToast(`Akun Google berhasil terhubung! Selamat datang, ${result.user?.name || 'Pengguna'}! 🎉`, 'success');
      navigate('/dashboard');
    } else {
      addToast(result.message, 'error');
    }
  };

  return (
    <div className="auth-card">
      <div className="card-icon"><CalendarIcon /></div>

      <h1 className="card-title">Buat akun daylight</h1>
      <p className="card-subtitle">
        <span className="blue">Jadwal lebih rapi,</span>{' '}
        <span className="orange">hari lebih terencana.</span>
      </p>

      <button
        id="btn-google-register"
        className="btn-google"
        type="button"
        onClick={handleGoogle}
        disabled={loading || googleLoading}
      >
        <GoogleIcon />
        {googleLoading ? 'Menghubungkan ke Google...' : 'Daftar dengan Google'}
      </button>

      <div className="divider">
        <div className="divider-line" />
        <span className="divider-text">atau daftar akun baru</span>
        <div className="divider-line" />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="register-name" className="form-label label-name">Nama lengkap</label>
          <input
            id="register-name" name="name" type="text"
            className={`form-input${errors.name ? ' error' : ''}`}
            placeholder="Nama Anda"
            value={form.name} onChange={handleChange}
            autoComplete="name" disabled={loading}
          />
          {errors.name && <p className="form-error-msg">⚠ {errors.name}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="register-username" className="form-label">Username</label>
          <input
            id="register-username" name="username" type="text"
            className={`form-input${errors.username ? ' error' : ''}`}
            placeholder="username (misal: arifyanto)"
            value={form.username} onChange={handleChange}
            autoComplete="username" disabled={loading}
          />
          {errors.username && <p className="form-error-msg">⚠ {errors.username}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="register-email" className="form-label label-email">Email</label>
          <input
            id="register-email" name="email" type="email"
            className={`form-input${errors.email ? ' error' : ''}`}
            placeholder="nama@contoh.id"
            value={form.email} onChange={handleChange}
            autoComplete="email" disabled={loading}
          />
          {errors.email && <p className="form-error-msg">⚠ {errors.email}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="register-password" className="form-label label-password">Kata sandi</label>
          <div className="input-wrapper">
            <input
              id="register-password" name="password"
              type={showPassword ? 'text' : 'password'}
              className={`form-input${errors.password ? ' error' : ''}`}
              placeholder="Minimal 6 karakter"
              value={form.password} onChange={handleChange}
              autoComplete="new-password" disabled={loading}
            />
            <button type="button" className="toggle-pw" onClick={() => setShowPassword(v => !v)}>
              <EyeIcon show={showPassword} />
            </button>
          </div>
          {errors.password && <p className="form-error-msg">⚠ {errors.password}</p>}
          <PasswordStrength password={form.password} />
        </div>

        <button id="btn-submit-register" type="submit" className={`btn-primary${loading ? ' loading' : ''}`} disabled={loading}>
          {loading ? <><span className="btn-spinner" />Mendaftarkan...</> : 'Daftar'}
        </button>
      </form>

      <p className="switch-link">
        Sudah punya akun? <Link to="/">Masuk</Link>
      </p>

      <div className="demo-note">
        <span className="demo-note-icon"><ShieldIcon /></span>
        <p className="demo-note-text">
          Data akun disimpan aman di <strong>browser lokal Anda</strong>. Anda dapat masuk menggunakan <strong>Username</strong> atau <strong>Email</strong>.
        </p>
      </div>
    </div>
  );
}
