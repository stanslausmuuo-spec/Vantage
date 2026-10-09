import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ArrowLeft, Plus, MoreHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../api';
import TaskCard from './TaskCard';
import SmartInput from './SmartInput';
import { KanbanSkeleton } from './SkeletonLoader';

const COLUMNS = [
  { key: 'To Do', label: 'To Do', color: '#6b6659' },
  { key: 'In Progress', label: 'In Progress', color: '#8a6216' },
  { key: 'Done', label: 'Done', color: '#37704f' },
];

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setBriefOpen } = useApp();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const loadProject = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch { /* silent */ }
  }, [id]);

  const loadTasks = useCallback(async () => {
    try {
      const res = await api.get(`/tasks?project_id=${id}`);
      setTasks(res.data);
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [id]);

  useEffect(() => { loadProject(); loadTasks(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadProject, loadTasks]);

  const getColumnTasks = (key) =>
    tasks.filter(t => t.status === key)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;

    let newStatus;
    const overCol = COLUMNS.find(c => c.key === over.id);
    if (overCol) {
      newStatus = overCol.key;
    } else {
      const overTask = tasks.find(t => t.id === over.id);
      if (!overTask) return;
      newStatus = overTask.status;
    }

    const activeTaskData = tasks.find(t => t.id === activeId);
    if (!activeTaskData || activeTaskData.status === newStatus) return;

    const updatedTasks = tasks.map(t =>
      t.id === activeId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    try {
      await api.put(`/tasks/${activeId}`, { status: newStatus });
    } catch {
      setTasks(tasks);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const prev = tasks;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch {
      setTasks(prev);
    }
  };

  const handleTaskCreated = (task) => {
    setTasks(prev => [...prev, task]);
  };

  if (loading) {
    return (
      <div className="project-detail">
        <div className="detail-header">
          <button className="btn-icon" onClick={() => navigate('/')} aria-label="Back to dashboard">
            <ArrowLeft size={20} />
          </button>
          <div className="skeleton" style={{ height: 24, width: 200 }} />
        </div>
        <div className="detail-workspace">
          <KanbanSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail">
      <div className="detail-header">
        <button className="btn-icon" onClick={() => navigate('/')} aria-label="Back to dashboard">
          <ArrowLeft size={20} />
        </button>
        <div className="detail-title-area">
          <div className="detail-title-row">
            {project?.color && (
              <span className="detail-project-color" style={{ background: project.color }} />
            )}
            <h1>{project?.name || 'Project'}</h1>
          </div>
          {project?.description && (
            <p className="detail-desc">{project.description}</p>
          )}
        </div>
        <div className="detail-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => setBriefOpen(true)}>
            <Plus size={14} /> Brief
          </button>
          <button className="btn-icon" onClick={() => setShowMenu(!showMenu)} aria-label="Project options" aria-expanded={showMenu}>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="detail-workspace">
        <div style={{ marginBottom: 20, maxWidth: 500 }}>
          <SmartInput projectId={parseInt(id)} onTaskCreated={handleTaskCreated} />
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="kanban-board">
            {COLUMNS.map((col) => {
              const colTasks = getColumnTasks(col.key);
              return (
                <div key={col.key} className="kanban-column">
                  <div className="column-header">
                    <div className="column-header-left">
                      <span className="column-dot" style={{ background: col.color }} />
                      <h3>{col.label}</h3>
                    </div>
                    <span className="column-count">{colTasks.length}</span>
                  </div>
                  <SortableContext
                    items={colTasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="column-body">
                      <AnimatePresence>
                        {colTasks.length === 0 ? (
                          <div className="column-empty">
                            <p>No tasks</p>
                          </div>
                        ) : (
                          colTasks.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onDelete={handleDeleteTask}
                            />
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeTask && (
              <motion.div
                className="task-card dragging"
                style={{ width: 280, transform: 'rotate(3deg)' }}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1.05 }}
              >
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-h)' }}>
                  {activeTask.title}
                </p>
              </motion.div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default ProjectDetail;