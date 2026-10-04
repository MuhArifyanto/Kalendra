import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CalendarIcon, GoogleIcon, EyeIcon, ShieldIcon } from '../icons';

export default function LoginPage() {
  const { addToast }   = useToast();
  const navigate       = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [form, setForm]               = useState({ identifier: '', password: '' });
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errs = {};
    const id = form.identifier.trim();
    if (!id) {
      errs.identifier = 'Username atau email wajib diisi';
    } else if (id.includes('@')) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id)) {
        errs.identifier = 'Format email tidak valid';
      }
    } else if (id.length < 3) {
      errs.identifier = 'Username minimal 3 karakter';
    }

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
    const result = login({ identifier: form.identifier.trim(), password: form.password });
    setLoading(false);

    if (result.ok) {
      addToast(`Berhasil masuk! Selamat datang kembali, ${result.user?.name || 'Pengguna'}. 🎉`, 'success');
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
      addToast(`Selamat datang, ${result.user?.name || 'Pengguna'}! 🎉`, 'success');
      navigate('/dashboard');
    } else {
      addToast(result.message, 'error');
    }
  };

  return (
    <div className="auth-card">
      <div className="card-icon"><CalendarIcon /></div>

      <h1 className="card-title">Selamat datang kembali</h1>
      <p className="card-subtitle">
        <span className="blue">Jadwal lebih rapi,</span>{' '}
        <span className="orange">hari lebih terencana.</span>
      </p>

      <button
        id="btn-google-login"
        className="btn-google"
        type="button"
        onClick={handleGoogle}
        disabled={loading || googleLoading}
      >
        <GoogleIcon />
        {googleLoading ? 'Menghubungkan ke Google...' : 'Masuk dengan Google'}
      </button>

      <div className="divider">
        <div className="divider-line" />
        <span className="divider-text">atau gunakan username & kata sandi</span>
        <div className="divider-line" />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="login-identifier" className="form-label label-email">Username atau Email</label>
          <input
            id="login-identifier"
            name="identifier"
            type="text"
            className={`form-input${errors.identifier ? ' error' : ''}`}
            placeholder="Username (misal: demo) atau email"
            value={form.identifier}
            onChange={handleChange}
            autoComplete="username"
            disabled={loading}
          />
          {errors.identifier && <p className="form-error-msg">⚠ {errors.identifier}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="login-password" className="form-label label-password">Kata sandi</label>
          <div className="input-wrapper">
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className={`form-input${errors.password ? ' error' : ''}`}
              placeholder="Minimal 6 karakter"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              disabled={loading}
            />
            <button type="button" className="toggle-pw" onClick={() => setShowPassword(v => !v)}>
              <EyeIcon show={showPassword} />
            </button>
          </div>
          {errors.password && <p className="form-error-msg">⚠ {errors.password}</p>}
        </div>

        <button id="btn-submit-login" type="submit" className={`btn-primary${loading ? ' loading' : ''}`} disabled={loading}>
          {loading ? <><span className="btn-spinner" />Memverifikasi...</> : 'Masuk'}
        </button>
      </form>

      <p className="switch-link">
        Belum punya akun? <Link to="/register">Daftar akun baru</Link>
      </p>

      <div className="demo-note">
        <span className="demo-note-icon"><ShieldIcon /></span>
        <p className="demo-note-text">
          Anda bisa masuk menggunakan <strong>Username</strong> atau <strong>Email</strong> terdaftar, atau langsung dengan akun <strong>Google</strong>.
        </p>
      </div>
    </div>
  );
}
