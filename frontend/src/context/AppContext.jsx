import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('username');
    const r = localStorage.getItem('role');
    const i = localStorage.getItem('userId');
    return u ? { id: i, username: u, role: r || 'engineer' } : null;
  });
  const [deepWork, setDeepWork] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [bottlenecks, setBottlenecks] = useState([]);

  const login = useCallback((data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.id);
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role || 'engineer');
    setUser({ id: data.id, username: data.username, role: data.role || 'engineer' });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setUser(null);
  }, []);

  const fetchBottlenecks = useCallback(async () => {
    try {
      const res = await api.get('/insights/bottlenecks');
      setBottlenecks(res.data.alerts || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (user) fetchBottlenecks(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [user, fetchBottlenecks]);

  return (
    <AppContext.Provider value={{
      user, login, logout,
      deepWork, setDeepWork,
      sidebarOpen, setSidebarOpen,
      commandOpen, setCommandOpen,
      searchOpen, setSearchOpen,
      briefOpen, setBriefOpen,
      showNewProjectModal, setShowNewProjectModal,
      bottlenecks, fetchBottlenecks,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}