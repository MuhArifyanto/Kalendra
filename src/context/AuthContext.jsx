import { createContext, useContext, useState, useCallback } from 'react';

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
    };
    saveUsers([...users, newUser]);
    const session = { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar, createdAt: newUser.createdAt };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCurrentUser(session);
    return { ok: true };
  }, []);

  const login = useCallback(({ email, password }) => {
    const users = getUsers();
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === btoa(password));
    if (!user) return { ok: false, message: 'Email atau kata sandi salah.' };
    const session = { id: user.id, name: user.name, email: user.email, avatar: user.avatar, createdAt: user.createdAt };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setCurrentUser(session);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
