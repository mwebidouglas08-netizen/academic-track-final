import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AdminCtx = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('at_admin')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('at_admin_token');
    if (!token) { setLoading(false); return; }
    // Temporarily set token so the interceptor picks it up
    const prev = localStorage.getItem('at_token');
    localStorage.setItem('at_token', token);
    api.get('/admin/auth/me')
      .then(r => setAdmin(r.data))
      .catch(() => {
        localStorage.removeItem('at_admin_token');
        localStorage.removeItem('at_admin');
      })
      .finally(() => {
        if (prev) localStorage.setItem('at_token', prev);
        else localStorage.removeItem('at_token');
        setLoading(false);
      });
  }, []);

  const loginAdmin = (token, mod) => {
    localStorage.setItem('at_admin_token', token);
    localStorage.setItem('at_admin', JSON.stringify(mod));
    setAdmin(mod);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('at_admin_token');
    localStorage.removeItem('at_admin');
    setAdmin(null);
  };

  // Admin API helper: always uses admin token
  const adminApi = {
    get: (url) => {
      const t = localStorage.getItem('at_admin_token');
      return api.get(url, { headers: { Authorization: `Bearer ${t}` } });
    },
    post: (url, data) => {
      const t = localStorage.getItem('at_admin_token');
      return api.post(url, data, { headers: { Authorization: `Bearer ${t}` } });
    },
    patch: (url, data) => {
      const t = localStorage.getItem('at_admin_token');
      return api.patch(url, data, { headers: { Authorization: `Bearer ${t}` } });
    },
    delete: (url) => {
      const t = localStorage.getItem('at_admin_token');
      return api.delete(url, { headers: { Authorization: `Bearer ${t}` } });
    },
  };

  return <AdminCtx.Provider value={{ admin, loginAdmin, logoutAdmin, loading, adminApi }}>{children}</AdminCtx.Provider>;
}

export const useAdmin = () => useContext(AdminCtx);
