import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const nav = useNavigate();

  const features = [
    { icon: '📋', title: 'Submit & Track', desc: 'Submit proposals, results, presentations, and publications at each academic review level.' },
    { icon: '🤖', title: 'AI Scoring', desc: 'Every submission is automatically evaluated by AI — instant scores and detailed feedback.' },
    { icon: '📊', title: 'Live Dashboard', desc: 'Visual progress tracker showing exactly where your submission stands in the pipeline.' },
    { icon: '🔔', title: 'Notifications', desc: 'Receive targeted alerts and announcements directly from your moderators.' },
    { icon: '💬', title: 'Direct Messaging', desc: 'Message your assigned academic moderator directly from within your portal.' },
    { icon: '🎓', title: 'All Academic Levels', desc: "Tailored tracking for Bachelor's, Master's, and PhD / Postgraduate programmes." },
  ];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '0 3rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 66, boxShadow: 'var(--shadow)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎓</div>
          <div>
            <div style={{ fontFamily: 'var(--font-h)', fontWeight: 700, color: 'var(--primary)', fontSize: '1.3rem', lineHeight: 1.1 }}>AcademiTrack</div>
            <div style={{ fontSize: '.62rem', color: 'var(--text3)', letterSpacing: '2px', textTransform: 'uppercase' }}>Student Progress System</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => nav('/login')}>Student Login</button>
          <button className="btn btn-primary btn-sm" onClick={() => nav('/register')}>Register Now</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #1e4d8c 60%, #2563eb 100%)',
        padding: '5rem 2rem 4rem', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle geometric pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: .06,
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px', pointerEvents: 'none',
        }} />

        {/* Academic building SVG */}
        <div style={{ position: 'relative', zIndex: 2, marginBottom: '2.5rem' }}>
          <svg viewBox="0 0 800 180" xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', maxWidth: 720, margin: '0 auto', display: 'block', opacity: .65 }}>
            <rect y="160" width="800" height="20" fill="rgba(255,255,255,.15)" rx="2"/>
            {/* Main building */}
            <rect x="270" y="70" width="260" height="90" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.35)" strokeWidth="1"/>
            {/* Columns */}
            {[290,315,340,430,455,480,505].map((x,i) => (
              <rect key={i} x={x} y="78" width="10" height="82" fill="rgba(255,255,255,.2)" rx="2"/>
            ))}
            {/* Pediment */}
            <polygon points="268,70 400,28 532,70" fill="rgba(255,255,255,.15)" stroke="rgba(255,255,255,.35)" strokeWidth="1"/>
            {/* Bell tower */}
            <rect x="383" y="26" width="34" height="44" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.3)" strokeWidth="1"/>
            <polygon points="383,26 400,10 417,26" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.35)" strokeWidth="1"/>
            {/* Door */}
            <rect x="383" y="120" width="34" height="40" fill="rgba(255,255,255,.2)" rx="2"/>
            {/* Windows */}
            {[295,325,355,420,450,480].map((x,i) => (
              <rect key={i} x={x} y="90" width="24" height="20" fill="rgba(255,255,255,.15)" stroke="rgba(255,255,255,.25)" strokeWidth="1" rx="1"/>
            ))}
            {/* Side buildings */}
            <rect x="110" y="105" width="155" height="55" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.18)" strokeWidth="1"/>
            <rect x="535" y="105" width="155" height="55" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.18)" strokeWidth="1"/>
            {/* Trees */}
            <ellipse cx="70" cy="148" rx="26" ry="30" fill="rgba(255,255,255,.1)"/>
            <ellipse cx="730" cy="148" rx="26" ry="30" fill="rgba(255,255,255,.1)"/>
          </svg>
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-block', background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)',
            color: '#fff', fontSize: '.77rem', letterSpacing: '2px', textTransform: 'uppercase',
            padding: '.4rem 1.2rem', borderRadius: 20, marginBottom: '1.8rem',
          }}>🏛️ Academic Progress Tracking Platform</div>

          <h1 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 700, lineHeight: 1.15, marginBottom: '1.3rem', color: '#fff' }}>
            Track Every Step of Your<br />
            <span style={{ color: '#bfdbfe' }}>Academic Journey</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,.8)', maxWidth: 580, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            From Bachelor's to PhD — submit proposals, results, and publications. Monitor progress across Department,
            School Faculty, and Postgraduate Board levels with AI-powered automatic scoring.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => nav('/register')} style={{
              padding: '.85rem 2.2rem', borderRadius: 'var(--r)', background: '#fff', color: 'var(--primary)',
              border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
              transition: 'all .18s', fontFamily: 'var(--font-b)',
            }}
            onMouseOver={e => e.target.style.background = '#f0f7ff'}
            onMouseOut={e => e.target.style.background = '#fff'}>
              Get Started →
            </button>
            <button onClick={() => nav('/login')} style={{
              padding: '.85rem 2.2rem', borderRadius: 'var(--r)', background: 'transparent',
              color: '#fff', border: '2px solid rgba(255,255,255,.5)', fontWeight: 600,
              fontSize: '1rem', cursor: 'pointer', transition: 'all .18s', fontFamily: 'var(--font-b)',
            }}
            onMouseOver={e => e.target.style.borderColor = '#fff'}
            onMouseOut={e => e.target.style.borderColor = 'rgba(255,255,255,.5)'}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Review Journey */}
      <section style={{ background: 'var(--surface)', padding: '3.5rem 2rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.7rem', color: 'var(--primary)', marginBottom: '.4rem' }}>The Review Journey</h2>
          <p style={{ color: 'var(--text2)', marginBottom: '2.2rem', fontSize: '.95rem' }}>Your submissions advance through three levels of academic review</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
            {[
              { icon: '🏫', name: 'Department', sub: 'Initial Review' },
              null,
              { icon: '🏛️', name: 'School Faculty', sub: 'Intermediate Review' },
              null,
              { icon: '🎓', name: 'Postgrad Board', sub: 'Final Approval' },
            ].map((item, i) =>
              item === null ? (
                <span key={i} style={{ color: 'var(--text3)', fontSize: '1.4rem' }}>→</span>
              ) : (
                <div key={i} style={{
                  background: 'var(--surface)', border: '2px solid var(--border)',
                  borderRadius: 'var(--r2)', padding: '1rem 1.5rem', minWidth: 160, textAlign: 'center',
                  boxShadow: 'var(--shadow)',
                }}>
                  <div style={{ fontSize: '1.4rem' }}>{item.icon}</div>
                  <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '.9rem', margin: '.35rem 0 .2rem' }}>{item.name}</div>
                  <div style={{ fontSize: '.76rem', color: 'var(--text3)' }}>{item.sub}</div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.7rem', color: 'var(--primary)', textAlign: 'center', marginBottom: '.4rem' }}>Everything You Need</h2>
          <p style={{ color: 'var(--text2)', textAlign: 'center', marginBottom: '2.5rem', fontSize: '.95rem' }}>A complete academic progress management platform</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.3rem' }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r2)',
                padding: '1.5rem', boxShadow: 'var(--shadow)', transition: 'all .2s',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '.8rem' }}>{f.icon}</div>
                <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '.4rem' }}>{f.title}</div>
                <div style={{ fontSize: '.86rem', color: 'var(--text2)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--surface)', borderTop: '1px solid var(--border)',
        padding: '1.8rem 2rem', textAlign: 'center', color: 'var(--text3)', fontSize: '.83rem',
      }}>
        © {new Date().getFullYear()} AcademiTrack — Empowering Academic Excellence
      </footer>
    </div>
  );
}
