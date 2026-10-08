import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ListTodo, Calendar, Users, ChevronLeft,
  CreditCard, Cloud, Plus, Bot,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'projects', icon: LayoutDashboard, label: 'Projects', path: '/' },
  { id: 'tasks', icon: ListTodo, label: 'Tasks', path: '/tasks' },
  { id: 'calendar', icon: Calendar, label: 'Calendar', path: '/calendar' },
  { id: 'team', icon: Users, label: 'Team', path: '/team' },
];

const STUDIO_ITEM = { id: 'studio', icon: Bot, label: 'App Vibe Studio', path: '/studio', highlight: true };

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen, setShowNewProjectModal } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.aside
      className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      animate={{ width: sidebarOpen ? 220 : 56 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      <div className="sidebar-inner">
        <div className="sidebar-header">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.span
                className="sidebar-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                V<span>a</span>ntage
              </motion.span>
            )}
          </AnimatePresence>
          <button className="btn-icon sidebar-collapse" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <ChevronLeft size={16} style={{ transform: sidebarOpen ? 'rotate(0)' : 'rotate(180deg)' }} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">
            {sidebarOpen ? 'Workspace' : ''}
          </div>
          {NAV_ITEMS.map((item) => {
            const active = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <button
                key={item.id}
                className={`sidebar-item ${active ? 'sidebar-item-active' : ''}`}
                onClick={() => navigate(item.path)}
                title={item.label}
              >
                <item.icon size={18} />
                <AnimatePresence mode="wait">
                  {sidebarOpen && (
                    <motion.span
                      className="sidebar-item-label"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">
            {sidebarOpen ? 'Development' : ''}
          </div>
          <button
            className={`sidebar-item sidebar-studio-item ${STUDIO_ITEM.highlight ? 'sidebar-item-highlight' : ''} ${location.pathname === STUDIO_ITEM.path ? 'sidebar-item-active' : ''}`}
            onClick={() => navigate(STUDIO_ITEM.path)}
            title={STUDIO_ITEM.label}
          >
            <STUDIO_ITEM.icon size={18} />
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.span
                  className="sidebar-item-label"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                >
                  {STUDIO_ITEM.label}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </nav>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">
            {sidebarOpen ? 'Operations' : ''}
          </div>
          {[
            { id: 'payments', icon: CreditCard, label: 'Payments', path: '/payments' },
            { id: 'deployments', icon: Cloud, label: 'Deployments', path: '/deployments' },
          ].map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${location.pathname === item.path ? 'sidebar-item-active' : ''}`}
              onClick={() => navigate(item.path)}
              title={item.label}
            >
              <item.icon size={18} />
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.span
                    className="sidebar-item-label"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-footer">
          <button className="sidebar-item sidebar-new-btn" onClick={() => setShowNewProjectModal(true)}>
            <Plus size={18} />
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.span
                  className="sidebar-item-label"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                >
                  New Project
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;