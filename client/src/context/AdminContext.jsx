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

  const adminApi = {
    get: (url) => api.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem('at_admin_token')}` } }),
    post: (url, data) => api.post(url, data, { headers: { Authorization: `Bearer ${localStorage.getItem('at_admin_token')}` } }),
    patch: (url, data) => api.patch(url, data, { headers: { Authorization: `Bearer ${localStorage.getItem('at_admin_token')}` } }),
    delete: (url) => api.delete(url, { headers: { Authorization: `Bearer ${localStorage.getItem('at_admin_token')}` } }),
  };

  return <AdminCtx.Provider value={{ admin, loginAdmin, logoutAdmin, loading, adminApi }}>{children}</AdminCtx.Provider>;
}

export const useAdmin = () => useContext(AdminCtx);
