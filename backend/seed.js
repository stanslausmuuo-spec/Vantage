const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('Seeding database...');

  const hash = await bcrypt.hash('password123', 10);

  // Check if demo user exists
  db.get(`SELECT id FROM users WHERE username = 'demo'`, [], (err, user) => {
    if (err) return console.error('Seed error:', err.message);
    if (user) return console.log('Database already seeded — skipping.');

    db.serialize(() => {
      const now = new Date().toISOString();
      const today = now.split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      // Demo users
      const users = [
        ['demo', hash, 'engineer', 'Demo User'],
        ['alex', hash, 'engineer', 'Alex Chen'],
        ['jordan', hash, 'manager', 'Jordan Lee'],
        ['taylor', hash, 'engineer', 'Taylor Kim'],
        ['sam', hash, 'executive', 'Sam Rivera'],
      ];
      users.forEach(([u, p, r, dn]) => {
        db.run(`INSERT OR IGNORE INTO users (username, password, role, display_name) VALUES (?, ?, ?, ?)`, [u, p, r, dn]);
      });

      // Wait a tick for users to be inserted, then add related data
      setTimeout(() => {
        db.all(`SELECT id, username FROM users`, [], (err2, dbUsers) => {
          if (err2) return console.error(err2.message);
          const uid = dbUsers.find(u => u.username === 'demo')?.id || 1;

          // Projects
          const projects = [
            ['Website Redesign', 'Complete overhaul of the marketing site', '#6366f1', uid],
            ['Mobile App v2', 'React Native mobile application', '#22c55e', uid],
            ['API Gateway', 'Microservices API gateway', '#f59e0b', uid],
            ['Design System', 'Component library and design tokens', '#ec4899', uid],
            ['Data Pipeline', 'Real-time data processing pipeline', '#06b6d4', uid],
          ];
          projects.forEach(([n, d, c, u]) => {
            db.run(`INSERT INTO projects (name, description, color, user_id) VALUES (?, ?, ?, ?)`, [n, d, c, u]);
          });

          // Wait for projects
          setTimeout(() => {
            db.all(`SELECT id FROM projects WHERE user_id = ?`, [uid], (err3, projectRows) => {
              if (err3) return console.error(err3.message);
              const pids = projectRows.map(p => p.id);

              // Tasks
              const tasks = [];
              pids.forEach((pid, pi) => {
                const statuses = ['To Do', 'In Progress', 'Done'];
                const priorities = ['high', 'medium', 'low'];
                const taskNames = [
                  ['Setup CI/CD', 'Design homepage', 'Implement auth', 'Write tests', 'Performance audit', 'SEO optimization', 'Content migration', 'Analytics setup'],
                  ['Navigation component', 'User profile screen', 'Push notifications', 'Offline mode', 'State management', 'API integration', 'Onboarding flow', 'App store assets'],
                  ['Rate limiting', 'JWT refresh logic', 'WebSocket support', 'Caching layer', 'API documentation', 'Error handling', 'Load balancing', 'Monitoring'],
                  ['Color tokens', 'Typography scale', 'Button component', 'Form elements', 'Card component', 'Icon system', 'Dark mode', 'Layout primitives'],
                  ['Kafka integration', 'Schema registry', 'Stream processor', 'Data warehouse', 'Batch jobs', 'Alert rules', 'Dashboard', 'ETL pipeline'],
                ];
                const names = taskNames[pi] || taskNames[0];
                names.forEach((title, ti) => {
                  const status = statuses[ti % 3];
                  const priority = priorities[ti % 3];
                  const assignee_id = dbUsers[ti % dbUsers.length]?.id || uid;
                  const due = ti % 2 === 0 ? tomorrow : null;
                  const tags = JSON.stringify(ti % 3 === 0 ? ['frontend'] : ti % 3 === 1 ? ['backend'] : ['fullstack']);
                  tasks.push([title, '', status, priority, assignee_id, due, tags, pid, uid, ti * 1000]);
                });
              });
              tasks.forEach(([title, desc, status, priority, assignee, due, tags, pid, au, ord]) => {
                db.run(`INSERT INTO tasks (title, description, status, priority, assignee_id, due_date, tags, project_id, assigner_id, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [title, desc, status, priority, assignee, due, tags, pid, au, ord]);
              });

              // Builds
              const buildStatuses = ['success', 'success', 'success', 'failed', 'success', 'building', 'success', 'failed'];
              const buildNames = ['frontend-build', 'api-service', 'worker-process', 'mobile-build', 'design-tokens', 'data-pipeline', 'auth-service', 'webhook-handler'];
              buildNames.forEach((name, i) => {
                db.run(`INSERT INTO builds (name, status, branch, commit_hash, progress, user_id) VALUES (?, ?, ?, ?, ?, ?)`,
                  [name, buildStatuses[i], i % 2 === 0 ? 'main' : 'feat/new-feature', `a1b2c${i}d${i}e`, buildStatuses[i] === 'success' ? 100 : buildStatuses[i] === 'building' ? 60 : 34, uid]);
              });

              // Deployments
              const deployments = [
                ['production-deploy', 'production', 'success', 'https://vantage.app'],
                ['staging-release', 'staging', 'success', 'https://staging.vantage.app'],
                ['canary-test', 'production', 'success', 'https://vantage.app'],
                ['dev-deploy', 'development', 'building', null],
              ];
              deployments.forEach(([name, env, status, url]) => {
                db.run(`INSERT INTO deployments (name, environment, status, url, provider, user_id) VALUES (?, ?, ?, ?, ?, ?)`,
                  [name, env, status, url, 'Vercel', uid]);
              });

              // Code Activity
              const codeData = [
                [threeDaysAgo, 8, 2],
                [twoDaysAgo, 12, 3],
                [yesterday, 5, 1],
                [today, 15, 4],
              ];
              codeData.forEach(([d, c, pr]) => {
                db.run(`INSERT INTO code_activity (date, commits, pull_requests, user_id) VALUES (?, ?, ?, ?)`, [d, c, pr, uid]);
              });

              // Payments
              const payments = [
                ['Stripe', 299.99, 'completed', 'txn_stripe_001'],
                ['Apple Pay', 49.99, 'completed', 'txn_apple_001'],
                ['Credit Card', 149.99, 'completed', 'txn_cc_001'],
                ['Stripe', 599.99, 'pending', 'txn_stripe_002'],
                ['Apple Pay', 19.99, 'completed', 'txn_apple_002'],
                ['Credit Card', 89.99, 'failed', 'txn_cc_002'],
              ];
              payments.forEach(([g, a, s, t]) => {
                db.run(`INSERT INTO payments (gateway, amount, status, transaction_id, user_id) VALUES (?, ?, ?, ?, ?)`, [g, a, s, t, uid]);
              });

              // API Endpoints
              const endpoints = [
                ['GET', '/api/users', 'List all users', 'Controllers', 'users'],
                ['POST', '/api/users', 'Create user', 'Controllers', 'users'],
                ['GET', '/api/users/:id', 'Get user by ID', 'Services', 'users'],
                ['PUT', '/api/users/:id', 'Update user', 'Controllers', 'users'],
                ['DELETE', '/api/users/:id', 'Delete user', 'Middleware', 'users'],
                ['GET', '/api/tasks', 'List tasks', 'Controllers', 'tasks'],
                ['POST', '/api/tasks', 'Create task', 'Services', 'tasks'],
                ['PUT', '/api/tasks/:id', 'Update task', 'Controllers', 'tasks'],
                ['DELETE', '/api/tasks/:id', 'Delete task', 'Middleware', 'tasks'],
                ['GET', '/api/projects', 'List projects', 'Controllers', 'projects'],
                ['POST', '/api/projects', 'Create project', 'Controllers', 'projects'],
                ['GET', '/api/studio/builds', 'Build health', 'Services', 'builds'],
                ['GET', '/api/studio/deployments', 'Deployments', 'Services', 'deployments'],
                ['GET', '/api/studio/payments', 'Payments', 'Services', 'payments'],
                ['POST', '/api/auth/login', 'User login', 'Auth', 'users'],
                ['POST', '/api/auth/signup', 'User signup', 'Auth', 'users'],
              ];
              endpoints.forEach(([method, path, desc, logic, table]) => {
                db.run(`INSERT INTO api_endpoints (method, path, description, logic_layer, database_table) VALUES (?, ?, ?, ?, ?)`,
                  [method, path, desc, logic, table]);
              });

              // Team Activity
              const activity = [
                [uid, 'deployed', 'frontend v2.1', 'Production environment'],
                [uid, 'merged PR', '#42 auth flow', 'main branch'],
                [uid, 'created task', 'Design system audit', 'Project: Website Redesign'],
                [uid, 'updated profile', '', 'Account settings'],
                [uid, 'started build', 'api-service', 'Branch: main'],
                [uid, 'created project', 'Mobile App v2', 'New project initialized'],
              ];
              activity.forEach(([u, action, target, details]) => {
                db.run(`INSERT INTO team_activity (user_id, action, target, details) VALUES (?, ?, ?, ?)`, [u, action, target, details]);
              });

              console.log('Database seeded successfully!');
              console.log('  Demo login: demo / password123');
              console.log(`  ${tasks.length} tasks, ${builds.length} builds, ${deployments.length} deployments`);
              console.log(`  ${payments.length} payments, ${endpoints.length} endpoints`);
            });
          }, 100);
        });
      }, 100);
    });
  });
}

seed();