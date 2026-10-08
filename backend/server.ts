import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import db from './db';
import { errorHandler, notFound } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import nlpRoutes from './routes/nlp';
import insightsRoutes from './routes/insights';
import workflowRoutes from './routes/workflow';
import studioRoutes from './routes/studio';

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
db.get(`SELECT id FROM users LIMIT 1`, [], (err: any, row: any) => {
  if (!err && !row) {
    console.log('Empty database detected — running seed...');
    import('./seed');
  }
});

app.listen(PORT, () => {
  console.log(`Vantage API running on port ${PORT}`);
  console.log(`Environment: ${isDev ? 'development' : 'production'}`);
});
