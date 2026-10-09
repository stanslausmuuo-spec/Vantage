import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, CheckCircle2 } from 'lucide-react';

const entityChips = [
  { text: '#backend', tone: 'accent' },
  { text: '@alex', tone: 'success' },
  { text: 'due: Friday', tone: 'warning' },
  { text: 'priority: high', tone: 'danger' },
];

const features = [
  {
    title: 'Keyboard-first navigation',
    body: 'Command everything without touching the mouse. Jump between projects, create items, and run actions from a single palette.',
    aside: (
      <>
        <div><kbd>G</kbd> then <kbd>D</kbd> &nbsp;dashboard</div>
        <div style={{ marginTop: 8 }}><kbd>⌘</kbd> <kbd>K</kbd> &nbsp;command palette</div>
        <div style={{ marginTop: 8 }}><kbd>?</kbd> &nbsp;shortcuts</div>
      </>
    ),
  },
  {
    title: 'Natural language parsing',
    body: 'Type the way you think. Assignees, due dates, tags, and priorities are extracted as you write — no forms, no dropdowns.',
    aside: (
      <>
        <div>[ assignee ] &nbsp;@alex</div>
        <div style={{ marginTop: 8 }}>[ due ] &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Friday</div>
        <div style={{ marginTop: 8 }}>[ priority ] &nbsp;&nbsp;high</div>
      </>
    ),
  },
  {
    title: 'Automated workflows',
    body: 'Wire triggers to handoffs so work moves between people and projects on its own. Fewer pings, fewer status meetings.',
    aside: (
      <div style={{ lineHeight: 1.9 }}>
        task.closed →<br />
        &nbsp;&nbsp;notify(#review)<br />
        &nbsp;&nbsp;move(staging)
      </div>
    ),
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [demoInput, setDemoInput] = useState(
    'Deploy authentication service to staging #backend @alex due Friday high priority'
  );
  const [isParsed, setIsParsed] = useState(false);

  const handleSimulate = (e) => {
    e.preventDefault();
    setIsParsed(true);
    setTimeout(() => setIsParsed(false), 4000);
  };

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-brand">
          <div className="landing-mark" aria-hidden="true">V</div>
          <span className="landing-wordmark">Vantage</span>
        </div>

        <nav className="landing-nav" aria-label="Primary">
          <a href="#features">Features</a>
          <a href="#workflow">Workflows</a>
          <a href="#capabilities">Capabilities</a>
        </nav>

        <div className="landing-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/auth')}>
            Sign in
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth')}>
            Get started <ArrowRight size={14} />
          </button>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow">Product operations, 2026</p>
          <h1 className="landing-h1">
            Work at the speed of <em>thought</em>.
          </h1>
          <p className="landing-lede">
            Vantage turns natural language into structured work, surfaces what is
            blocked, and keeps status updates where they belong — out of your way.
          </p>

          <div className="landing-cta-row">
            <button className="landing-cta" onClick={() => navigate('/auth')}>
              Start building free <ArrowRight size={16} />
            </button>
          </div>

          <div className="landing-meta">
            <span>[ sign in with email ]</span>
            <span>[ sqlite WAL · JWT RBAC ]</span>
          </div>
        </div>

        <motion.div
          className="landing-parser"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="landing-parser-head">
            <span className="landing-parser-title">[ vantage://natural-input ]</span>
            <span className="landing-parser-status">parser active</span>
          </div>

          <div className="landing-parser-body">
            <form className="landing-parser-form" onSubmit={handleSimulate}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Terminal
                  size={15}
                  aria-hidden="true"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <label htmlFor="landing-demo" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                  Task description
                </label>
                <input
                  id="landing-demo"
                  type="text"
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  placeholder="Type a task in natural language..."
                  style={{ paddingLeft: 38, fontSize: 14, background: 'var(--bg-inset)' }}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Parse
              </button>
            </form>

            <div className="landing-entities">
              <span className="landing-entities-label">Extracted entities</span>
              <span style={{ color: 'var(--text-h)', fontSize: 13 }}>
                Deploy authentication service to staging
              </span>
              {entityChips.map((chip) => (
                <span key={chip.text} className={`landing-entity ${chip.tone}`}>
                  {chip.text}
                </span>
              ))}
            </div>

            {isParsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ marginTop: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500 }}
              >
                <CheckCircle2 size={14} aria-hidden="true" /> Created successfully in the board.
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      <section id="features" className="landing-section">
        <div className="landing-section-head">
          <span className="landing-section-num">01</span>
          <h2>Engineered for velocity</h2>
          <span className="landing-count">three primitives</span>
        </div>

        {features.map((feature, i) => (
          <div className="landing-feature" key={feature.title}>
            <span className="landing-feature-index" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </div>
            <div className="landing-feature-aside" aria-hidden="true">
              {feature.aside}
            </div>
          </div>
        ))}
      </section>

      <section id="capabilities" className="landing-capabilities">
        <div className="landing-capabilities-grid">
          <div className="landing-capability">
            <span className="label-mono">Analytics</span>
            <h4>Morning briefs</h4>
            <p>Daily executive summaries and velocity trends without a status meeting.</p>
          </div>
          <div className="landing-capability">
            <span className="label-mono">Workspace</span>
            <h4>Vibe Studio</h4>
            <p>Shape views, fields, and workflows to match how your team actually works.</p>
          </div>
          <div className="landing-capability">
            <span className="label-mono">Security</span>
            <h4>Enterprise-ready</h4>
            <p>SQLite WAL persistence with rate limiting and JWT role-based access.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-brand">
          <div className="landing-mark" aria-hidden="true" style={{ width: 22, height: 22, fontSize: 11 }}>V</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-h)' }}>
            Vantage Project Management
          </span>
        </div>
        <p>© {new Date().getFullYear()} Vantage Inc.</p>
      </footer>
    </div>
  );
}
