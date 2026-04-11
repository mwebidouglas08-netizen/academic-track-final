import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('at_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('at_token');
      localStorage.removeItem('at_user');
      localStorage.removeItem('at_role');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
