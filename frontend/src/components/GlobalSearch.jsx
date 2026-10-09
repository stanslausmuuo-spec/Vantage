/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, FolderKanban, ListTodo, User, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../api';

const GlobalSearch = () => {
  const { searchOpen, setSearchOpen } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      setResults(null);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (query.length < 2) { setResults(null); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/studio/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
        setSelectedIndex(0);
      } catch { /* silent */ }
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const flatItems = results
    ? [
        ...results.projects.map(p => ({ ...p, icon: FolderKanban })),
        ...results.tasks.map(t => ({ ...t, icon: ListTodo })),
        ...results.users.map(u => ({ ...u, icon: User })),
      ]
    : [];

  const handleSelect = (item) => {
    setSearchOpen(false);
    if (item.type === 'project') navigate(`/project/${item.id}`);
    else if (item.type === 'task') navigate(`/project/${item.project_id || ''}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, flatItems.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && flatItems[selectedIndex]) handleSelect(flatItems[selectedIndex]);
    else if (e.key === 'Escape') setSearchOpen(false);
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          className="command-palette-overlay"
          style={{ zIndex: 2100 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            className="command-palette"
            role="dialog"
            aria-modal="true"
            aria-label="Global search"
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="command-input-wrap">
              <Search size={18} />
              <input
                ref={inputRef}
                className="command-input"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search projects, tasks, people..."
                aria-label="Search projects, tasks, people"
              />
              <kbd>ESC</kbd>
            </div>

            {flatItems.length > 0 && (
              <div className="command-hint">
                {results?.projects?.length > 0 && `${results.projects.length} projects · `}
                {results?.tasks?.length > 0 && `${results.tasks.length} tasks · `}
                {results?.users?.length > 0 && `${results.users.length} users`}
              </div>
            )}

            <div className="command-results" role="listbox" aria-label="Search results">
              {flatItems.length === 0 && query.length >= 2 && (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No results for "{query}"
                </div>
              )}
              {flatItems.map((item, i) => (
                <div
                  key={`${item.type}-${item.id}`}
                  role="option"
                  aria-selected={i === selectedIndex}
                  className={`command-item ${i === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <div className="command-item-icon">
                    <item.icon size={16} />
                  </div>
                  <div className="command-item-info">
                    <div className="command-item-title">{item.name}</div>
                    <div className="command-item-desc">
                      {item.type}
                      {item.project_name && ` · ${item.project_name}`}
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-muted" />
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearch;