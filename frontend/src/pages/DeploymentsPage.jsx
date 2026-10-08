import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Globe, ArrowUpRight, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../api';

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState([]);
  const { setShowNewProjectModal } = useApp();

  useEffect(() => {
    api.get('/studio/deployments').then(r => setDeployments(r.data)).catch(() => {});
  }, []);

  return (
    <div className="page-layout">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div>
          <h1>Deployments</h1>
          <p className="text-muted">Pipeline status and environment health</p>
        </div>
      </motion.div>

      {deployments.length === 0 ? (
        <div className="page-empty" style={{ marginTop: 20 }}>
          <Cloud size={40} className="page-empty-icon" />
          <h3>No deployments yet</h3>
          <p>Deployments appear here once you push code. The pipeline shows your path from commit to production.</p>
          <div className="studio-pipeline-steps" style={{ maxWidth: 400, marginTop: 12 }}>
            <span className="studio-pipeline-step step-done">Commit</span>
            <div className="studio-pipeline-arrow" />
            <span className="studio-pipeline-step">Build</span>
            <div className="studio-pipeline-arrow" />
            <span className="studio-pipeline-step">Test</span>
            <div className="studio-pipeline-arrow" />
            <span className="studio-pipeline-step">Deploy</span>
          </div>
        </div>
      ) : (
        <>
          <div className="page-stats">
            <div className="page-stat-card"><span className="page-stat-value">{deployments.length}</span>Total</div>
            <div className="page-stat-card"><span className="page-stat-value" style={{ color: 'var(--success)' }}>{deployments.filter(d => d.status === 'success').length}</span>Live</div>
            <div className="page-stat-card"><span className="page-stat-value" style={{ color: 'var(--warning)' }}>{deployments.filter(d => d.status === 'building').length}</span>Building</div>
          </div>
          <div className="studio-pipeline" style={{ marginBottom: 24 }}>
            <div className="studio-pipeline-steps" style={{ justifyContent: 'flex-start', gap: 0 }}>
              <span className="studio-pipeline-step step-done">Commit</span>
              <div className="studio-pipeline-arrow" />
              <span className="studio-pipeline-step step-done">Build</span>
              <div className="studio-pipeline-arrow" />
              <span className="studio-pipeline-step step-done">Test</span>
              <div className="studio-pipeline-arrow" />
              <span className={`studio-pipeline-step ${deployments.some(d => d.status === 'success') ? 'step-done' : ''}`}>Deploy</span>
              <div className="studio-pipeline-arrow" />
              <span className={`studio-pipeline-step ${deployments.some(d => d.environment === 'production' && d.status === 'success') ? 'step-done' : ''}`}>Production</span>
            </div>
          </div>
          <div className="page-section">
            <h3 className="page-section-title">Environment History</h3>
            <div className="page-list">
              {deployments.map((d, i) => (
                <div key={d.id || i} className="page-list-item" style={{ cursor: 'default' }}>
                  <Globe size={16} className="text-muted" style={{ flexShrink: 0 }} />
                  <div className="page-list-info">
                    <span className="page-list-title">{d.name}</span>
                    <span className="page-list-meta">{d.environment} · {d.provider || 'Vercel'}</span>
                  </div>
                  {d.url && (
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="btn-icon" style={{ marginRight: 8 }}>
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                  <span className={`studio-status-label ${d.status}`}>{d.status}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}