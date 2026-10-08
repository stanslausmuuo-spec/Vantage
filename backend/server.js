require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const db = require('./db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const nlpRoutes = require('./routes/nlp');
const insightsRoutes = require('./routes/insights');
const workflowRoutes = require('./routes/workflow');
const studioRoutes = require('./routes/studio');

const app = express();
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

// Security
app.use(helmet({
  contentSecurityPolicy: isDev ? false : undefined,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Auth rate limit (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts, please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/nlp', nlpRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/studio', studioRoutes);

// Serve frontend in production
if (!isDev) {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

// Auto-seed on startup
db.get(`SELECT id FROM users LIMIT 1`, [], (err, row) => {
  if (!err && !row) {
    console.log('Empty database detected — running seed...');
    require('./seed');
  }
});

app.listen(PORT, () => {
  console.log(`Vantage API running on port ${PORT}`);
  console.log(`Environment: ${isDev ? 'development' : 'production'}`);
});