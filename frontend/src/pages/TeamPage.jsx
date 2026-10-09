import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, UserPlus } from 'lucide-react';
import api from '../api';

export default function TeamPage() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    api.get('/studio/team-activity').then(r => setActivities(r.data)).catch(() => {});
  }, []);

  const teamMembers = [
    { username: 'Demo User', role: 'engineer', online: true },
    { username: 'Alex Chen', role: 'engineer', online: true },
    { username: 'Jordan Lee', role: 'manager', online: false },
    { username: 'Taylor Kim', role: 'engineer', online: true },
    { username: 'Sam Rivera', role: 'executive', online: false },
  ];

  return (
    <div className="page-layout">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div>
          <h1>Team</h1>
          <p className="text-muted">{teamMembers.length} members · {teamMembers.filter(m => m.online).length} online</p>
        </div>
      </motion.div>

      <div className="page-grid-2col">
        <div className="page-section">
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <h3 className="page-section-title" style={{ margin: 0 }}>Members</h3>
            <button className="btn btn-sm btn-secondary" aria-label="Invite team member"><UserPlus size={14} /> Invite</button>
          </div>
          <div className="page-list">
            {teamMembers.map((m, i) => (
              <div key={i} className="page-list-item" style={{ cursor: 'default' }}>
                <div style={{ position: 'relative' }}>
                  <div className="app-profile-avatar" style={{ width: 32, height: 32, fontSize: 13, flexShrink: 0 }}>
                    {m.username[0]}
                  </div>
                  <div style={{
                    position: 'absolute', bottom: 0, right: 0, width: 8, height: 8,
                    borderRadius: '50%', background: m.online ? 'var(--success)' : 'var(--text-muted)',
                    border: '2px solid var(--bg-card)',
                  }} />
                </div>
                <div className="page-list-info">
                  <span className="page-list-title">{m.username}</span>
                  <span className="page-list-meta" style={{ textTransform: 'capitalize' }}>{m.role}</span>
                </div>
                <Shield size={14} className="text-muted" />
              </div>
            ))}
          </div>
        </div>

        <div className="page-section">
          <h3 className="page-section-title">Recent Activity</h3>
          <div className="page-list">
            {activities.length === 0 ? (
              <div className="page-empty" style={{ padding: 24 }}>
                <UserPlus size={28} className="page-empty-icon" />
                <h3 style={{ fontSize: 14, margin: 0 }}>No activity yet</h3>
                <p>Team activity appears here as members interact with projects.</p>
              </div>
            ) : activities.slice(0, 10).map((a) => (
              <div key={a.id} className="page-list-item" style={{ cursor: 'default' }}>
                <div className="app-profile-avatar" style={{ width: 28, height: 28, fontSize: 11, flexShrink: 0 }}>
                  {(a.username || '?')[0]}
                </div>
                <div className="page-list-info">
                  <span className="page-list-title" style={{ fontSize: 12 }}>
                    <strong>{a.username}</strong> {a.action} {a.target}
                  </span>
                  <span className="page-list-meta">{a.details}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}