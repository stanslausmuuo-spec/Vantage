import { motion } from 'framer-motion';

export function ProjectSkeleton() {
  return (
    <div className="projects-grid">
      {[1, 2, 3].map((i) => (
        <div key={i} className="project-card" style={{ cursor: 'default' }}>
          <div className="skeleton skeleton-line" style={{ width: '70%', height: 18, marginBottom: 10 }} />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" style={{ width: '40%' }} />
          <div className="skeleton" style={{ height: 3, marginTop: 14, borderRadius: 99 }} />
        </div>
      ))}
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="skeleton-columns">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton skeleton-col" />
      ))}
    </div>
  );
}

export function BriefSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ padding: 20 }}
    >
      <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 60, marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 60, marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 60 }} />
    </motion.div>
  );
}