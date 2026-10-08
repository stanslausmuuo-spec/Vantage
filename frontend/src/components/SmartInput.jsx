import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizonal, Sparkles, Calendar, User } from 'lucide-react';
import api from '../api';

const SmartInput = ({ projectId, onTaskCreated }) => {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(async (value) => {
    setText(value);
    if (value.length > 8) {
      setLoading(true);
      try {
        const res = await api.post('/nlp/parse', { text: value });
        setParsed(res.data);
        setShowPreview(true);
      } catch {
        setShowPreview(false);
      }
      setLoading(false);
    } else {
      setShowPreview(false);
      setParsed(null);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      let payload;
      if (parsed) {
        payload = { ...parsed, project_id: projectId };
      } else {
        payload = { title: text, project_id: projectId };
      }
      const res = await api.post('/tasks', payload);
      if (onTaskCreated) onTaskCreated(res.data);
      setText('');
      setParsed(null);
      setShowPreview(false);
    } catch (err) {
      console.error('Failed to create task', err);
    }
  };

  return (
    <div className="smart-input-wrap">
      <form onSubmit={handleSubmit}>
        <input
          className="smart-input"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder='Type a task... e.g. "Design review due tomorrow high priority"'
          autoComplete="off"
        />
        <button type="submit" className="smart-input-send">
          {loading ? <Sparkles size={16} /> : <SendHorizonal size={16} />}
        </button>
      </form>

      <AnimatePresence>
        {showPreview && parsed && (
          <motion.div
            className="smart-preview"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <Sparkles size={14} className="text-muted" />
            <span className="smart-preview-tag">{parsed.priority}</span>
            {parsed.status && <span className="smart-preview-tag">{parsed.status}</span>}
            {parsed.due_date && (
              <span className="smart-preview-tag">
                <Calendar size={10} style={{ marginRight: 3 }} />
                {new Date(parsed.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {parsed.assignee_id && (
              <span className="smart-preview-tag">
                <User size={10} style={{ marginRight: 3 }} />
                Assigned
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartInput;