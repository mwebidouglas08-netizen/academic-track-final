import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('at_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('at_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then(r => setUser(r.data))
      .catch(() => {
        localStorage.removeItem('at_token');
        localStorage.removeItem('at_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (token, student) => {
    localStorage.setItem('at_token', token);
    localStorage.setItem('at_user', JSON.stringify(student));
    setUser(student);
  };

  const logout = () => {
    localStorage.removeItem('at_token');
    localStorage.removeItem('at_user');
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, login, logout, loading }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
