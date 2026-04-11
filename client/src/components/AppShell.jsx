import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { showToast } from './Toast';

const NAV = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard', group: 'Main' },
  { id: 'progress', icon: '📈', label: 'My Progress', group: 'Main' },
  { id: 'submit', icon: '📤', label: 'Submissions', group: 'Main' },
  { id: 'notifications', icon: '🔔', label: 'Notifications', group: 'Communication' },
  { id: 'messages', icon: '💬', label: 'Messages', group: 'Communication' },
  { id: 'profile', icon: '👤', label: 'Profile', group: 'Account' },
];

export default function AppShell({ children, activePanel, setPanel }) {
  const { user, logout } = useAuth();
  const initials = user ? (user.first_name[0] + user.last_name[0]).toUpperCase() : 'ST';
  const groups = [...new Set(NAV.map(n => n.group))];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '0 2rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 62, position: 'sticky', top: 0, zIndex: 100,
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: 'var(--primary)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18,
          }}>🎓</div>
          <div>
            <div style={{ fontFamily: 'var(--font-h)', fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem', lineHeight: 1.1 }}>AcademiTrack</div>
            <div style={{ fontSize: '.65rem', color: 'var(--text3)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Student Portal</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 'var(--r)', padding: '.4rem .9rem',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>{initials}</div>
            <div>
              <div style={{ fontSize: '.86rem', fontWeight: 500, color: 'var(--text)' }}>{user?.first_name} {user?.last_name}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--accent)', background: 'var(--accent-light)', padding: '1px 7px', borderRadius: 10, display: 'inline-block', marginTop: 1 }}>
                {user?.academic_level?.split(' ')[0]}
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { logout(); showToast('Logged out', 'info'); }}>Logout</button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <nav style={{
          width: 218, background: 'var(--surface)', borderRight: '1px solid var(--border)',
          padding: '1rem 0', flexShrink: 0, overflowY: 'auto',
        }}>
          {groups.map(g => (
            <div key={g}>
              <div className="slabel">{g}</div>
              {NAV.filter(n => n.group === g).map(n => (
                <div
                  key={n.id}
                  className={`sitem${activePanel === n.id ? ' on' : ''}`}
                  onClick={() => setPanel(n.id)}
                >
                  <span className="ico">{n.icon}</span>
                  <span>{n.label}</span>
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* Main content */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', maxHeight: 'calc(100vh - 62px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
