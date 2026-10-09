import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Clock, CheckCircle2, List } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../api';
import { BriefSkeleton } from './SkeletonLoader';

const MorningBrief = () => {
  const { briefOpen, setBriefOpen } = useApp();
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (briefOpen) {
      setLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
      api.get('/insights/brief')
        .then((res) => setBrief(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [briefOpen]);

  return (
    <AnimatePresence>
      {briefOpen && (
        <motion.div
          className="brief-panel"
          role="complementary"
          aria-label="Morning brief"
          initial={{ x: 380 }}
          animate={{ x: 0 }}
          exit={{ x: 380 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="brief-header">
            <div>
              <h2>Morning Brief</h2>
              <span className="text-muted" style={{ fontSize: 12 }}>
                {brief?.date ? new Date(brief.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''}
              </span>
            </div>
            <button className="btn-icon" onClick={() => setBriefOpen(false)} aria-label="Close morning brief">
              <X size={18} />
            </button>
          </div>

          <div className="brief-body">
            {loading && <BriefSkeleton />}

            {!loading && brief && (
              <>
                {brief.overdue_count > 0 && (
                  <div className="brief-section">
                    <h3>Overdue</h3>
                    {brief.overdue_tasks.map((t, i) => (
                      <div key={i} className="brief-card">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} style={{ color: 'var(--danger)' }} />
                          <p>{t.title}</p>
                        </div>
                        <div className="brief-card-meta">
                          <span className="brief-severity high">Overdue</span>
                          {t.assignee_name && <span>{t.assignee_name}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {brief.due_today?.length > 0 && (
                  <div className="brief-section">
                    <h3>Due Today</h3>
                    {brief.due_today.map((t, i) => (
                      <div key={i} className="brief-card">
                        <div className="flex items-center gap-2">
                          <Clock size={14} style={{ color: 'var(--warning)' }} />
                          <p>{t.title}</p>
                        </div>
                        <div className="brief-card-meta">
                          <span className={`brief-severity ${t.priority}`}>{t.priority}</span>
                          <span>{t.project_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {brief.in_progress?.length > 0 && (
                  <div className="brief-section">
                    <h3>In Progress</h3>
                    {brief.in_progress.map((t, i) => (
                      <div key={i} className="brief-card">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} style={{ color: 'var(--in-progress)' }} />
                          <p>{t.title}</p>
                        </div>
                        <div className="brief-card-meta">
                          <span>{t.project_name}</span>
                          {t.assignee_name && <span>{t.assignee_name}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {brief.blockers?.length > 0 && (
                  <div className="brief-section">
                    <h3>Blocked Tasks</h3>
                    {brief.blockers.filter(b => b.blocked_count > 0).map((b, i) => (
                      <div key={i} className="brief-card">
                        <div className="flex items-center gap-2">
                          <List size={14} style={{ color: 'var(--text-muted)' }} />
                          <p>{b.project_name}</p>
                        </div>
                        <div className="brief-card-meta">
                          {b.blocked_count} task{b.blocked_count !== 1 ? 's' : ''} waiting
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!brief.overdue_tasks?.length && !brief.due_today?.length && !brief.in_progress?.length && (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <p>All clear — no outstanding items.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MorningBrief;