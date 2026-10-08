const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const db = require('../db');
    db.get(`SELECT role FROM users WHERE id = ?`, [req.user.user_id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'User not found' });
      if (!roles.includes(row.role)) {
        return res.status(403).json({ error: `Requires one of roles: ${roles.join(', ')}` });
      }
      req.user.role = row.role;
      next();
    });
  };
};

module.exports = { requireRole };