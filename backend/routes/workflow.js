const express = require('express');
const db = require('../db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/rules', auth, (req, res) => {
  db.all(`SELECT * FROM workflow_rules`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    rows.forEach(r => { try { r.action_config = JSON.parse(r.action_config); } catch { r.action_config = {}; } });
    res.json(rows);
  });
});

router.post('/rules', auth, (req, res) => {
  const { name, trigger_project, trigger_status, action_type, action_config, source_team, target_team } = req.body;
  if (!name || !action_type) return res.status(400).json({ error: 'name and action_type required' });
  const config = JSON.stringify(action_config || {});
  db.run(
    `INSERT INTO workflow_rules (name, trigger_project, trigger_status, action_type, action_config, source_team, target_team)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, trigger_project || null, trigger_status || null, action_type, config, source_team || null, target_team || null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name, trigger_project, trigger_status, action_type, action_config, source_team, target_team });
    }
  );
});

router.delete('/rules/:id', auth, (req, res) => {
  db.run(`DELETE FROM workflow_rules WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Rule deleted' });
  });
});

router.get('/dependencies', auth, (req, res) => {
  db.all(
    `SELECT td.*, t.title as task_title, dt.title as depends_on_title
     FROM task_dependencies td
     JOIN tasks t ON td.task_id = t.id
     JOIN tasks dt ON td.depends_on_id = dt.id
     JOIN projects p ON t.project_id = p.id
     WHERE p.user_id = ?`,
    [req.user.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.post('/dependencies', auth, (req, res) => {
  const { task_id, depends_on_id } = req.body;
  if (!task_id || !depends_on_id) return res.status(400).json({ error: 'task_id and depends_on_id required' });
  db.run(
    `INSERT INTO task_dependencies (task_id, depends_on_id) VALUES (?, ?)`,
    [task_id, depends_on_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, task_id, depends_on_id });
    }
  );
});

router.delete('/dependencies/:id', auth, (req, res) => {
  db.run(`DELETE FROM task_dependencies WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Dependency removed' });
  });
});

// Activity log
router.get('/activity', auth, (req, res) => {
  db.all(
    `SELECT al.*, u.username
     FROM activity_log al
     JOIN users u ON al.user_id = u.id
     WHERE al.project_id IN (SELECT id FROM projects WHERE user_id = ?)
     ORDER BY al.created_at DESC LIMIT 50`,
    [req.user.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;