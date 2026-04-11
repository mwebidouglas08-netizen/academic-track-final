import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../components/Toast';
import api from '../utils/api';

function AuthCard({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto .8rem' }}>🎓</div>
          <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary)' }}>AcademiTrack</div>
          <div style={{ color: 'var(--text2)', fontSize: '.88rem', marginTop: '.2rem' }}>Student Academic Portal</div>
        </div>
        <div className="card" style={{ borderRadius: 'var(--r3)', padding: '2.2rem', boxShadow: 'var(--shadow-md)' }}>
          {children}
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '.83rem', color: 'var(--text3)' }}>
          <Link to="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ regNumber: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.regNumber || !form.password) { setErr('All fields are required.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.student);
      showToast(`Welcome back, ${res.data.student.first_name}!`, 'success');
      nav('/app');
    } catch (e) {
      setErr(e.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <AuthCard>
      <h2 style={{ fontFamily: 'var(--font-h)', color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.3rem' }}>Sign In</h2>
      <form onSubmit={handle}>
        <div className="fg">
          <label>Registration Number</label>
          <input type="text" placeholder="e.g. REG/2024/001" value={form.regNumber}
            onChange={e => setForm(p => ({ ...p, regNumber: e.target.value }))} />
        </div>
        <div className="fg">
          <label>Password</label>
          <input type="password" placeholder="Your password" value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
        </div>
        {err && <div style={{ color: 'var(--red)', fontSize: '.82rem', marginBottom: '.8rem', background: 'var(--red-light)', padding: '.6rem .9rem', borderRadius: 'var(--r)' }}>{err}</div>}
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? <><span className="spin" />&nbsp;Signing in…</> : 'Sign In'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '.87rem', color: 'var(--text2)' }}>
        No account? <Link to="/register">Register here</Link>
      </div>
    </AuthCard>
  );
}

export function RegisterPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', regNumber: '', phone: '', email: '', academicLevel: '', department: '', researchTopic: '', password: '', password2: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handle = async (e) => {
    e.preventDefault();
    setErr('');
    const req = ['firstName', 'lastName', 'regNumber', 'phone', 'email', 'academicLevel', 'department', 'password'];
    if (req.some(k => !form[k])) { setErr('Please fill all required (*) fields.'); return; }
    if (form.password !== form.password2) { setErr('Passwords do not match.'); return; }
    if (form.password.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.student);
      showToast('Account created successfully!', 'success');
      nav('/app');
    } catch (e) {
      setErr(e.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <AuthCard>
      <h2 style={{ fontFamily: 'var(--font-h)', color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.3rem' }}>Create Account</h2>
      <form onSubmit={handle}>
        <div className="fgrid">
          <div className="fg"><label>First Name *</label><input type="text" placeholder="First name" value={form.firstName} onChange={set('firstName')} /></div>
          <div className="fg"><label>Last Name *</label><input type="text" placeholder="Last name" value={form.lastName} onChange={set('lastName')} /></div>
          <div className="fg full"><label>Registration Number *</label><input type="text" placeholder="REG/2024/001" value={form.regNumber} onChange={set('regNumber')} /></div>
          <div className="fg full"><label>Phone Number *</label><input type="tel" placeholder="+254 700 000 000" value={form.phone} onChange={set('phone')} /></div>
          <div className="fg full"><label>Email Address *</label><input type="email" placeholder="you@university.edu" value={form.email} onChange={set('email')} /></div>
          <div className="fg full">
            <label>Academic Level *</label>
            <select value={form.academicLevel} onChange={set('academicLevel')}>
              <option value="">— Select level —</option>
              <option>Bachelor's Degree</option>
              <option>Master's Degree</option>
              <option>PhD / Postgraduate</option>
            </select>
          </div>
          <div className="fg full"><label>Department / Faculty *</label><input type="text" placeholder="e.g. Computer Science" value={form.department} onChange={set('department')} /></div>
          <div className="fg full"><label>Research Topic <span style={{ color: 'var(--text3)' }}>(optional)</span></label><input type="text" placeholder="Your research area" value={form.researchTopic} onChange={set('researchTopic')} /></div>
          <div className="fg"><label>Password *</label><input type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} /></div>
          <div className="fg"><label>Confirm Password *</label><input type="password" placeholder="Repeat password" value={form.password2} onChange={set('password2')} /></div>
        </div>
        {err && <div style={{ color: 'var(--red)', fontSize: '.82rem', marginBottom: '.8rem', background: 'var(--red-light)', padding: '.6rem .9rem', borderRadius: 'var(--r)' }}>{err}</div>}
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? <><span className="spin" />&nbsp;Creating account…</> : 'Create Account'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '.87rem', color: 'var(--text2)' }}>
        Already registered? <Link to="/login">Sign in</Link>
      </div>
    </AuthCard>
  );
}
