import { createContext, useContext, useState, useCallback } from 'react';
import { loginWithGooglePopup, logoutFirebase } from '../config/firebase';

const AuthContext = createContext(null);

const STORAGE_KEY = 'daylight_users';
const SESSION_KEY = 'daylight_session';

function sanitizeUsername(str, fallback = 'user') {
  if (!str) return fallback;
  const clean = str.toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_]/g, '');
  return clean || fallback;
}

const DEFAULT_USERS = [
  {
    id: 'demo-user-1',
    name: 'Demo User',
    username: 'demo',
    email: 'demo@daylight.app',
    passwordHash: btoa('password123'),
    createdAt: new Date().toISOString(),
    avatar: 'D',
    authProvider: 'local'
  }
];

function getUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    // Ensure all existing users have a username
    let modified = false;
    const usersWithUsername = parsed.map(u => {
      if (!u.username && u.email) {
        modified = true;
        return { ...u, username: sanitizeUsername(u.email.split('@')[0]) };
      }
      return u;
    });
    if (modified) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usersWithUsername));
    }
    return usersWithUsername;
  } catch {
    return DEFAULT_USERS;
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (session && !session.username && session.email) {
      session.username = sanitizeUsername(session.email.split('@')[0]);
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
    return session;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(getSession);

  const register = useCallback(({ name, username, email, password }) => {
    const users = getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = sanitizeUsername(username || cleanEmail.split('@')[0]);

    if (users.find(u => u.email && u.email.toLowerCase() === cleanEmail)) {
      return { ok: false, message: 'Email sudah terdaftar. Silakan masuk.' };
    }

    if (users.find(u => u.username && u.username.toLowerCase() === cleanUsername)) {
      return { ok: false, message: 'Username sudah digunakan. Silakan pilih username lain.' };
    }

    const newUser = {
      id:           Date.now().toString(),
      name:         name.trim(),
      username:     cleanUsername,
      email:        cleanEmail,
      // hash sederhana — HANYA DEMO, bukan untuk produksi
      passwordHash: btoa(password),
      createdAt:    new Date().toISOString(),
      avatar:       name.trim().charAt(0).toUpperCase(),
      authProvider: 'local',
    };

    saveUsers([...users, newUser]);

    const session = {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
      authProvider: 'local'
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCurrentUser(session);
    return { ok: true, user: session };
  }, []);

  const login = useCallback(({ identifier, email, password }) => {
    const rawId = (identifier || email || '').trim().toLowerCase();
    const cleanId = rawId.replace(/^@/, '');
    const users = getUsers();

    const user = users.find(u => {
      const emailMatch = u.email && u.email.toLowerCase() === cleanId;
      const usernameMatch = (u.username && u.username.toLowerCase() === cleanId) ||
                            (u.email && u.email.split('@')[0].toLowerCase() === cleanId);
      const passMatch = u.passwordHash === btoa(password);
      return (emailMatch || usernameMatch) && passMatch;
    });

    if (!user) {
      return { ok: false, message: 'Username/email atau kata sandi salah.' };
    }

    const session = {
      id: user.id,
      name: user.name,
      username: user.username || sanitizeUsername(user.email.split('@')[0]),
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      authProvider: user.authProvider || 'local'
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCurrentUser(session);
    return { ok: true, user: session };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const googleUser = await loginWithGooglePopup();
      const users = getUsers();
      let user = users.find(u => u.email.toLowerCase() === googleUser.email.toLowerCase());
      const baseUsername = sanitizeUsername(googleUser.email.split('@')[0]);

      if (!user) {
        user = {
          id: googleUser.id,
          name: googleUser.name,
          username: baseUsername,
          email: googleUser.email,
          createdAt: googleUser.createdAt,
          avatar: googleUser.avatar,
          photoURL: googleUser.photoURL,
          authProvider: 'google'
        };
        saveUsers([...users, user]);
      } else {
        user.name = googleUser.name || user.name;
        user.avatar = googleUser.avatar || user.avatar;
        user.username = user.username || baseUsername;
        user.photoURL = googleUser.photoURL || user.photoURL;
        user.authProvider = 'google';
        saveUsers(users.map(u => u.id === user.id ? user : u));
      }

      const session = {
        id: user.id,
        name: user.name,
        username: user.username,
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

  const updateProfile = useCallback(({ name, username }) => {
    if (!currentUser) return { ok: false, message: 'Tidak ada sesi aktif.' };
    const users = getUsers();
    const cleanUsername = sanitizeUsername(username || currentUser.username);

    // Cek apakah username sudah dipakai pengguna lain
    const existing = users.find(u => u.id !== currentUser.id && u.username && u.username.toLowerCase() === cleanUsername);
    if (existing) {
      return { ok: false, message: 'Username sudah digunakan akun lain. Silakan pilih username lain.' };
    }

    const updatedUser = {
      ...currentUser,
      name: name?.trim() || currentUser.name,
      username: cleanUsername,
      avatar: (name?.trim() || currentUser.name).charAt(0).toUpperCase()
    };

    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, ...updatedUser } : u);
    saveUsers(updatedUsers);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    return { ok: true, user: updatedUser };
  }, [currentUser]);

  const logout = useCallback(() => {
    logoutFirebase();
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, register, login, logout, loginWithGoogle, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
