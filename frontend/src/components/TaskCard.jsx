import { memo } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, User, Calendar, GripVertical } from 'lucide-react';

const TaskCard = memo(({ task, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date(new Date().toDateString());

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className="task-card-header">
        <div className="flex items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
          <span {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex' }}>
            <GripVertical size={13} className="text-muted" />
          </span>
          <span className="task-card-title">{task.title}</span>
        </div>
        <div className="task-card-actions">
          <button className="btn-icon btn-sm" onClick={() => onDelete(task.id)}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="task-card-meta">
        {task.priority && (
          <span className={`task-priority ${task.priority}`}>{task.priority}</span>
        )}
        {task.assignee_name && (
          <span className="task-assignee">
            <User size={11} />
            {task.assignee_name}
          </span>
        )}
        {task.due_date && (
          <span className={`task-due ${isOverdue ? 'overdue' : ''}`}>
            <Calendar size={11} />
            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        {task.tags?.map((tag) => (
          <span key={tag} className="task-tag">{tag}</span>
        ))}
      </div>
    </motion.div>
  );
});

TaskCard.displayName = 'TaskCard';
export default TaskCard;