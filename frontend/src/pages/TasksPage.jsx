import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ListTodo, ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../api';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState(null);
  const navigate = useNavigate();
  const { setShowNewProjectModal } = useApp();

  useEffect(() => {
    api.get('/projects').then(r => {
      setProjects(r.data);
      const allTasks = [];
      let done = 0;
      if (r.data.length === 0) return;
      r.data.forEach(p => {
        api.get(`/tasks?project_id=${p.id}`).then(res => {
          res.data.forEach(t => allTasks.push({ ...t, project_name: p.name, project_id: p.id }));
          done++;
          if (done === r.data.length) setTasks([...allTasks]);
        }).catch(() => { done++; });
      });
    }).catch(() => setProjects([]));
  }, []);

  const noProjects = projects !== null && projects.length === 0;
  const loading = projects === null;
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'To Do').length,
    progress: tasks.filter(t => t.status === 'In Progress').length,
    done: tasks.filter(t => t.status === 'Done').length,
  };

  return (
    <div className="page-layout">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div>
          <h1>Tasks</h1>
          <p className="text-muted">{loading ? 'Loading...' : noProjects ? 'No projects yet' : `${tasks.length} task${tasks.length !== 1 ? 's' : ''} across ${projects?.length || 0} project${projects?.length !== 1 ? 's' : ''}`}</p>
        </div>
      </motion.div>

      {loading ? (
        <div className="page-list">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8, borderRadius: 8 }} />)}
        </div>
      ) : noProjects ? (
        <div className="page-empty">
          <ListTodo size={40} className="page-empty-icon" aria-hidden="true" />
          <h3>No projects yet</h3>
          <p>Create a project, then tasks will appear here automatically.</p>
          <button className="btn btn-primary" onClick={() => setShowNewProjectModal(true)}>
            <Plus size={16} /> Create project
          </button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="page-empty">
          <ListTodo size={40} className="page-empty-icon" aria-hidden="true" />
          <h3>No tasks yet</h3>
          <p>Add tasks inside any project to track work across your workspace.</p>
        </div>
      ) : (
        <>
          <div className="page-stats">
            <div className="page-stat-card"><span className="page-stat-value">{stats.total}</span>Total</div>
            <div className="page-stat-card"><span className="page-stat-value" style={{ color: 'var(--todo)' }}>{stats.todo}</span>To Do</div>
            <div className="page-stat-card"><span className="page-stat-value" style={{ color: 'var(--in-progress)' }}>{stats.progress}</span>In Progress</div>
            <div className="page-stat-card"><span className="page-stat-value" style={{ color: 'var(--success)' }}>{stats.done}</span>Done</div>
          </div>
          <div className="page-list">
            {tasks.map(t => (
              <motion.div
                key={t.id}
                className="page-list-item"
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/project/${t.project_id}`)}
              >
                <div className={`page-list-status ${t.status === 'Done' ? 'status-done' : t.status === 'In Progress' ? 'status-progress' : 'status-todo'}`} />
                <div className="page-list-info">
                  <span className="page-list-title">{t.title}</span>
                  <span className="page-list-meta">{t.project_name} · {t.priority}</span>
                </div>
                {t.assignee_name && <span className="page-list-assignee">{t.assignee_name}</span>}
                <ArrowRight size={14} className="text-muted" />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}