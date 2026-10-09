/* eslint-disable react-refresh/only-export-components */
import { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const DEFAULT_DURATION = 4000;

let toastId = 0;
let globalToastFn = null;

export function toast(message, type = 'success', options = {}) {
  if (globalToastFn) globalToastFn(message, type, options);
}

toast.success = (message, options) => toast(message, 'success', options);
toast.error = (message, options) => toast(message, 'error', options);
toast.warning = (message, options) => toast(message, 'warning', options);
toast.info = (message, options) => toast(message, 'info', options);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback((message, type = 'success', options = {}) => {
    if (!message) return;
    const id = ++toastId;
    const duration = options.duration ?? DEFAULT_DURATION;

    setToasts((prev) => {
      const next = [...prev, { id, message, type }];
      return next.length > 4 ? next.slice(next.length - 4) : next;
    });

    if (duration > 0) {
      const timer = setTimeout(() => removeToast(id), duration);
      timersRef.current.set(id, timer);
    }
  }, [removeToast]);

  useEffect(() => {
    globalToastFn = addToast;
    return () => {
      if (globalToastFn === addToast) globalToastFn = null;
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type] || ICONS.info;
            return (
              <motion.div
                key={t.id}
                className={`toast toast-${t.type}`}
                initial={{ opacity: 0, x: 40, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                layout
              >
                <span className="toast-icon"><Icon size={16} /></span>
                <span className="toast-message">{t.message}</span>
                <button
                  className="toast-close"
                  onClick={() => removeToast(t.id)}
                  aria-label="Dismiss notification"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
