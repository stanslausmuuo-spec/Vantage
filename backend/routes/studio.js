const express = require('express');
const db = require('../db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Builds
router.get('/builds', auth, (req, res) => {
  db.all(
    `SELECT * FROM builds WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`,
    [req.user.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.post('/builds', auth, (req, res) => {
  const { name, branch, commit_hash } = req.body;
  db.run(
    `INSERT INTO builds (name, branch, commit_hash, status, progress, user_id) VALUES (?, ?, ?, 'building', 0, ?)`,
    [name || 'Unnamed Build', branch || 'main', commit_hash || '', req.user.user_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name, status: 'building', progress: 0 });
    }
  );
});

// Deployments
router.get('/deployments', auth, (req, res) => {
  db.all(
    `SELECT * FROM deployments WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`,
    [req.user.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Code Activity
router.get('/code-activity', auth, (req, res) => {
  db.all(
    `SELECT * FROM code_activity WHERE user_id = ? ORDER BY date DESC LIMIT 4`,
    [req.user.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const result = rows.reverse();
      res.json(result);
    }
  );
});

router.post('/code-activity', auth, (req, res) => {
  const { date, commits, pull_requests } = req.body;
  db.run(
    `INSERT INTO code_activity (date, commits, pull_requests, user_id) VALUES (?, ?, ?, ?)`,
    [date || new Date().toISOString().split('T')[0], commits || 0, pull_requests || 0, req.user.user_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Payments
router.get('/payments', auth, (req, res) => {
  db.all(
    `SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
    [req.user.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// API Endpoints
router.get('/endpoints', auth, (req, res) => {
  const projectId = req.query.project_id;
  let query = `SELECT e.*, p.name as project_name FROM api_endpoints e LEFT JOIN projects p ON e.project_id = p.id`;
  const params = [];
  if (projectId) {
    query += ` WHERE e.project_id = ?`;
    params.push(projectId);
  }
  query += ` ORDER BY e.path ASC`;
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/endpoints', auth, (req, res) => {
  const { method, path, description, logic_layer, database_table, project_id } = req.body;
  if (!path) return res.status(400).json({ error: 'path required' });
  db.run(
    `INSERT INTO api_endpoints (method, path, description, logic_layer, database_table, project_id) VALUES (?, ?, ?, ?, ?, ?)`,
    [method || 'GET', path, description || '', logic_layer || 'controllers', database_table || '', project_id || null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, method, path });
    }
  );
});

// Schema / ERD
router.get('/schema', auth, (req, res) => {
  db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`, [], (err, tables) => {
    if (err) return res.status(500).json({ error: err.message });
    const result = [];
    let done = 0;
    tables.forEach((t, i) => {
      db.all(`PRAGMA table_info(${t.name})`, [], (err2, cols) => {
        done++;
        if (!err2) result.push({ table: t.name, columns: cols.map(c => ({ name: c.name, type: c.type, pk: !!c.pk })) });
        if (done === tables.length) res.json(result);
      });
    });
    if (tables.length === 0) res.json([]);
  });
});

// Team Activity
router.get('/team-activity', auth, (req, res) => {
  db.all(
    `SELECT ta.*, u.username FROM team_activity ta JOIN users u ON ta.user_id = u.id ORDER BY ta.created_at DESC LIMIT 20`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.post('/team-activity', auth, (req, res) => {
  const { action, target, details } = req.body;
  if (!action) return res.status(400).json({ error: 'action required' });
  db.run(
    `INSERT INTO team_activity (user_id, action, target, details) VALUES (?, ?, ?, ?)`,
    [req.user.user_id, action, target || '', details || ''],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get(
        `SELECT ta.*, u.username FROM team_activity ta JOIN users u ON ta.user_id = u.id WHERE ta.id = ?`,
        [this.lastID],
        (err2, row) => {
          if (err2) return res.status(201).json({ id: this.lastID });
          res.status(201).json(row);
        }
      );
    }
  );
});

// Global Search
router.get('/search', auth, (req, res) => {
  const q = req.query.q;
  if (!q || q.length < 2) return res.json({ projects: [], tasks: [], users: [] });

  db.all(
    `SELECT id, name, 'project' as type FROM projects WHERE user_id = ? AND name LIKE ? LIMIT 5`,
    [req.user.user_id, `%${q}%`],
    (err, projects) => {
      if (err) return res.status(500).json({ error: err.message });
      db.all(
        `SELECT t.id, t.title as name, 'task' as type, p.name as project_name
         FROM tasks t JOIN projects p ON t.project_id = p.id
         WHERE p.user_id = ? AND t.title LIKE ? LIMIT 5`,
        [req.user.user_id, `%${q}%`],
        (err2, tasks) => {
          if (err2) return res.status(500).json({ error: err2.message });
          db.all(
            `SELECT id, username as name, 'user' as type FROM users WHERE username LIKE ? LIMIT 3`,
            [`%${q}%`],
            (err3, users) => {
              if (err3) return res.status(500).json({ error: err3.message });
              res.json({ projects, tasks, users });
            }
          );
        }
      );
    }
  );
});

module.exports = router;