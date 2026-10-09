import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, X } from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Cmd / Ctrl + K', desc: 'Open Command Palette' },
    { key: 'Ctrl + Shift + F', desc: 'Global Quick Search' },
    { key: 'C', desc: 'Create New Project / Task' },
    { key: 'G then D', desc: 'Go to Dashboard' },
    { key: 'G then T', desc: 'Go to Tasks' },
    { key: 'G then C', desc: 'Go to Calendar' },
    { key: 'G then S', desc: 'Go to Vibe Studio' },
    { key: 'Esc', desc: 'Close Modals / Clear Selection' },
  ];

  return (
    <AnimatePresence>
      <div
        className="modal-overlay"
        onClick={onClose}
      >
        <motion.div
          className="modal-content"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: 480 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Command size={18} style={{ color: 'var(--primary)' }} aria-hidden="true" />
              <h3 id="shortcuts-title" style={{ fontSize: 18 }}>Keyboard Shortcuts</h3>
            </div>
            <button className="btn-icon" onClick={onClose} aria-label="Close shortcuts">
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 360, overflowY: 'auto' }}>
            {shortcuts.map((s, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < shortcuts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 14, color: 'var(--text)' }}>{s.desc}</span>
                <kbd>{s.key}</kbd>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Press <kbd>Esc</kbd> anytime to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
