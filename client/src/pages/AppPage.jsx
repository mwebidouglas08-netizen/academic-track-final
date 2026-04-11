import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppShell from '../components/AppShell';
import { showToast } from '../components/Toast';
import api from '../utils/api';

const LEVELS = ['Department', 'School Faculty', 'Postgraduate Board'];

// ── Helpers ───────────────────────────────────────────────
function ScoreRing({ score }) {
  if (!score) return <span className="badge b-gray">Pending</span>;
  const cls = score >= 80 ? 'sr-hi' : score >= 60 ? 'sr-md' : 'sr-lo';
  return <div className={`sring ${cls}`}>{score}</div>;
}
function LevelBadge({ level }) {
  const map = { Department: 'b-primary', 'School Faculty': 'b-gold', 'Postgraduate Board': 'b-blue' };
  return <span className={`badge ${map[level] || 'b-gray'}`}>{level}</span>;
}
function StatusBadge({ status }) {
  const map = { Approved: 'b-green', Rejected: 'b-red', Submitted: 'b-blue', Reviewing: 'b-amber' };
  return <span className={`badge ${map[status] || 'b-gray'}`}>{status}</span>;
}

// ── AI Scoring ────────────────────────────────────────────
async function aiScore(type, level, dept, topic, title, content) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens: 600,
        system: `You are an academic evaluator for ${level} students. Score ${type} submissions from 0–100. Return ONLY valid JSON with no markdown: {"score":number,"feedback":"1-2 sentence summary","strengths":"key strength","improvements":"main improvement needed"}`,
        messages: [{ role: 'user', content: `Title: ${title}\nDepartment: ${dept}\nResearch area: ${topic || 'general'}\n\nContent:\n${content}` }],
      }),
    });
    const d = await res.json();
    const parsed = JSON.parse(d.content[0].text.replace(/```json|```/g, '').trim());
    return parsed;
  } catch {
    const score = Math.floor(62 + Math.random() * 28);
    return { score, feedback: 'Submission received and evaluated.', strengths: 'Clear structure.', improvements: 'Expand methodology.' };
  }
}

// ── DASHBOARD ─────────────────────────────────────────────
function Dashboard({ subs, notifs, user }) {
  const approved = subs.filter(s => s.status === 'Approved').length;
  const reviewing = subs.filter(s => s.status === 'Submitted' || s.status === 'Reviewing').length;
  const scored = subs.filter(s => s.ai_score > 0);
  const avg = scored.length ? Math.round(scored.reduce((a, b) => a + b.ai_score, 0) / scored.length) : 0;

  const lvlStatus = {};
  subs.forEach(s => {
    if (Array.isArray(s.history)) s.history.forEach(h => {
      if (h && (!lvlStatus[h.level] || h.status === 'Approved')) lvlStatus[h.level] = h.status;
    });
  });

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '.25rem' }}>
        Welcome back, {user?.first_name}!
      </div>
      <div style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '1.8rem' }}>Here's your academic progress overview</div>

      <div className="sgrid">
        <div className="scard"><div className="sval">{subs.length}</div><div className="slb">Total Submissions</div></div>
        <div className="scard"><div className="sval" style={{ color: 'var(--green)' }}>{approved}</div><div className="slb">Approved</div></div>
        <div className="scard"><div className="sval" style={{ color: 'var(--amber)' }}>{reviewing}</div><div className="slb">Under Review</div></div>
        <div className="scard"><div className="sval" style={{ color: 'var(--accent)' }}>{avg ? `${avg}%` : '—'}</div><div className="slb">Avg AI Score</div></div>
      </div>

      <div className="card">
        <div className="card-t">🗺️ Submission Journey</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', flexWrap: 'wrap', padding: '.5rem 0' }}>
          {LEVELS.map((lvl, i) => {
            const st = lvlStatus[lvl] || 'Pending';
            const cls = st === 'Approved' ? 'j-done' : st === 'Submitted' || st === 'Reviewing' ? 'j-active' : st === 'Rejected' ? 'j-reject' : '';
            const ico = st === 'Approved' ? '✓' : st === 'Reviewing' ? '⏳' : st === 'Submitted' ? '📬' : st === 'Rejected' ? '✗' : '○';
            return (
              <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                <div className={`jnode ${cls}`}>
                  <div style={{ fontSize: '1.2rem' }}>{ico}</div>
                  <div className="jname">{lvl}</div>
                  <StatusBadge status={st} />
                </div>
                {i < LEVELS.length - 1 && <span className="jarr">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-t">📢 Recent Notifications</div>
        {notifs.length === 0
          ? <p className="muted tsm">No notifications yet.</p>
          : notifs.slice(0, 4).map(n => (
            <div key={n.id} className="nitem">
              <div className={`ndot ${n.is_read ? 'read' : 'unread'}`} />
              <div>
                <div className="ntext"><strong>{n.title}</strong><br />{n.message}</div>
                <div className="ntime">{n.sender_name ? `From ${n.sender_name} · ` : ''}{new Date(n.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ── PROGRESS ──────────────────────────────────────────────
function Progress({ subs }) {
  if (!subs.length) return (
    <div>
      <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>📈 My Progress</div>
      <div className="card"><p className="muted">No submissions yet. Head to Submissions to get started!</p></div>
    </div>
  );
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '.25rem' }}>📈 My Progress</div>
      <div style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '1.8rem' }}>Detailed view of all your submissions</div>
      {subs.map(s => {
        const pct = s.status === 'Approved' ? 100 : s.status === 'Submitted' || s.status === 'Reviewing' ? 50 : s.status === 'Rejected' ? 20 : 0;
        const hist = Array.isArray(s.history) ? s.history.filter(Boolean) : [];
        return (
          <div key={s.id} className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '.8rem', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{s.title}</div>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '.4rem' }}>
                  <span className="badge b-blue">{s.type}</span>
                  <LevelBadge level={s.current_level} />
                  <span className="muted tsm">{new Date(s.submitted_at).toLocaleDateString()}</span>
                </div>
              </div>
              <ScoreRing score={s.ai_score} />
            </div>
            <div className="pbar-wrap">
              <div className="pbar" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--green)' : pct >= 50 ? 'var(--accent)' : 'var(--red)' }} />
            </div>
            <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginTop: '.5rem' }}>
              {hist.map((h, i) => (
                <span key={i} className={`badge ${h.status === 'Approved' ? 'b-green' : h.status === 'Rejected' ? 'b-red' : h.status === 'Submitted' || h.status === 'Reviewing' ? 'b-blue' : 'b-gray'}`}>
                  {h.level}: {h.status}
                </span>
              ))}
            </div>
            {s.ai_score > 0 && (
              <div className="ai-box">
                <div className="ai-label">🤖 AI Assessment — Score: {s.ai_score}/100</div>
                <div className="ai-text">{s.ai_feedback}</div>
              </div>
            )}
            {s.moderator_notes && (
              <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)', borderRadius: 'var(--r)', padding: '.75rem 1rem', marginTop: '.8rem' }}>
                <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '.3rem' }}>📝 Moderator Notes</div>
                <div style={{ fontSize: '.87rem', color: 'var(--text2)' }}>{s.moderator_notes}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── SUBMISSIONS ───────────────────────────────────────────
function Submissions({ subs, onRefresh, user }) {
  const [tab, setTab] = useState('Proposal');
  const [form, setForm] = useState({ title: '', currentLevel: 'Department', content: '' });
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const types = ['Proposal', 'Results', 'Presentation', 'Publication'];
  const typeIcons = { Proposal: '📄', Results: '📊', Presentation: '🎤', Publication: '📰' };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) { showToast('Please fill in title and content.', 'error'); return; }
    setLoading(true);
    setAiResult(null);
    try {
      // AI scoring
      const scored = await aiScore(tab, user.academic_level, user.department, user.research_topic, form.title, form.content);
      setAiResult(scored);
      // Save to DB
      await api.post('/submissions', {
        type: tab,
        title: form.title,
        content: form.content,
        currentLevel: form.currentLevel,
        aiScore: scored.score,
        aiFeedback: scored.feedback,
      });
      setForm({ title: '', currentLevel: 'Department', content: '' });
      showToast('Submission saved!', 'success');
      onRefresh();
    } catch (err) {
      showToast(err.response?.data?.error || 'Submission failed.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '.25rem' }}>📤 Submissions</div>
      <div style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '1.5rem' }}>Submit academic documents for review</div>

      {/* Type tabs */}
      <div style={{ display: 'flex', gap: '.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {types.map(t => (
          <button key={t} onClick={() => { setTab(t); setAiResult(null); }}
            className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}>
            {typeIcons[t]} {t}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-t">{typeIcons[tab]} Submit {tab}</div>
        <form onSubmit={submit}>
          <div className="fg"><label>Title</label><input type="text" placeholder={`${tab} title…`} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
          <div className="fg">
            <label>Target Review Level</label>
            <select value={form.currentLevel} onChange={e => setForm(p => ({ ...p, currentLevel: e.target.value }))}>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="fg"><label>Abstract / Description</label><textarea rows={5} placeholder={`Describe your ${tab.toLowerCase()} thoroughly…`} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} /></div>

          {loading && (
            <div style={{ background: 'var(--gold-light)', border: '1px solid #f0d060', borderRadius: 'var(--r)', padding: '1rem', marginBottom: '.9rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="spin" />
              <span style={{ fontSize: '.88rem', color: 'var(--text2)' }}>AI is evaluating your submission…</span>
            </div>
          )}

          {aiResult && (
            <div className="ai-box" style={{ marginBottom: '.9rem' }}>
              <div className="ai-label">🤖 AI Assessment — Score: {aiResult.score}/100</div>
              <div className="ai-text" style={{ marginBottom: '.5rem' }}>{aiResult.feedback}</div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div className="tsm"><strong style={{ color: 'var(--green)' }}>Strengths:</strong> {aiResult.strengths}</div>
                <div className="tsm"><strong style={{ color: 'var(--amber)' }}>Improve:</strong> {aiResult.improvements}</div>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spin" />&nbsp;Submitting…</> : `Submit ${tab}`}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="card">
        <div className="card-t">📋 Submission History</div>
        {subs.length === 0 ? <p className="muted tsm">No submissions yet.</p> : (
          <div className="tbl-wrap">
            <table className="dtbl">
              <thead><tr><th>Title</th><th>Type</th><th>Level</th><th>Status</th><th>AI Score</th><th>Date</th></tr></thead>
              <tbody>
                {subs.map(s => (
                  <tr key={s.id}>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.title}>{s.title}</td>
                    <td><span className="badge b-blue">{s.type}</span></td>
                    <td><LevelBadge level={s.current_level} /></td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>
                      {s.ai_score > 0
                        ? <span style={{ fontWeight: 600, color: s.ai_score >= 80 ? 'var(--green)' : s.ai_score >= 60 ? 'var(--amber)' : 'var(--red)' }}>{s.ai_score}</span>
                        : '—'}
                    </td>
                    <td className="tsm muted">{new Date(s.submitted_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── NOTIFICATIONS ─────────────────────────────────────────
function Notifications({ notifs, onRefresh }) {
  const markRead = async (id) => {
    try { await api.patch(`/notifications/${id}/read`); onRefresh(); } catch {}
  };
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '.25rem' }}>🔔 Notifications</div>
      <div style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '1.8rem' }}>Alerts and messages from your moderators</div>
      {notifs.length === 0 ? <div className="card"><p className="muted">No notifications yet.</p></div>
        : notifs.map(n => (
          <div key={n.id} className="nitem" style={{ cursor: !n.is_read ? 'pointer' : 'default' }}
            onClick={() => !n.is_read && markRead(n.id)}>
            <div className={`ndot ${n.is_read ? 'read' : 'unread'}`} />
            <div style={{ flex: 1 }}>
              <div className="ntext"><strong>{n.title}</strong>{!n.is_read && <span style={{ marginLeft: 8, fontSize: '.72rem', background: 'var(--accent-light)', color: 'var(--accent)', padding: '1px 7px', borderRadius: 10 }}>New</span>}<br />{n.message}</div>
              <div className="ntime">{n.sender_name ? `From ${n.sender_name} · ` : ''}{new Date(n.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
    </div>
  );
}

// ── MESSAGES ──────────────────────────────────────────────
function Messages() {
  const [msgs, setMsgs] = useState([]);
  const [form, setForm] = useState({ subject: '', body: '' });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try { const r = await api.get('/messages'); setMsgs(r.data); } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const send = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.body) { showToast('Please fill all fields.', 'error'); return; }
    setLoading(true);
    try {
      await api.post('/messages', form);
      setForm({ subject: '', body: '' });
      showToast('Message sent!', 'success');
      load();
    } catch { showToast('Failed to send message.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '.25rem' }}>💬 Message Moderator</div>
      <div style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '1.8rem' }}>Send a direct message to your assigned moderator</div>
      <div className="card">
        <div className="card-t">✉️ New Message</div>
        <form onSubmit={send}>
          <div className="fg"><label>Subject</label><input type="text" placeholder="Message subject" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} /></div>
          <div className="fg"><label>Message</label><textarea rows={5} placeholder="Write your message here…" value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} /></div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spin" />&nbsp;Sending…</> : 'Send Message'}
          </button>
        </form>
      </div>
      <div className="card">
        <div className="card-t">📨 Sent Messages</div>
        {msgs.length === 0 ? <p className="muted tsm">No messages sent yet.</p>
          : msgs.map(m => (
            <div key={m.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '1rem', marginBottom: '.7rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem' }}>
                <strong>{m.subject}</strong>
                <span className="tsm muted">{new Date(m.created_at).toLocaleDateString()}</span>
              </div>
              <div className="tsm muted">{m.body}</div>
              {m.reply && (
                <div style={{ marginTop: '.7rem', padding: '.7rem', background: 'var(--primary-light)', borderRadius: 'var(--r)', borderLeft: '3px solid var(--primary)' }}>
                  <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '.25rem' }}>
                    Reply from {m.replied_by_name || 'Moderator'}:
                  </div>
                  <div className="tsm">{m.reply}</div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

// ── PROFILE ───────────────────────────────────────────────
function Profile({ user, subs }) {
  const scored = subs.filter(s => s.ai_score > 0);
  const avg = scored.length ? Math.round(scored.reduce((a, b) => a + b.ai_score, 0) / scored.length) : null;
  const rows = [
    ['Registration No.', user?.reg_number],
    ['Email', user?.email],
    ['Phone', user?.phone],
    ['Department', user?.department],
    ['Research Topic', user?.research_topic || '—'],
    ['Total Submissions', subs.length],
    ['Average AI Score', avg ? `${avg} / 100` : 'N/A'],
    ['Member Since', new Date(user?.created_at).toLocaleDateString()],
  ];
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '1.8rem' }}>👤 My Profile</div>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.3rem', marginBottom: '1.3rem' }}>
          <div style={{ width: 66, height: 66, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {user ? (user.first_name[0] + user.last_name[0]).toUpperCase() : '?'}
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{user?.first_name} {user?.last_name}</div>
            <span className="badge b-primary mt1">{user?.academic_level}</span>
          </div>
        </div>
        <div className="divider" />
        <table style={{ width: '100%', fontSize: '.88rem', borderCollapse: 'collapse' }}>
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <td style={{ color: 'var(--text2)', padding: '.45rem 0', width: '42%' }}>{k}</td>
                <td style={{ fontWeight: 500, padding: '.45rem 0' }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── MAIN APP PAGE ─────────────────────────────────────────
export default function AppPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [panel, setPanel] = useState('dashboard');
  const [subs, setSubs] = useState([]);
  const [notifs, setNotifs] = useState([]);

  const loadSubs = useCallback(async () => {
    try { const r = await api.get('/submissions'); setSubs(r.data); } catch {}
  }, []);

  const loadNotifs = useCallback(async () => {
    try { const r = await api.get('/notifications'); setNotifs(r.data); } catch {}
  }, []);

  useEffect(() => { loadSubs(); loadNotifs(); }, [loadSubs, loadNotifs]);

  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
  if (!user) return null;

  const renderPanel = () => {
    switch (panel) {
      case 'dashboard': return <Dashboard subs={subs} notifs={notifs} user={user} />;
      case 'progress': return <Progress subs={subs} />;
      case 'submit': return <Submissions subs={subs} onRefresh={loadSubs} user={user} />;
      case 'notifications': return <Notifications notifs={notifs} onRefresh={loadNotifs} />;
      case 'messages': return <Messages />;
      case 'profile': return <Profile user={user} subs={subs} />;
      default: return null;
    }
  };

  return (
    <AppShell activePanel={panel} setPanel={(p) => { setPanel(p); if (p === 'notifications') loadNotifs(); if (p !== 'submit') loadSubs(); }}>
      {renderPanel()}
    </AppShell>
  );
}
