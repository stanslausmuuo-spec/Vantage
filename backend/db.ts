import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run('PRAGMA foreign_keys = ON;');
    db.run('PRAGMA journal_mode=WAL;');
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE,
          password TEXT,
          role TEXT DEFAULT 'engineer',
          display_name TEXT,
          avatar_url TEXT,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          color TEXT DEFAULT '#6366f1',
          user_id INTEGER,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'To Do',
          priority TEXT DEFAULT 'medium',
          assignee_id INTEGER,
          due_date TEXT,
          tags TEXT DEFAULT '[]',
          project_id INTEGER,
          assigner_id INTEGER,
          created_at TEXT DEFAULT (datetime('now')),
          order_index REAL DEFAULT 0,
          FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
          FOREIGN KEY (assignee_id) REFERENCES users (id) ON DELETE SET NULL,
          FOREIGN KEY (assigner_id) REFERENCES users (id) ON DELETE SET NULL
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS task_dependencies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER NOT NULL,
          depends_on_id INTEGER NOT NULL,
          FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
          FOREIGN KEY (depends_on_id) REFERENCES tasks (id) ON DELETE CASCADE
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS activity_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          project_id INTEGER,
          task_id INTEGER,
          action TEXT NOT NULL,
          details TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS workflow_rules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          trigger_project TEXT,
          trigger_status TEXT,
          action_type TEXT NOT NULL,
          action_config TEXT,
          source_team TEXT,
          target_team TEXT,
          enabled INTEGER DEFAULT 1,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS builds (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          branch TEXT,
          commit_sha TEXT,
          triggered_by TEXT,
          duration INTEGER,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          invoice_id TEXT NOT NULL,
          client_name TEXT NOT NULL,
          amount REAL NOT NULL,
          currency TEXT DEFAULT 'USD',
          status TEXT DEFAULT 'pending',
          due_date TEXT,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS calendar_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          event_type TEXT DEFAULT 'meeting',
          project_id INTEGER,
          FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        )
      `);
    });
  }
});

export default db;
