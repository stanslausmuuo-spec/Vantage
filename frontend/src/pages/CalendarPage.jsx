import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../api';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();
  const { setShowNewProjectModal } = useApp();

  useEffect(() => {
    api.get('/projects').then(r => {
      setProjects(r.data);
      if (r.data.length === 0) return;
      r.data.forEach(p => {
        api.get(`/tasks?project_id=${p.id}`).then(res => {
          setTasks(prev => [...prev, ...res.data.map(t => ({ ...t, project_name: p.name, project_id: p.id }))]);
        }).catch(() => {});
      });
    }).catch(() => setProjects([]));
  }, []);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const taskMap = useMemo(() => {
    const map = {};
    tasks.filter(t => t.due_date).forEach(t => {
      const d = t.due_date.split('T')[0];
      if (!map[d]) map[d] = [];
      map[d].push(t);
    });
    return map;
  }, [tasks]);

  const today = new Date().toISOString().split('T')[0];

  const calendarDays = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ day: d, date: dateStr, tasks: taskMap[dateStr] || [] });
  }

  const noProjects = projects !== null && projects.length === 0;
  const loading = projects === null;

  return (
    <div className="page-layout">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div className="flex items-center gap-3">
          <Calendar size={22} />
          <h1>Calendar</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-icon" onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-h)', minWidth: 160, textAlign: 'center' }}>
            {MONTHS[month]} {year}
          </span>
          <button className="btn-icon" onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="skeleton" style={{ height: 400, borderRadius: 12 }} />
      ) : noProjects ? (
        <div className="page-empty" style={{ marginTop: 40 }}>
          <Calendar size={40} className="page-empty-icon" />
          <h3>No projects yet</h3>
          <p>Create a project and set due dates on tasks — they'll appear on the calendar.</p>
          <button className="btn btn-primary" onClick={() => setShowNewProjectModal(true)}>
            <Plus size={16} /> Create Project
          </button>
        </div>
      ) : (
        <div className="calendar-grid">
          {DAYS.map(d => <div key={d} className="calendar-header-day">{d}</div>)}
          {calendarDays.map((day, i) => (
            <div key={i} className={`calendar-day ${day && day.date === today ? 'calendar-today' : ''}`}>
              {day && (
                <>
                  <span className="calendar-day-num">{day.day}</span>
                  <div className="calendar-day-tasks">
                    {day.tasks.slice(0, 3).map(t => (
                      <div key={t.id} className="calendar-task-chip" onClick={() => navigate(`/project/${t.project_id}`)}>
                        {t.title.slice(0, 12)}
                      </div>
                    ))}
                    {day.tasks.length > 3 && <span className="calendar-more">+{day.tasks.length - 3}</span>}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}