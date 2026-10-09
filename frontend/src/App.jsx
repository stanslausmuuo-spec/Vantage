import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { CommandIcon, Search, Sun, Moon, LogOut, BarChart3 } from 'lucide-react';
import { motion, MotionConfig } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';
import GlobalSearch from './components/GlobalSearch';
import CommandPalette from './components/CommandPalette';
import MorningBrief from './components/MorningBrief';
import NewProjectModal from './components/NewProjectModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { ToastProvider } from './components/Toast';
import './index.css';
import './App.css';

const Auth = lazy(() => import('./components/Auth'));
const Landing = lazy(() => import('./components/Landing'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const ProjectDetail = lazy(() => import('./components/ProjectDetail'));
const AppVibeStudio = lazy(() => import('./components/AppVibeStudio'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const DeploymentsPage = lazy(() => import('./pages/DeploymentsPage'));

function PageLoader() {
  return (
    <div className="page-layout">
      <div className="skeleton" style={{ height: 32, width: 200, marginBottom: 24 }} />
      <div className="skeleton" style={{ height: 80, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 80, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 80 }} />
    </div>
  );
}

function AppContent() {
  const { user, logout, deepWork, setDeepWork, setCommandOpen, setSearchOpen, setBriefOpen, setShowNewProjectModal } = useApp();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let gPressed = false;
    const handler = (e) => {
      // Don't trigger shortcuts if user is typing in input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      }
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setShowNewProjectModal(true);
      }
      if (e.key === 'g' || e.key === 'G') {
        gPressed = true;
        setTimeout(() => { gPressed = false; }, 1500);
        return;
      }
      if (gPressed) {
        if (e.key === 'd' || e.key === 'D') navigate('/');
        if (e.key === 't' || e.key === 'T') navigate('/tasks');
        if (e.key === 'c' || e.key === 'C') navigate('/calendar');
        if (e.key === 's' || e.key === 'S') navigate('/studio');
        gPressed = false;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCommandOpen, setSearchOpen, setShowNewProjectModal, navigate]);

  if (!user) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
        <CommandPalette />
      </ErrorBoundary>
    );
  }

  return (
    <div className={`app ${deepWork ? 'app-deepwork' : ''}`}>
      <header className="app-header">
        <div className="app-header-left">
          <motion.button
            className="btn-icon"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCommandOpen(true)}
            title="Command Palette (Cmd+K)"
            aria-label="Open command palette"
          >
            <CommandIcon size={18} />
          </motion.button>
        </div>

        <motion.button
          className="app-global-search"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setSearchOpen(true)}
          aria-label="Open global search"
        >
          <Search size={15} />
          <span>Search projects, tasks, people...</span>
          <kbd>Ctrl+Shift+F</kbd>
        </motion.button>

        <div className="app-header-right">
          <button className="btn-icon" onClick={() => setBriefOpen(true)} title="Morning Brief" aria-label="Open morning brief">
            <BarChart3 size={16} />
          </button>
          <motion.button
            className="btn-icon"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDeepWork(!deepWork)}
            title={deepWork ? 'Exit Deep Work' : 'Deep Work Mode'}
            aria-label={deepWork ? 'Exit deep work mode' : 'Enter deep work mode'}
            aria-pressed={deepWork}
          >
            {deepWork ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>
          <div className="app-profile">
            <div className="app-profile-avatar">
              {user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="app-profile-info">
              <span className="app-profile-name">{user.username}</span>
              <span className="app-profile-role">{user.role}</span>
            </div>
            <motion.button
              className="btn-icon btn-icon-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              title="Logout"
              aria-label="Log out"
            >
              <LogOut size={14} />
            </motion.button>
          </div>
        </div>
      </header>

      <div className="app-layout">
        <Sidebar />

        <main className="app-main">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/project/:id" element={<ProjectDetail />} />
                <Route path="/studio" element={<AppVibeStudio />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/deployments" element={<DeploymentsPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      <NewProjectModal />
      <CommandPalette />
      <GlobalSearch />
      <MorningBrief />
      <KeyboardShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <MotionConfig reducedMotion="user">
            <AppContent />
          </MotionConfig>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;