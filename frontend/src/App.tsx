import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CommandIcon, Search, Sun, Moon, LogOut, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';
import GlobalSearch from './components/GlobalSearch';
import CommandPalette from './components/CommandPalette';
import MorningBrief from './components/MorningBrief';
import NewProjectModal from './components/NewProjectModal';
import { ToastProvider } from './components/Toast';
import './index.css';
import './App.css';

const Auth = lazy(() => import('./components/Auth'));
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
  const { user, logout, deepWork, setDeepWork, setCommandOpen, setSearchOpen, setBriefOpen } = useApp();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler as any);
    return () => window.removeEventListener('keydown', handler as any);
  }, [setCommandOpen, setSearchOpen]);

  if (!user) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="*" element={<Auth />} />
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
          >
            <CommandIcon size={18} />
          </motion.button>
        </div>

        <motion.button
          className="app-global-search"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setSearchOpen(true)}
        >
          <Search size={15} />
          <span>Search projects, tasks, people...</span>
          <kbd>Ctrl+Shift+F</kbd>
        </motion.button>

        <div className="app-header-right">
          <button className="btn-icon" onClick={() => setBriefOpen(true)} title="Morning Brief">
            <BarChart3 size={16} />
          </button>
          <motion.button
            className="btn-icon"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDeepWork(!deepWork)}
            title={deepWork ? 'Exit Deep Work' : 'Enter Deep Work'}
          >
            {deepWork ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>
          <motion.button
            className="btn-icon btn-logout"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            title="Logout"
          >
            <LogOut size={16} />
          </motion.button>
        </div>
      </header>

      <div className="app-body">
        <Sidebar />
        <main className="app-main">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/studio" element={<AppVibeStudio />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/deployments" element={<DeploymentsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      <GlobalSearch />
      <CommandPalette />
      <MorningBrief />
      <NewProjectModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
