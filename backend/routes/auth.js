const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// Roles a user may self-select at signup. Elevated roles (executive) are
// assigned by an administrator, never requested by the client.
const ALLOWED_SIGNUP_ROLES = ['engineer', 'manager'];

// Register a new user
router.post('/signup', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!(username && password)) {
      return res.status(400).send('All input is required');
    }

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);
    const userRole = ALLOWED_SIGNUP_ROLES.includes(role) ? role : 'engineer';

    db.run(
      `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
      [username.toLowerCase(), encryptedPassword, userRole],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).send('User already exists. Please login');
          }
          return res.status(500).send(err.message);
        }

        const token = jwt.sign(
          { user_id: this.lastID, username },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: '2h' }
        );

        res.status(201).json({ id: this.lastID, username, role: userRole, token });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send('Error occurred');
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!(username && password)) {
      return res.status(400).send('All input is required');
    }

    db.get(
      `SELECT * FROM users WHERE username = ?`,
      [username.toLowerCase()],
      async (err, user) => {
        if (err) {
          return res.status(500).send(err.message);
        }

        if (user && (await bcrypt.compare(password, user.password))) {
          const token = jwt.sign(
            { user_id: user.id, username },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '2h' }
          );

          return res.status(200).json({ id: user.id, username, role: user.role, token });
        }
        res.status(400).send('Invalid Credentials');
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send('Error occurred');
  }
});

module.exports = router;
