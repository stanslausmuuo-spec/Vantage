/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, FolderKanban, BarChart3, Sun, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../api';

const DEFAULT_ACTIONS = [
  { id: 'new-project', icon: Plus, title: 'New Project', desc: 'Create a new project', action: 'createProject' },
  { id: 'brief', icon: BarChart3, title: 'Morning Brief', desc: 'View daily summary', action: 'openBrief' },
  { id: 'deepwork', icon: Sun, title: 'Toggle Deep Work', desc: 'Minimize distractions', action: 'toggleDeepWork' },
  { id: 'projects', icon: FolderKanban, title: 'Go to Dashboard', desc: 'View all projects', action: 'goDashboard' },
];

const CommandPalette = () => {
  const { commandOpen, setCommandOpen, deepWork, setDeepWork, setBriefOpen } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(DEFAULT_ACTIONS);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [projects, setProjects] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (commandOpen) {
      setQuery('');
      setSelectedIndex(0);
      setResults(DEFAULT_ACTIONS);
      setTimeout(() => inputRef.current?.focus(), 50);
      api.get('/projects').then(r => setProjects(r.data)).catch(() => {});
    }
  }, [commandOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(DEFAULT_ACTIONS);
      return;
    }
    const lower = query.toLowerCase();
    const filtered = DEFAULT_ACTIONS.filter(a =>
      a.title.toLowerCase().includes(lower) || a.desc.toLowerCase().includes(lower)
    );

    const matchedProjects = projects.filter(p =>
      p.name.toLowerCase().includes(lower)
    ).map(p => ({
      id: `project-${p.id}`,
      icon: FolderKanban,
      title: p.name,
      desc: 'Open project',
      action: 'goProject',
      projectId: p.id,
    }));

    const naturalResults = [
      { id: 'nlp', icon: Zap, title: `Create: "${query}"`, desc: 'Create a new task from natural language', action: 'nlpTask' },
    ];

    setResults([...naturalResults, ...filtered, ...matchedProjects]);
    setSelectedIndex(0);
  }, [query, projects]);

  const execute = useCallback(async (item) => {
    setCommandOpen(false);
    switch (item.action) {
      case 'createProject':
        navigate('/');
        setTimeout(() => document.querySelector('[data-new-project]')?.click(), 100);
        break;
      case 'openBrief':
        setBriefOpen(true);
        break;
      case 'toggleDeepWork':
        setDeepWork(!deepWork);
        break;
      case 'goDashboard':
        navigate('/');
        break;
      case 'goProject':
        navigate(`/project/${item.projectId}`);
        break;
      case 'nlpTask':
        navigate('/');
        break;
    }
  }, [navigate, setCommandOpen, setBriefOpen, setDeepWork, deepWork]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      execute(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setCommandOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {commandOpen && (
        <motion.div
          className="command-palette-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setCommandOpen(false)}
        >
          <motion.div
            className="command-palette"
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="command-input-wrap">
              <Search size={18} />
              <input
                ref={inputRef}
                className="command-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search or type a command..."
              />
              <kbd>ESC</kbd>
            </div>

            {results.length > 0 && (
              <div className="command-hint">Suggestions</div>
            )}

            <div className="command-results">
              {results.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No results found
                </div>
              )}
              {results.map((item, i) => (
                <div
                  key={item.id}
                  className={`command-item ${i === selectedIndex ? 'selected' : ''}`}
                  onClick={() => execute(item)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <div className="command-item-icon">
                    <item.icon size={16} />
                  </div>
                  <div className="command-item-info">
                    <div className="command-item-title">{item.title}</div>
                    <div className="command-item-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;