const express = require('express');
const db = require('../db');
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

router.get('/', auth, (req, res) => {
  const projectId = req.query.project_id;
  if (!projectId) {
    return res.status(400).json({ error: 'project_id required' });
  }
  db.get(
    `SELECT * FROM projects WHERE id = ? AND user_id = ?`,
    [projectId, req.user.user_id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(403).json({ error: 'Not authorized' });
      db.all(
        `SELECT t.*, u.username as assignee_name
         FROM tasks t
         LEFT JOIN users u ON t.assignee_id = u.id
         WHERE t.project_id = ?
         ORDER BY t.order_index ASC`,
        [projectId],
        (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          rows.forEach(r => { try { r.tags = JSON.parse(r.tags); } catch { r.tags = []; } });
          res.json(rows);
        }
      );
    }
  );
});

router.post('/', auth, (req, res) => {
  const { title, description, status, priority, assignee_id, due_date, tags, project_id } = req.body;
  if (!title || !project_id) {
    return res.status(400).json({ error: 'Title and project_id required' });
  }
  const tagStr = JSON.stringify(tags || []);
  const ord = Date.now();
  db.run(
    `INSERT INTO tasks (title, description, status, priority, assignee_id, due_date, tags, project_id, assigner_id, order_index)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description || '', status || 'To Do', priority || 'medium', assignee_id || null, due_date || null, tagStr, project_id, req.user.user_id, ord],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get(`SELECT t.*, u.username as assignee_name FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id WHERE t.id = ?`, [this.lastID], (e2, row) => {
        if (e2) return res.status(500).json({ error: e2.message });
        try { row.tags = JSON.parse(row.tags); } catch { row.tags = []; }
        res.status(201).json(row);
      });
    }
  );
});

router.put('/:id', auth, (req, res) => {
  const taskId = req.params.id;
  const { title, description, status, priority, assignee_id, due_date, tags, order_index } = req.body;
  db.get(
    `SELECT tasks.id FROM tasks JOIN projects ON tasks.project_id = projects.id WHERE tasks.id = ? AND projects.user_id = ?`,
    [taskId, req.user.user_id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Task not found' });
      const tagStr = tags !== undefined ? JSON.stringify(tags) : undefined;
      db.run(
        `UPDATE tasks SET
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          status = COALESCE(?, status),
          priority = COALESCE(?, priority),
          assignee_id = COALESCE(?, assignee_id),
          due_date = COALESCE(?, due_date),
          tags = COALESCE(?, tags),
          order_index = COALESCE(?, order_index)
         WHERE id = ?`,
        [title, description, status, priority, assignee_id, due_date, tagStr, order_index, taskId],
        function (err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          db.get(`SELECT t.*, u.username as assignee_name FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id WHERE t.id = ?`, [taskId], (e3, updated) => {
            if (e3) return res.status(500).json({ error: e3.message });
            try { updated.tags = JSON.parse(updated.tags); } catch { updated.tags = []; }
            res.json(updated);
          });
        }
      );
    }
  );
});

router.delete('/:id', auth, (req, res) => {
  const taskId = req.params.id;
  db.get(
    `SELECT tasks.id FROM tasks JOIN projects ON tasks.project_id = projects.id WHERE tasks.id = ? AND projects.user_id = ?`,
    [taskId, req.user.user_id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Task not found' });
      db.run(`DELETE FROM tasks WHERE id = ?`, [taskId], function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ message: 'Task deleted successfully' });
      });
    }
  );
});

// Reorder tasks (bulk update order_index)
router.put('/reorder/bulk', auth, (req, res) => {
  const { tasks } = req.body;
  if (!Array.isArray(tasks)) return res.status(400).json({ error: 'tasks array required' });
  const stmt = db.prepare(`UPDATE tasks SET order_index = ?, status = ? WHERE id = ? AND project_id IN (SELECT id FROM projects WHERE user_id = ?)`);
  let done = 0;
  tasks.forEach((t, i) => {
    stmt.run(t.order_index, t.status, t.id, req.user.user_id, (err) => {
      if (err) console.error(err);
      done++;
      if (done === tasks.length) {
        stmt.finalize();
        res.json({ message: 'Reordered' });
      }
    });
  });
  if (tasks.length === 0) res.json({ message: 'Reordered' });
});

module.exports = router;
