import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { showToast } from '../components/Toast';

const LEVELS = ['Department', 'School Faculty', 'Postgraduate Board'];

function StatusBadge({ status }) {
  const m = { Approved: 'b-green', Rejected: 'b-red', Submitted: 'b-blue', Reviewing: 'b-amber' };
  return <span className={`badge ${m[status] || 'b-gray'}`}>{status}</span>;
}
function LevelBadge({ level }) {
  const m = { Department: 'b-primary', 'School Faculty': 'b-gold', 'Postgraduate Board': 'b-blue' };
  return <span className={`badge ${m[level] || 'b-gray'}`}>{level}</span>;
}
function Modal({ id, title, onClose, children }) {
  return (
    <div id={id} className="moverlay">
      <div className="modal">
        <div className="mhdr"><div className="mtitle">{title}</div><button className="mclose" onClick={onClose}>✕</button></div>
        {children}
      </div>
    </div>
  );
}

const ADMIN_NAV = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard', group: 'Overview' },
  { id: 'students', icon: '👥', label: 'Students', group: 'Overview' },
  { id: 'submissions', icon: '📤', label: 'Submissions', group: 'Overview' },
  { id: 'notifications', icon: '🔔', label: 'Notifications', group: 'Communication' },
  { id: 'messages', icon: '💬', label: 'Messages', group: 'Communication' },
  { id: 'moderators', icon: '👮', label: 'Moderators', group: 'Management' },
  { id: 'settings', icon: '⚙️', label: 'Settings', group: 'Management' },
];

export default function AdminDashboard() {
  const { admin, logoutAdmin, adminApi } = useAdmin();
  const nav = useNavigate();
  const [panel, setPanel] = useState('dashboard');
  const [data, setData] = useState({ stats: {}, students: [], submissions: [], notifications: [], messages: [], moderators: [] });
  const [modal, setModal] = useState(null);
  const [reviewSub, setReviewSub] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => { if (!admin) nav('/admin/login'); }, [admin, nav]);

  const load = useCallback(async (section) => {
    try {
      if (section === 'dashboard' || section === 'stats') {
        const r = await adminApi.get('/admin/stats');
        setData(d => ({ ...d, stats: r.data }));
      }
      if (section === 'students') {
        const r = await adminApi.get('/admin/students');
        setData(d => ({ ...d, students: r.data }));
        // Refresh notification recipient list too
        const sel = document.getElementById('ntf-to');
        if (sel) {
          sel.innerHTML = '<option value="all">All Students</option>' + r.data.map(s => `<option value="${s.id}">${s.first_name} ${s.last_name}</option>`).join('');
        }
      }
      if (section === 'submissions') {
        const r = await adminApi.get('/admin/submissions');
        setData(d => ({ ...d, submissions: r.data }));
      }
      if (section === 'notifications') {
        const r = await adminApi.get('/admin/notifications');
        setData(d => ({ ...d, notifications: r.data }));
      }
      if (section === 'messages') {
        const r = await adminApi.get('/admin/messages');
        setData(d => ({ ...d, messages: r.data }));
      }
      if (section === 'moderators') {
        const r = await adminApi.get('/admin/moderators');
        setData(d => ({ ...d, moderators: r.data }));
      }
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to load data.', 'error');
    }
  }, [adminApi]);

  useEffect(() => {
    if (!admin) return;
    load('dashboard');
    load('stats');
  }, [admin, load]);

  const switchPanel = (p) => { setPanel(p); load(p); if (p === 'dashboard') load('stats'); };

  const groups = [...new Set(ADMIN_NAV.map(n => n.group))];

  if (!admin) return null;

  // ── Panels ──────────────────────────────────────────────
  const panels = {
    dashboard: <AdminDash stats={data.stats} onNav={switchPanel} />,
    students: <AdminStudents students={data.students} onAdd={() => setModal('add-student')} onDelete={async (id) => {
      if (!confirm('Remove this student and all their data?')) return;
      try { await adminApi.delete(`/admin/students/${id}`); load('students'); showToast('Student removed.', 'success'); }
      catch (e) { showToast(e.response?.data?.error || 'Failed.', 'error'); }
    }} />,
    submissions: <AdminSubmissions submissions={data.submissions} onReview={(s) => { setReviewSub(s); setModal('review-sub'); }} />,
    notifications: <AdminNotifications notifications={data.notifications} students={data.students} adminApi={adminApi} onRefresh={() => load('notifications')} />,
    messages: <AdminMessages messages={data.messages} adminApi={adminApi} onRefresh={() => load('messages')} />,
    moderators: <AdminModerators moderators={data.moderators} adminRole={admin?.role} onAdd={() => setModal('add-mod')} onDelete={async (id) => {
      if (!confirm('Remove this moderator?')) return;
      try { await adminApi.delete(`/admin/moderators/${id}`); load('moderators'); showToast('Moderator removed.', 'success'); }
      catch (e) { showToast(e.response?.data?.error || 'Failed.', 'error'); }
    }} />,
    settings: <AdminSettings />,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: 230, background: '#0f2240', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '1.3rem 1.4rem', borderBottom: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: '1.4rem' }}>🛡️</div>
          <div>
            <div style={{ fontFamily: 'var(--font-h)', fontSize: '.97rem', color: '#e2e8f0', lineHeight: 1.1 }}>AcademiTrack</div>
            <div style={{ fontSize: '.62rem', color: '#ef4444', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: 1 }}>Admin Portal</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '.8rem 0' }}>
          {groups.map(g => (
            <div key={g}>
              <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '2px', textTransform: 'uppercase', padding: '.9rem 1.3rem .3rem' }}>{g}</div>
              {ADMIN_NAV.filter(n => n.group === g).map(n => (
                <div key={n.id}
                  onClick={() => switchPanel(n.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9, padding: '.7rem 1.3rem',
                    cursor: 'pointer', fontSize: '.87rem', transition: 'all .14s',
                    color: panel === n.id ? '#fff' : 'rgba(255,255,255,.55)',
                    background: panel === n.id ? 'rgba(255,255,255,.1)' : 'transparent',
                    borderLeft: `3px solid ${panel === n.id ? '#3b82f6' : 'transparent'}`,
                  }}>
                  <span>{n.icon}</span><span>{n.label}</span>
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div style={{ padding: '1rem 1.3rem', borderTop: '1px solid rgba(255,255,255,.1)' }}>
          <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.45)', marginBottom: '.4rem' }}>{admin?.name}</div>
          <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.3)', marginBottom: '.7rem' }}>{admin?.role}</div>
          <button className="btn btn-ghost btn-sm btn-block" style={{ color: 'rgba(255,255,255,.6)', borderColor: 'rgba(255,255,255,.2)' }}
            onClick={() => { logoutAdmin(); nav('/admin/login'); }}>Logout</button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, boxShadow: 'var(--shadow)' }}>
          <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', color: 'var(--primary)' }}>
            {ADMIN_NAV.find(n => n.id === panel)?.icon} {ADMIN_NAV.find(n => n.id === panel)?.label || 'Dashboard'}
          </div>
          <div style={{ fontSize: '.84rem', color: 'var(--text2)' }}>
            Logged in as <strong style={{ color: 'var(--primary)' }}>{admin?.username}</strong>
          </div>
        </div>
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          {panels[panel] || panels.dashboard}
        </main>
      </div>

      {/* Modals */}
      {modal === 'add-student' && (
        <AddStudentModal adminApi={adminApi} onClose={() => setModal(null)} onDone={() => { setModal(null); load('students'); }} />
      )}
      {modal === 'add-mod' && (
        <AddModModal adminApi={adminApi} onClose={() => setModal(null)} onDone={() => { setModal(null); load('moderators'); }} />
      )}
      {modal === 'review-sub' && reviewSub && (
        <ReviewModal sub={reviewSub} adminApi={adminApi} onClose={() => { setModal(null); setReviewSub(null); }}
          onDone={() => { setModal(null); setReviewSub(null); load('submissions'); }} />
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────
function AdminDash({ stats, onNav }) {
  const cards = [
    { label: 'Total Students', val: stats.students || 0, color: 'var(--primary)' },
    { label: 'Submissions', val: stats.submissions || 0, color: 'var(--accent)' },
    { label: 'Approved', val: stats.approved || 0, color: 'var(--green)' },
    { label: 'Messages', val: stats.messages || 0, color: 'var(--amber)' },
    { label: 'Notifications', val: stats.notifications || 0, color: 'var(--gold)' },
  ];
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>System Overview</div>
      <div className="sgrid">
        {cards.map(c => <div key={c.label} className="scard"><div className="sval" style={{ color: c.color }}>{c.val}</div><div className="slb">{c.label}</div></div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.3rem' }}>
        <div className="card">
          <div className="card-t">🚀 Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            <button className="btn btn-primary btn-sm" onClick={() => onNav('submissions')}>📤 Review Submissions</button>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav('students')}>👥 Manage Students</button>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav('notifications')}>🔔 Send Notification</button>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav('messages')}>💬 View Messages</button>
          </div>
        </div>
        <div className="card">
          <div className="card-t">ℹ️ System Info</div>
          <table style={{ width: '100%', fontSize: '.87rem', borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td style={{ color: 'var(--text2)', padding: '.4rem 0', width: '50%' }}>Approval Rate</td>
                <td style={{ fontWeight: 600 }}>{stats.submissions ? Math.round((stats.approved / stats.submissions) * 100) : 0}%</td></tr>
              <tr><td style={{ color: 'var(--text2)', padding: '.4rem 0' }}>Pending Messages</td><td style={{ fontWeight: 600 }}>{stats.messages || 0}</td></tr>
              <tr><td style={{ color: 'var(--text2)', padding: '.4rem 0' }}>Status</td><td><span className="badge b-green">● Online</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminStudents({ students, onAdd, onDelete }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--primary)' }}>All Students</div>
        <button className="btn btn-primary btn-sm" onClick={onAdd}>+ Add Student</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="tbl-wrap">
          <table className="dtbl">
            <thead><tr><th>Name</th><th>Reg No.</th><th>Phone</th><th>Level</th><th>Department</th><th>Subs</th><th>Joined</th><th></th></tr></thead>
            <tbody>
              {students.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text3)', padding: '2rem' }}>No students yet.</td></tr>}
              {students.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 500 }}>{s.first_name} {s.last_name}</td>
                  <td className="tsm muted">{s.reg_number}</td>
                  <td className="tsm">{s.phone || '—'}</td>
                  <td><span className="badge b-primary">{s.academic_level?.split(' ')[0]}</span></td>
                  <td className="tsm">{s.department}</td>
                  <td>{s.submission_count || 0}</td>
                  <td className="tsm muted">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => onDelete(s.id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminSubmissions({ submissions, onReview }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>All Submissions</div>
      <div className="card" style={{ padding: 0 }}>
        <div className="tbl-wrap">
          <table className="dtbl">
            <thead><tr><th>Title</th><th>Student</th><th>Type</th><th>Level</th><th>Status</th><th>AI Score</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {submissions.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text3)', padding: '2rem' }}>No submissions yet.</td></tr>}
              {submissions.map(s => (
                <tr key={s.id}>
                  <td style={{ maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.title}>{s.title}</td>
                  <td className="tsm">{s.first_name} {s.last_name}<br /><span className="muted">{s.reg_number}</span></td>
                  <td><span className="badge b-blue">{s.type}</span></td>
                  <td><LevelBadge level={s.current_level} /></td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>{s.ai_score > 0 ? <span style={{ fontWeight: 600, color: s.ai_score >= 80 ? 'var(--green)' : s.ai_score >= 60 ? 'var(--amber)' : 'var(--red)' }}>{s.ai_score}</span> : '—'}</td>
                  <td className="tsm muted">{new Date(s.submitted_at).toLocaleDateString()}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => onReview(s)}>Review</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminNotifications({ notifications, students, adminApi, onRefresh }) {
  const [form, setForm] = useState({ recipientType: 'all', recipientId: '', title: '', message: '' });
  const [loading, setLoading] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) { showToast('Title and message are required.', 'error'); return; }
    setLoading(true);
    try {
      await adminApi.post('/admin/notifications', form);
      setForm({ recipientType: 'all', recipientId: '', title: '', message: '' });
      showToast('Notification sent!', 'success');
      onRefresh();
    } catch (e) { showToast(e.response?.data?.error || 'Failed.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Send Notifications</div>
      <div className="card">
        <div className="card-t">📢 New Notification</div>
        <form onSubmit={send}>
          <div className="fg">
            <label>Recipient</label>
            <select value={form.recipientType} onChange={e => setForm(p => ({ ...p, recipientType: e.target.value, recipientId: '' }))}>
              <option value="all">All Students</option>
              <option value="student">Specific Student</option>
            </select>
          </div>
          {form.recipientType === 'student' && (
            <div className="fg">
              <label>Select Student</label>
              <select value={form.recipientId} onChange={e => setForm(p => ({ ...p, recipientId: e.target.value }))}>
                <option value="">— Choose student —</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.reg_number})</option>)}
              </select>
            </div>
          )}
          <div className="fg"><label>Title</label><input type="text" placeholder="Notification title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
          <div className="fg"><label>Message</label><textarea rows={4} placeholder="Notification message…" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} /></div>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <><span className="spin" />&nbsp;Sending…</> : 'Send Notification'}</button>
        </form>
      </div>
      <div className="card">
        <div className="card-t">📋 Sent History ({notifications.length})</div>
        {notifications.length === 0 ? <p className="muted tsm">No notifications sent yet.</p>
          : notifications.map(n => (
            <div key={n.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '1rem', marginBottom: '.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem', flexWrap: 'wrap', gap: '.4rem' }}>
                <strong>{n.title}</strong>
                <span className="tsm muted">{new Date(n.created_at).toLocaleDateString()} → {n.recipient_type === 'all' ? 'All Students' : n.recipient_name || 'Student'}</span>
              </div>
              <div className="tsm muted">{n.message}</div>
            </div>
          ))}
      </div>
    </div>
  );
}

function AdminMessages({ messages, adminApi, onRefresh }) {
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState({});

  const sendReply = async (id) => {
    const reply = replies[id];
    if (!reply?.trim()) return;
    setLoading(p => ({ ...p, [id]: true }));
    try {
      await adminApi.post(`/admin/messages/${id}/reply`, { reply });
      setReplies(p => ({ ...p, [id]: '' }));
      showToast('Reply sent!', 'success');
      onRefresh();
    } catch { showToast('Failed to send reply.', 'error'); }
    finally { setLoading(p => ({ ...p, [id]: false })); }
  };

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Student Messages</div>
      {messages.length === 0 ? <div className="card"><p className="muted">No messages from students.</p></div>
        : messages.map(m => (
          <div key={m.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem', flexWrap: 'wrap', gap: '.5rem' }}>
              <strong>{m.subject}</strong>
              <span className="tsm muted">{m.first_name} {m.last_name} ({m.reg_number}) · {new Date(m.created_at).toLocaleDateString()}</span>
            </div>
            <div className="tsm" style={{ color: 'var(--text)', marginBottom: '.8rem', lineHeight: 1.6 }}>{m.body}</div>
            {m.reply ? (
              <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--r)', padding: '.75rem', borderLeft: '3px solid var(--primary)' }}>
                <div style={{ fontSize: '.74rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '.25rem' }}>Your reply:</div>
                <div className="tsm">{m.reply}</div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <input type="text" placeholder="Type your reply…" value={replies[m.id] || ''}
                  onChange={e => setReplies(p => ({ ...p, [m.id]: e.target.value }))}
                  style={{ flex: 1, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--r)', padding: '.55rem .9rem', color: 'var(--text)', fontSize: '.87rem', outline: 'none' }} />
                <button className="btn btn-primary btn-sm" onClick={() => sendReply(m.id)} disabled={loading[m.id]}>
                  {loading[m.id] ? <span className="spin" /> : 'Reply'}
                </button>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}

function AdminModerators({ moderators, adminRole, onAdd, onDelete }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--primary)' }}>Moderators</div>
        {adminRole === 'Super Admin' && <button className="btn btn-primary btn-sm" onClick={onAdd}>+ Add Moderator</button>}
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="tbl-wrap">
          <table className="dtbl">
            <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr></thead>
            <tbody>
              {moderators.map(m => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 500 }}>{m.name}</td>
                  <td className="tsm muted">@{m.username}</td>
                  <td className="tsm">{m.email}</td>
                  <td><span className={`badge ${m.role === 'Super Admin' ? 'b-red' : m.role === 'Senior Moderator' ? 'b-gold' : 'b-blue'}`}>{m.role}</span></td>
                  <td className="tsm muted">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td>{adminRole === 'Super Admin' && m.role !== 'Super Admin' && <button className="btn btn-danger btn-sm" onClick={() => onDelete(m.id)}>Remove</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminSettings() {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>System Settings</div>
      <div className="card">
        <div className="card-t">📋 Submission Scoring Weights</div>
        <p className="tsm muted" style={{ marginBottom: '1rem' }}>AI scoring weights are configured server-side. Contact your system administrator to change them.</p>
        <div className="fgrid">
          <div className="scard"><div className="sval">25%</div><div className="slb">Proposal</div></div>
          <div className="scard"><div className="sval">35%</div><div className="slb">Results</div></div>
          <div className="scard"><div className="sval">20%</div><div className="slb">Presentation</div></div>
          <div className="scard"><div className="sval">20%</div><div className="slb">Publication</div></div>
        </div>
      </div>
      <div className="card">
        <div className="card-t">🔐 Security</div>
        <p className="tsm muted">Change your admin password by contacting the Super Admin. Ensure you use a strong, unique password.</p>
      </div>
    </div>
  );
}

// ── Modals ─────────────────────────────────────────────────
function AddStudentModal({ adminApi, onClose, onDone }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', regNumber: '', phone: '', email: '', academicLevel: "Bachelor's Degree", department: '', researchTopic: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.regNumber || !form.phone || !form.email || !form.department || !form.password) {
      setErr('Please fill all required fields.'); return;
    }
    setLoading(true);
    try { await adminApi.post('/admin/students', form); showToast('Student added!', 'success'); onDone(); }
    catch (e) { setErr(e.response?.data?.error || 'Failed to add student.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="moverlay open">
      <div className="modal">
        <div className="mhdr"><div className="mtitle">Add New Student</div><button className="mclose" onClick={onClose}>✕</button></div>
        <form onSubmit={submit}>
          <div className="fgrid">
            <div className="fg"><label>First Name *</label><input type="text" placeholder="First name" value={form.firstName} onChange={set('firstName')} /></div>
            <div className="fg"><label>Last Name *</label><input type="text" placeholder="Last name" value={form.lastName} onChange={set('lastName')} /></div>
            <div className="fg full"><label>Registration Number *</label><input type="text" placeholder="REG/2024/001" value={form.regNumber} onChange={set('regNumber')} /></div>
            <div className="fg full"><label>Phone *</label><input type="tel" placeholder="+254 700 000 000" value={form.phone} onChange={set('phone')} /></div>
            <div className="fg full"><label>Email</label><input type="email" placeholder="student@university.edu" value={form.email} onChange={set('email')} /></div>
            <div className="fg full"><label>Academic Level</label>
              <select value={form.academicLevel} onChange={set('academicLevel')}>
                <option>Bachelor's Degree</option><option>Master's Degree</option><option>PhD / Postgraduate</option>
              </select>
            </div>
            <div className="fg full"><label>Department *</label><input type="text" placeholder="Department" value={form.department} onChange={set('department')} /></div>
            <div className="fg full"><label>Research Topic</label><input type="text" placeholder="Optional" value={form.researchTopic} onChange={set('researchTopic')} /></div>
            <div className="fg full"><label>Password *</label><input type="password" placeholder="Temporary password" value={form.password} onChange={set('password')} /></div>
          </div>
          {err && <div style={{ color: 'var(--red)', fontSize: '.82rem', marginBottom: '.8rem', background: 'var(--red-light)', padding: '.6rem .9rem', borderRadius: 'var(--r)' }}>{err}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? <><span className="spin" />&nbsp;Adding…</> : 'Add Student'}</button>
        </form>
      </div>
    </div>
  );
}

function AddModModal({ adminApi, onClose, onDone }) {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', role: 'Moderator' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.email || !form.password) { setErr('All fields are required.'); return; }
    setLoading(true);
    try { await adminApi.post('/admin/moderators', form); showToast('Moderator added!', 'success'); onDone(); }
    catch (e) { setErr(e.response?.data?.error || 'Failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="moverlay open">
      <div className="modal">
        <div className="mhdr"><div className="mtitle">Add Moderator</div><button className="mclose" onClick={onClose}>✕</button></div>
        <form onSubmit={submit}>
          <div className="fg"><label>Full Name *</label><input type="text" placeholder="Dr. Jane Smith" value={form.name} onChange={set('name')} /></div>
          <div className="fg"><label>Username *</label><input type="text" placeholder="jsmith" value={form.username} onChange={set('username')} /></div>
          <div className="fg"><label>Email *</label><input type="email" placeholder="moderator@university.edu" value={form.email} onChange={set('email')} /></div>
          <div className="fg"><label>Password *</label><input type="password" placeholder="Set password" value={form.password} onChange={set('password')} /></div>
          <div className="fg"><label>Role</label>
            <select value={form.role} onChange={set('role')}>
              <option>Moderator</option><option>Senior Moderator</option><option>Super Admin</option>
            </select>
          </div>
          {err && <div style={{ color: 'var(--red)', fontSize: '.82rem', marginBottom: '.8rem', background: 'var(--red-light)', padding: '.6rem .9rem', borderRadius: 'var(--r)' }}>{err}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? <><span className="spin" />&nbsp;Adding…</> : 'Add Moderator'}</button>
        </form>
      </div>
    </div>
  );
}

function ReviewModal({ sub, adminApi, onClose, onDone }) {
  const [score, setScore] = useState(sub.manual_score || sub.ai_score || '');
  const [notes, setNotes] = useState(sub.moderator_notes || '');
  const [advLevel, setAdvLevel] = useState(sub.current_level);
  const [loading, setLoading] = useState(false);

  const act = async (action) => {
    setLoading(true);
    try {
      await adminApi.patch(`/admin/submissions/${sub.id}`, {
        action, manualScore: score ? parseInt(score) : undefined,
        moderatorNotes: notes, advanceToLevel: advLevel,
      });
      showToast(action === 'approve' ? 'Approved!' : action === 'reject' ? 'Rejected.' : 'Level advanced!', action === 'reject' ? 'error' : 'success');
      onDone();
    } catch (e) { showToast(e.response?.data?.error || 'Action failed.', 'error'); }
    finally { setLoading(false); }
  };

  const hist = Array.isArray(sub.history) ? sub.history.filter(Boolean) : [];

  return (
    <div className="moverlay open">
      <div className="modal">
        <div className="mhdr"><div className="mtitle">Review: {sub.type}</div><button className="mclose" onClick={onClose}>✕</button></div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>{sub.title}</strong>
          <div className="tsm muted mt1">By: {sub.first_name} {sub.last_name} ({sub.reg_number}) · {new Date(sub.submitted_at).toLocaleDateString()}</div>
          <div style={{ display: 'flex', gap: '.4rem', marginTop: '.5rem', flexWrap: 'wrap' }}>
            <LevelBadge level={sub.current_level} />
            <StatusBadge status={sub.status} />
            {sub.ai_score > 0 && <span className="badge b-gold">AI: {sub.ai_score}/100</span>}
          </div>
        </div>
        <div style={{ background: 'var(--surface2)', borderRadius: 'var(--r)', padding: '1rem', marginBottom: '1rem', maxHeight: 180, overflowY: 'auto' }}>
          <div className="tsm" style={{ lineHeight: 1.65 }}>{sub.content}</div>
        </div>
        {sub.ai_feedback && <div className="ai-box" style={{ marginBottom: '1rem' }}><div className="ai-label">🤖 AI Feedback</div><div className="ai-text">{sub.ai_feedback}</div></div>}
        {hist.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '.4rem', textTransform: 'uppercase', letterSpacing: '.5px' }}>Level History</div>
            <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
              {hist.map((h, i) => <span key={i} className={`badge ${h.status === 'Approved' ? 'b-green' : h.status === 'Rejected' ? 'b-red' : 'b-blue'}`}>{h.level}: {h.status}</span>)}
            </div>
          </div>
        )}
        <div className="fg"><label>Manual Score Override (0–100)</label><input type="number" min="0" max="100" placeholder="Leave blank to keep AI score" value={score} onChange={e => setScore(e.target.value)} /></div>
        <div className="fg"><label>Advance to Level</label>
          <select value={advLevel} onChange={e => setAdvLevel(e.target.value)}>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="fg"><label>Moderator Notes / Feedback</label><textarea rows={3} placeholder="Feedback for the student…" value={notes} onChange={e => setNotes(e.target.value)} /></div>
        <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
          <button className="btn btn-success" disabled={loading} onClick={() => act('approve')}>{loading ? <span className="spin" /> : '✓ Approve'}</button>
          <button className="btn btn-danger" disabled={loading} onClick={() => act('reject')}>{loading ? <span className="spin" /> : '✗ Reject'}</button>
          <button className="btn btn-accent" disabled={loading} onClick={() => act('advance')}>{loading ? <span className="spin" /> : '→ Advance Level'}</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
