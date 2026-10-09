<div align="center">

```
██╗   ██╗ █████╗ ███╗   ██╗████████╗ █████╗  ██████╗ ███████╗
██║   ██║██╔══██╗████╗  ██║╚══██╔══╝██╔══██╗██╔════╝ ██╔════╝
██║   ██║███████║██╔██╗ ██║   ██║   ███████║██║  ███╗█████╗
╚██╗ ██╔╝██╔══██║██║╚██╗██║   ██║   ██╔══██║██║   ██║██╔══╝
 ╚████╔╝ ██║  ██║██║ ╚████║   ██║   ██║  ██║╚██████╔╝███████╗
  ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
```

**Natural language in. Structured work out.**

A project-management workspace that turns a sentence into a tracked task,
surfaces what is blocked, and stays out of the way while you work.

</div>

---

[ overview ](#overview) · [ quick start ](#quick-start) · [ architecture ](#architecture) · [ api ](#api-reference) · [ configuration ](#configuration) · [ scripts ](#scripts) · [ design ](#design-system)

---

## Overview

Vantage is a full-stack project-management application. Your workspace is
organised around projects, each holding a Kanban board of tasks that carry a
status, priority, assignee, due date, and tags.

Beyond the board, Vantage adds three things:

- **Capture without forms.** A Smart Input parses natural language
  (`"Design review due tomorrow high priority @alex"`) into structured task
  fields on the server.
- **A morning brief.** Overdue, due-today, in-progress, and blocked work is
  summarised in a single drawer, and bottleneck alerts roll up across projects.
- **App Vibe Studio.** A read-only engineering view: build health, code
  activity, deployments, payments, API endpoints, database schema, and team
  activity in one grid.

Access is role-aware (`engineer`, `manager`, `executive`) and authenticated with
JWTs over a per-user SQLite database.

### Built with

![React](https://img.shields.io/badge/React-19-1a1814?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-a34c26?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-37704f?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-1a1814?style=flat-square&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3%20WAL-5b6b7a?style=flat-square&logo=sqlite&logoColor=white)

---

## Quick start

Three steps. The backend seeds a demo account on first launch, so there is
nothing to configure.

```bash
# 1. Clone
git clone <your-repo-url> vantage && cd vantage

# 2. Backend  ->  http://localhost:5000
cd backend && npm install && npm run dev

# 3. Frontend ->  http://localhost:5173   (in a second terminal)
cd frontend && npm install && npm run dev
```

Open <http://localhost:5173> and sign in.

```
username  demo
password  password123
```

The API answers health checks at <http://localhost:5000/api/health>.

> The frontend talks to `http://localhost:5000/api` by default. If you change the
> backend port, update `API_BASE_URL` in `frontend/src/api.js` (see
> [Configuration](#configuration)).

---

## Architecture

```
  ┌─────────────┐        HTTPS / JSON        ┌──────────────────┐
  │   Browser   │  ───────────────────────▶  │  Express API     │
  │  React SPA  │  ◀───────────────────────  │  :5000           │
  └─────────────┘   JWT in Authorization      └────────┬─────────┘
                                                        │ sqlite3 (promise-free
                                                        │ callback driver)
                                                ┌───────▼─────────┐
                                                │  SQLite (WAL)   │
                                                │ database.sqlite │
                                                └─────────────────┘
```

The frontend and backend are independent npm projects with no shared tooling
(no root workspace package). In development, Vite serves the SPA on `:5173` and
proxies nothing — the SPA calls the API directly using CORS. In production, the
Express server serves the built SPA from `frontend/dist` and falls back to
`index.html` for client-side routes.

### Entry points

| Concern | File |
|---|---|
| API server, middleware, route mounting | `backend/server.ts` |
| Database connection and schema | `backend/db.js` |
| Demo data seeding | `backend/seed.js` |
| SPA bootstrap | `frontend/src/main.jsx` |
| Routing and app shell | `frontend/src/App.jsx` |
| Global auth/session/UI state | `frontend/src/context/AppContext.jsx` |
| HTTP client and auth header | `frontend/src/api.js` |

---

## Project structure

```
vantage/
├── backend/
│   ├── server.ts              # Express app: security, rate limits, routes
│   ├── db.js                  # SQLite connection + CREATE TABLE statements
│   ├── db.ts / server.ts      # TypeScript variants (see Known issues)
│   ├── seed.js                # Demo users, projects, tasks, studio data
│   ├── routes/                # auth, projects, tasks, nlp, insights,
│   │                          # workflow, studio
│   └── middleware/            # authMiddleware, rbac, errorHandler
├── frontend/
│   └── src/
│       ├── components/        # Dashboard, ProjectDetail, Sidebar, modals…
│       ├── pages/             # Tasks, Calendar, Team, Payments, Deployments
│       ├── context/           # AppProvider (session, modals, deep-work)
│       ├── hooks/             # useOptimistic
│       ├── api.js             # Axios instance + interceptors
│       ├── index.css          # Paper & Signal design tokens
│       └── App.css            # Shell and component styles
└── docs/
    ├── ui-ux-research.md      # Design doctrine and references
    └── ui-ux-audit.md         # Before-state audit and change list
```

---

## API reference

All routes are prefixed with `/api`. Everything except `auth` and `health`
requires a `Bearer <token>` header. Resources are scoped to the authenticated
user unless noted.

| Group | Method + path | Purpose |
|---|---|---|
| Auth | `POST /auth/signup` | Create an account, return a JWT |
| Auth | `POST /auth/login` | Exchange credentials for a JWT |
| Projects | `GET /projects` | List projects with task/done counts |
| Projects | `POST /projects` | Create a project |
| Projects | `GET/PUT/DELETE /projects/:id` | Read, update, delete one project |
| Tasks | `GET /tasks?project_id=` | List tasks for a project |
| Tasks | `POST /tasks` | Create a task |
| Tasks | `PUT/DELETE /tasks/:id` | Update or delete a task |
| Tasks | `PUT /tasks/reorder/bulk` | Persist Kanban order/status |
| NLP | `POST /nlp/parse` | Extract date, priority, status, assignee from text |
| Insights | `GET /insights/brief` | Morning-brief payload |
| Insights | `GET /insights/bottlenecks` | Per-project workload alerts |
| Insights | `GET /insights/velocity` | 30-day completion trend |
| Workflow | `GET/POST/DELETE /workflow/rules` | Automation rules |
| Workflow | `GET/POST/DELETE /workflow/dependencies` | Task dependencies |
| Workflow | `GET /workflow/activity` | Activity feed |
| Studio | `GET /studio/builds` | Recent builds |
| Studio | `GET/POST /studio/code-activity` | Commit / PR activity |
| Studio | `GET /studio/deployments` | Deployment pipeline |
| Studio | `GET /studio/payments` | Payment transactions |
| Studio | `GET/POST /studio/endpoints` | Registered API endpoints |
| Studio | `GET /studio/schema` | Live database schema (ERD) |
| Studio | `GET/POST /studio/team-activity` | Team activity feed |
| Studio | `GET /studio/search?q=` | Global search across projects/tasks/users |
| Health | `GET /api/health` | Liveness probe |

---

## Configuration

Backend configuration lives in `backend/.env` (see `backend/.env.example`).

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | API server port |
| `JWT_SECRET` | — | Signing secret. **Required in production** |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |
| `NODE_ENV` | `development` | Enables strict CSP and serves `frontend/dist` when `production` |

The frontend API base URL is set in `frontend/src/api.js`
(`API_BASE_URL`, default `http://localhost:5000/api`).

- Security headers via `helmet`, with CSP disabled only in development.
- Global rate limit: 200 requests / 15 min. Stricter limit on login/signup:
  20 requests / 15 min.

---

## Scripts

**Backend** (`cd backend`)

| Command | Description |
|---|---|
| `npm run dev` | Start the API with `tsx` (watch mode) |
| `npm start` | Start the API with `tsx` |
| `npm test` | Run Vitest test suite |

**Frontend** (`cd frontend`)

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build to `frontend/dist` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Design system

The interface follows a doctrine the repo calls **Paper & Signal**, documented in
[docs/ui-ux-research.md](docs/ui-ux-research.md) with a before-state audit in
[docs/ui-ux-audit.md](docs/ui-ux-audit.md).

- **Surfaces:** warm paper canvas, hairline borders, shadows reserved for overlays.
- **Accent:** a single terracotta signal doing double duty for primary action,
  focus ring, and active navigation. Status colors are reserved for meaning.
- **Type:** three registers — `Fraunces` (display), `Public Sans` (body),
  `JetBrains Mono` (labels, IDs, counts with `tabular-nums`).
- **Motion:** 100–160 ms ease-out, with `prefers-reduced-motion` honoured in both
  CSS and Framer Motion.

---

## Tech stack

| Layer | Choices |
|---|---|
| Frontend | React 19, Vite 8, React Router 7, Framer Motion, dnd-kit, Recharts, Axios, Lucide |
| Backend | Node.js, Express 4, `sqlite3`, `bcryptjs`, `jsonwebtoken`, Helmet, `express-rate-limit` |
| Data | SQLite in WAL mode (users, projects, tasks, dependencies, activity, workflow rules, builds, deployments, code activity, payments, endpoints, team activity) |
| Tooling | ESLint, Vitest, `tsx` |

---

## Known issues

These are tracked and queued for a follow-up pass:

- The backend carries **duplicate JavaScript and TypeScript sources**
  (`server.js`/`server.ts`, `db.js`/`db.ts`). The CommonJS `.js` files are what
  run; the TypeScript variants are partially out of sync.
- An unused `frontend/src/App.tsx` uses a different route shape (`/projects/:id`)
  than the live `App.jsx` (`/project/:id`).

---

## License

No license file is present. The project is currently **all rights reserved**
until a license is added.
