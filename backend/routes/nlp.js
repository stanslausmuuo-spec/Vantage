const express = require('express');
const db = require('../db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

const DAYS = ['today', 'tomorrow', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'next week', 'next month'];
const PRIORITIES = { high: 'high', urgent: 'high', critical: 'high', medium: 'medium', normal: 'medium', low: 'low', minor: 'low' };
const STATUSES = { todo: 'To Do', backlog: 'To Do', progress: 'In Progress', wip: 'In Progress', working: 'In Progress', done: 'Done', complete: 'Done', finished: 'Done' };

function parseDate(text) {
  const lower = text.toLowerCase();
  const now = new Date();
  if (lower.includes('today')) return new Date(now.getTime() + 86400000).toISOString().split('T')[0];
  if (lower.includes('tomorrow')) return new Date(now.getTime() + 2 * 86400000).toISOString().split('T')[0];
  const dayMap = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0 };
  for (const [day, offset] of Object.entries(dayMap)) {
    if (lower.includes(day)) {
      const current = now.getDay();
      let diff = offset - current;
      if (diff <= 0) diff += 7;
      return new Date(now.getTime() + (diff + 1) * 86400000).toISOString().split('T')[0];
    }
  }
  if (lower.includes('next week')) {
    const d = new Date(now.getTime() + (8 - now.getDay()) * 86400000);
    return d.toISOString().split('T')[0];
  }
  if (lower.includes('next month')) {
    const d = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return d.toISOString().split('T')[0];
  }
  return null;
}

function extractPriority(text) {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(PRIORITIES)) {
    if (lower.includes(key)) return val;
  }
  return 'medium';
}

function extractStatus(text) {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(STATUSES)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

function extractAssignee(text, users) {
  for (const u of users) {
    if (text.toLowerCase().includes(u.username.toLowerCase())) return u.id;
  }
  return null;
}

router.post('/parse', auth, (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });

  db.all(`SELECT id, username FROM users`, [], (err, users) => {
    if (err) return res.status(500).json({ error: err.message });

    const title = text.charAt(0).toUpperCase() + text.slice(1);
    const due_date = parseDate(text);
    const priority = extractPriority(text);
    const status = extractStatus(text) || 'To Do';
    const assignee_id = extractAssignee(text, users);

    res.json({
      title,
      description: text,
      priority,
      status,
      due_date,
      assignee_id,
    });
  });
});

module.exports = router;