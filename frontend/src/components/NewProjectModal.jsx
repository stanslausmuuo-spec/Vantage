import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useApp } from '../context/AppContext';
import { toast } from './Toast';

const COLORS = ['#a34c26', '#1a1814', '#37704f', '#8a6216', '#b23a2f', '#5b6b7a'];

export default function NewProjectModal({ onCreated }) {
  const { showNewProjectModal, setShowNewProjectModal } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#a34c26');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await api.post('/projects', { name, description, color });
      setShowNewProjectModal(false);
      setName('');
      setDescription('');
      setColor('#a34c26');
      if (onCreated) onCreated(res.data);
      toast(`Project "${name}" created`);
      navigate(`/project/${res.data.id}`);
    } catch (err) {
      console.error('Failed to create project', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {showNewProjectModal && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowNewProjectModal(false)}
        >
          <motion.div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-project-title"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="new-project-title">New Project</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="new-project-name">Name</label>
                <input
                  id="new-project-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Website Redesign"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-project-desc">Description</label>
                <textarea
                  id="new-project-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of the project"
                />
              </div>
              <div className="form-group">
                <span className="form-group-label">Color</span>
                <div className="color-picker">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-dot ${color === c ? 'color-dot-active' : ''}`}
                      style={{ background: c }}
                      onClick={() => setColor(c)}
                      aria-label={`Select color ${c}`}
                      aria-pressed={color === c}
                    />
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowNewProjectModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}