const express = require('express');
const db = require('../db');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', auth, (req, res) => {
  db.all(
    `SELECT p.*,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'Done') as done_count
     FROM projects p WHERE p.user_id = ? ORDER BY p.created_at DESC`,
    [req.user.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get a single project by ID
router.get('/:id', auth, (req, res) => {
  db.get(
    `SELECT * FROM projects WHERE id = ? AND user_id = ?`,
    [req.params.id, req.user.user_id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(row);
    }
  );
});

// Create a new project
router.post('/', auth, (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const color = req.body.color || '#6366f1';
  db.run(
    `INSERT INTO projects (name, description, color, user_id) VALUES (?, ?, ?, ?)`,
    [name, description, color, req.user.user_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name, description, color, user_id: req.user.user_id, task_count: 0, done_count: 0 });
    }
  );
});

// Update a project
router.put('/:id', auth, (req, res) => {
  const { name, description } = req.body;

  db.run(
    `UPDATE projects SET name = ?, description = ? WHERE id = ? AND user_id = ?`,
    [name, description, req.params.id, req.user.user_id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Project not found or not authorized' });
      }
      res.json({ id: req.params.id, name, description, user_id: req.user.user_id });
    }
  );
});

// Delete a project
router.delete('/:id', auth, (req, res) => {
  db.run(
    `DELETE FROM projects WHERE id = ? AND user_id = ?`,
    [req.params.id, req.user.user_id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Project not found or not authorized' });
      }
      res.json({ message: 'Project deleted successfully' });
    }
  );
});

module.exports = router;
