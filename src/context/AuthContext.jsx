import { createContext, useContext, useState, useCallback } from 'react';
import { loginWithGooglePopup, logoutFirebase } from '../config/firebase';

const AuthContext = createContext(null);

const STORAGE_KEY = 'daylight_users';
const SESSION_KEY = 'daylight_session';

function getUsers() {
  try   { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getSession() {
  try   { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(getSession);

  const register = useCallback(({ name, email, password }) => {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, message: 'Email sudah terdaftar. Silakan masuk.' };
    }
    const newUser = {
      id:           Date.now().toString(),
      name,
      email,
      // hash sederhana — HANYA DEMO, bukan untuk produksi
      passwordHash: btoa(password),
      createdAt:    new Date().toISOString(),
      avatar:       name.charAt(0).toUpperCase(),
      authProvider: 'local',
    };
    saveUsers([...users, newUser]);
    const session = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
      authProvider: 'local'
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCurrentUser(session);
    return { ok: true };
  }, []);

  const login = useCallback(({ email, password }) => {
    const users = getUsers();
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === btoa(password));
    if (!user) return { ok: false, message: 'Email atau kata sandi salah.' };
    const session = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      authProvider: user.authProvider || 'local'
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCurrentUser(session);
    return { ok: true };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const googleUser = await loginWithGooglePopup();
      const users = getUsers();
      let user = users.find(u => u.email.toLowerCase() === googleUser.email.toLowerCase());
      if (!user) {
        user = {
          id: googleUser.id,
          name: googleUser.name,
          email: googleUser.email,
          createdAt: googleUser.createdAt,
          avatar: googleUser.avatar,
          photoURL: googleUser.photoURL,
          authProvider: 'google'
        };
        saveUsers([...users, user]);
      } else {
        // Update user avatar/photo if available
        user.name = googleUser.name || user.name;
        user.avatar = googleUser.avatar || user.avatar;
        user.photoURL = googleUser.photoURL || user.photoURL;
        user.authProvider = 'google';
        saveUsers(users.map(u => u.id === user.id ? user : u));
      }

      const session = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        photoURL: user.photoURL,
        createdAt: user.createdAt,
        authProvider: 'google'
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setCurrentUser(session);
      return { ok: true, user: session };
    } catch (err) {
      console.error('Google login error:', err);
      let message = 'Gagal masuk dengan akun Google.';
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Login Google dibatalkan.';
      } else if (err.code === 'auth/unauthorized-domain') {
        message = 'Domain ini belum diizinkan di Firebase Console (Authorized Domains).';
      } else if (err.code === 'auth/popup-blocked') {
        message = 'Jendela pop-up Google terblokir oleh browser. Izinkan pop-up untuk melanjutkan.';
      } else if (err.message) {
        message = err.message;
      }
      return { ok: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    logoutFirebase();
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, register, login, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
