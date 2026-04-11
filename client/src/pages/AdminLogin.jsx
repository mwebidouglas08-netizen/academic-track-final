import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { showToast } from '../components/Toast';
import api from '../utils/api';

export default function AdminLogin() {
  const { loginAdmin } = useAdmin();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.username || !form.password) { setErr('Both fields are required.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/admin/auth/login', form);
      loginAdmin(res.data.token, res.data.moderator);
      showToast('Admin access granted.', 'success');
      nav('/admin/dashboard');
    } catch (e) {
      setErr(e.response?.data?.error || 'Invalid credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f2240 0%, #1e3a6e 60%, #163060 100%)', padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 'var(--r3)', padding: '2.5rem',
          boxShadow: '0 20px 60px rgba(0,0,0,.3)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 58, height: 58, borderRadius: 14, background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, margin: '0 auto .9rem',
            }}>🛡️</div>
            <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--primary)' }}>Admin Portal</div>
            <div style={{ color: 'var(--red)', fontSize: '.76rem', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '.3rem', fontWeight: 600 }}>Restricted Access</div>
          </div>

          <form onSubmit={handle}>
            <div className="fg"><label>Admin Username</label><input type="text" placeholder="Enter username" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} /></div>
            <div className="fg"><label>Password</label><input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} /></div>
            {err && <div style={{ color: 'var(--red)', fontSize: '.82rem', marginBottom: '.8rem', background: 'var(--red-light)', padding: '.6rem .9rem', borderRadius: 'var(--r)' }}>{err}</div>}
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <><span className="spin" />&nbsp;Verifying…</> : 'Access Admin Portal'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '.82rem', color: 'rgba(255,255,255,.5)' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,.5)' }}>← Return to main site</Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '.8rem', fontSize: '.78rem', color: 'rgba(255,255,255,.35)' }}>
          Default: superadmin / Admin@1234
        </div>
      </div>
    </div>
  );
}
