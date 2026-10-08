import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Folder, Trash2, BarChart3, LayoutGrid, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../api';
import { useApp } from '../context/AppContext';
import { ProjectSkeleton } from './SkeletonLoader';

const Dashboard = () => {
  const { user, bottlenecks, setShowNewProjectModal } = useApp();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchProjects]);

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  const isManager = user?.role === 'manager';

  return (
    <div className="dashboard">
      {bottlenecks.length > 0 && isManager && (
        <motion.div
          className="bottleneck-banner"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
        >
          <AlertTriangle size={16} />
          <span><strong>{bottlenecks.length}</strong> bottleneck{bottlenecks.length > 1 ? 's' : ''} detected</span>
        </motion.div>
      )}

      <div className="dashboard-workspace">
        <motion.div
          className="dashboard-welcome"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <h1>{user?.role === 'executive' ? 'Overview' : 'Projects'}</h1>
          <p>{projects.length} project{projects.length !== 1 ? 's' : ''} · {user?.username}</p>
        </motion.div>

        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={() => setShowNewProjectModal(true)}>
            <Plus size={16} /> New Project
          </button>
          {isManager && (
            <div className="dashboard-view-toggle">
              <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>
                <LayoutGrid size={14} /> Grid
              </button>
              <button className={`view-btn ${view === 'gantt' ? 'active' : ''}`} onClick={() => setView('gantt')}>
                <BarChart3 size={14} /> Timeline
              </button>
            </div>
          )}
        </div>

        {loading ? <ProjectSkeleton /> : (
          projects.length === 0 ? (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Folder size={48} className="empty-state-icon" />
              <p>No projects yet — create your first one to get started.</p>
              <button className="btn btn-primary" onClick={() => setShowNewProjectModal(true)}>
                <Plus size={16} /> Create Project
              </button>
            </motion.div>
          ) : view === 'gantt' && isManager ? (
            <GanttTimeline projects={projects} navigate={navigate} />
          ) : (
            <motion.div
              className="projects-grid"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            >
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  className="project-card"
                  layout
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  <div className="project-card-top">
                    <h3>{project.name}</h3>
                    <button className="btn-icon btn-sm" onClick={(e) => handleDeleteProject(project.id, e)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p>{project.description || 'No description'}</p>
                  <div className="project-stats">
                    <span><TrendingUp size={13} /> {project.task_count || 0} tasks</span>
                    <span>{project.done_count || 0} done</span>
                  </div>
                  {(project.task_count || 0) > 0 && (
                    <div className="project-progress-bar">
                      <div className="project-progress-fill" style={{ width: `${((project.done_count || 0) / (project.task_count || 1)) * 100}%` }} />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )
        )}
      </div>
    </div>
  );
};

function GanttTimeline({ projects, navigate }) {
  return (
    <div className="gantt-view">
      <div className="gantt-header">
        <BarChart3 size={16} />
        <h3>Project Timeline</h3>
      </div>
      {projects.map((p) => {
        const total = p.task_count || 0;
        const done = p.done_count || 0;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return (
          <motion.div
            key={p.id}
            className="gantt-bar"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/project/${p.id}`)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="gantt-label">
              <div style={{ fontWeight: 500, color: 'var(--text-h)', fontSize: 13 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pct}% complete</div>
            </div>
            <div className="gantt-track">
              <div className="gantt-fill done" style={{ width: `${pct}%` }} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default Dashboard;