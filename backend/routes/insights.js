const express = require('express');
const db = require('../db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/bottlenecks', auth, (req, res) => {
  db.all(
    `SELECT p.id as project_id, p.name as project_name,
            COUNT(CASE WHEN t.status = 'To Do' THEN 1 END) as todo_count,
            COUNT(CASE WHEN t.status = 'In Progress' THEN 1 END) as in_progress_count,
            COUNT(*) as total_tasks
     FROM projects p
     LEFT JOIN tasks t ON t.project_id = p.id
     WHERE p.user_id = ?
     GROUP BY p.id`,
    [req.user.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const alerts = rows.filter(r => r.total_tasks > 0 && (r.in_progress_count / r.total_tasks) > 0.6)
        .map(r => ({
          project_id: r.project_id,
          project_name: r.project_name,
          severity: (r.in_progress_count / r.total_tasks) > 0.8 ? 'high' : 'medium',
          message: `"${r.project_name}" has ${r.in_progress_count}/${r.total_tasks} tasks in progress — consider rebalancing workload.`,
        }));
      res.json({ projects: rows, alerts });
    }
  );
});

router.get('/velocity', auth, (req, res) => {
  db.all(
    `SELECT DATE(t.created_at) as day, COUNT(*) as completed
     FROM tasks t
     JOIN projects p ON t.project_id = p.id
     WHERE p.user_id = ? AND t.status = 'Done'
       AND t.created_at >= datetime('now', '-30 days')
     GROUP BY DATE(t.created_at)
     ORDER BY day`,
    [req.user.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const avg = rows.length > 0 ? rows.reduce((s, r) => s + r.completed, 0) / rows.length : 0;
      res.json({ daily: rows, avg_velocity: Math.round(avg * 10) / 10 });
    }
  );
});

router.get('/brief', auth, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  db.all(
    `SELECT p.name as project_name, t.title, t.status, t.due_date, t.priority, u.username as assignee_name
     FROM tasks t
     JOIN projects p ON t.project_id = p.id
     LEFT JOIN users u ON t.assignee_id = u.id
     WHERE p.user_id = ? AND (t.due_date = ? OR t.status = 'In Progress')
     ORDER BY t.due_date ASC, t.priority DESC`,
    [req.user.user_id, today],
    (err, tasks) => {
      if (err) return res.status(500).json({ error: err.message });
      db.all(
        `SELECT p.name as project_name, COUNT(*) as blocked_count
         FROM tasks t JOIN projects p ON t.project_id = p.id
         WHERE p.user_id = ? AND t.status = 'To Do'
         GROUP BY p.id`,
        [req.user.user_id],
        (err2, blockers) => {
          if (err2) return res.status(500).json({ error: err2.message });
          const overdue = tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'Done');
          res.json({
            date: today,
            total_active: tasks.length,
            overdue_count: overdue.length,
            overdue_tasks: overdue,
            in_progress: tasks.filter(t => t.status === 'In Progress'),
            due_today: tasks.filter(t => t.due_date === today && t.status !== 'Done'),
            blockers,
          });
        }
      );
    }
  );
});

module.exports = router;