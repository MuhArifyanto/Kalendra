import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CalendarIcon, GoogleIcon, EyeIcon, ShieldIcon } from '../icons';

export default function LoginPage() {
  const { addToast }   = useToast();
  const navigate       = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [form, setForm]               = useState({ email: '', password: '' });
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errs = {};
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
    const result = login({ email: form.email, password: form.password });
    setLoading(false);

    if (result.ok) {
      addToast('Berhasil masuk! Selamat datang kembali. 🎉', 'success');
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
        <span className="divider-text">atau gunakan email</span>
        <div className="divider-line" />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="login-email" className="form-label label-email">Email</label>
          <input
            id="login-email" name="email" type="email"
            className={`form-input${errors.email ? ' error' : ''}`}
            placeholder="nama@contoh.id"
            value={form.email} onChange={handleChange}
            autoComplete="email" disabled={loading}
          />
          {errors.email && <p className="form-error-msg">⚠ {errors.email}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="login-password" className="form-label label-password">Kata sandi</label>
          <div className="input-wrapper">
            <input
              id="login-password" name="password"
              type={showPassword ? 'text' : 'password'}
              className={`form-input${errors.password ? ' error' : ''}`}
              placeholder="Minimal 6 karakter"
              value={form.password} onChange={handleChange}
              autoComplete="current-password" disabled={loading}
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
        Belum punya akun? <Link to="/register">Daftar</Link>
      </p>

      <div className="demo-note">
        <span className="demo-note-icon"><ShieldIcon /></span>
        <p className="demo-note-text">
          Mode demo proyek kuliah. Data disimpan di <strong>localStorage browser</strong> Anda — tidak dikirim ke server manapun.
        </p>
      </div>
    </div>
  );
}
