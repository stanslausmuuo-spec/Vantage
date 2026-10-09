import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, Tooltip as ReTooltip, Cell } from 'recharts';
import {
  Code2, GitCommit, GitPullRequest, Cloud, Activity,
  Smartphone, Monitor, Server, Database, CreditCard,
  ArrowUpRight, Users, Plus, Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../api';

const COLORS = { success: '#37704f', warning: '#8a6216', danger: '#b23a2f', primary: '#a34c26' };

export default function AppVibeStudio() {
  const [builds, setBuilds] = useState([]);
  const [codeActivity, setCodeActivity] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [schema, setSchema] = useState([]);
  const [teamActivity, setTeamActivity] = useState([]);
  const [hasProjects, setHasProjects] = useState(null);

  useEffect(() => {
    api.get('/projects').then(r => setHasProjects(r.data.length > 0)).catch(() => setHasProjects(false));
    api.get('/studio/builds').then(r => setBuilds(r.data)).catch(() => {});
    api.get('/studio/code-activity').then(r => setCodeActivity(r.data)).catch(() => {});
    api.get('/studio/deployments').then(r => setDeployments(r.data)).catch(() => {});
    api.get('/studio/payments').then(r => setPayments(r.data)).catch(() => {});
    api.get('/studio/endpoints').then(r => setEndpoints(r.data)).catch(() => {});
    api.get('/studio/schema').then(r => setSchema(r.data)).catch(() => {});
    api.get('/studio/team-activity').then(r => setTeamActivity(r.data)).catch(() => {});
  }, []);

  const noData = hasProjects === false;
  const loading = hasProjects === null;

  return (
    <div className="studio">
      <motion.div className="studio-header" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1>App Vibe Studio</h1>
          <p className="text-muted">Engineering metrics, build health, and infrastructure at a glance</p>
        </div>
      </motion.div>

      {noData ? <StudioEmptyState /> : (
        <div className="studio-grid">
          <BuildHealthChart builds={builds} loading={loading} />
          <CodeActivityChart data={codeActivity} loading={loading} />
          <ActiveBuilds builds={builds} loading={loading} />
          <FrontendPreview />
          <BackendAPIs endpoints={endpoints} loading={loading} />
          <DatabaseSchema schema={schema} loading={loading} />
          <PaymentsIntegration payments={payments} loading={loading} />
          <DeploymentPipeline deployments={deployments} loading={loading} />
          <TeamActivityFeed activities={teamActivity} loading={loading} />
        </div>
      )}
    </div>
  );
}

function StudioEmptyState() {
  const { setShowNewProjectModal } = useApp();
  return (
    <div className="studio-empty">
      <Zap size={40} className="studio-empty-icon" />
      <h3>Your studio is waiting</h3>
      <p>Create a project with tasks to see real-time engineering metrics — builds, code activity, API endpoints, and more.</p>
      <button className="btn btn-primary" onClick={() => setShowNewProjectModal(true)}>
        <Plus size={16} /> Create Your First Project
      </button>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="studio-card">
      <div className="studio-card-header" style={{ borderBottom: '1px solid var(--border-light)' }}>
        <div className="skeleton" style={{ width: 16, height: 16, borderRadius: 4 }} />
        <div className="skeleton" style={{ width: 120, height: 14, borderRadius: 4 }} />
      </div>
      <div className="studio-card-body">
        <div className="skeleton" style={{ width: '100%', height: 120, borderRadius: 8 }} />
      </div>
    </div>
  );
}

function ReadyEmpty({ icon: Icon, message }) {
  return (
    <div className="studio-card">
      <div className="studio-card-header">
        <Icon size={16} />
        <h3 style={{ textTransform: 'capitalize' }}>{message || 'No data'}</h3>
        <span className="studio-badge">Empty</span>
      </div>
      <div className="studio-card-body">
        <div className="studio-card-empty-body">
          <p className="text-muted">No data yet. Data appears once you create projects, run builds, or process payments.</p>
        </div>
      </div>
    </div>
  );
}

function BuildHealthChart({ builds, loading }) {
  if (loading) return <CardSkeleton />;
  if (!builds.length) return <ReadyEmpty icon={Code2} message="No builds yet" />;

  const data = builds.slice(0, 7).reverse().map(b => ({
    name: b.name?.slice(0, 12) || 'Build',
    progress: b.progress || 0,
    status: b.status,
  }));

  const successRate = Math.round((builds.filter(b => b.status === 'success').length / builds.length) * 100);

  return (
    <div className="studio-card">
      <div className="studio-card-header">
        <Code2 size={16} />
        <h3>App Build Health</h3>
        <span className="studio-badge">{successRate}% pass</span>
      </div>
      <div className="studio-card-body">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b6659' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b6659' }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <ReTooltip contentStyle={{ background: '#ffffff', border: '1px solid #e3ded2', borderRadius: 6, fontSize: 12 }} formatter={(v) => [`${v}%`, 'Progress']} />
            <Bar dataKey="progress" radius={[4, 4, 0, 0]} maxBarSize={32}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.status === 'failed' ? COLORS.danger : entry.status === 'building' ? COLORS.warning : COLORS.success} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CodeActivityChart({ data, loading }) {
  if (loading) return <CardSkeleton />;
  if (!data.length) return <ReadyEmpty icon={GitCommit} message="No code activity yet" />;

  const chartData = data;
  const totalCommits = chartData.reduce((s, d) => s + d.commits, 0);
  const totalPRs = chartData.reduce((s, d) => s + d.pull_requests, 0);

  return (
    <div className="studio-card">
      <div className="studio-card-header">
        <GitCommit size={16} />
        <h3>My Code Activity</h3>
        <span className="studio-badge">{totalCommits + totalPRs} actions</span>
      </div>
      <div className="studio-card-body">
        <div className="studio-stat-row">
          <div className="studio-stat">
            <GitCommit size={13} />
            <span className="studio-stat-value">{totalCommits}</span>
            <span className="studio-stat-label">Commits</span>
          </div>
          <div className="studio-stat">
            <GitPullRequest size={13} />
            <span className="studio-stat-value">{totalPRs}</span>
            <span className="studio-stat-label">Pull Requests</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b6659' }} axisLine={false} tickLine={false} />
            <ReTooltip contentStyle={{ background: '#ffffff', border: '1px solid #e3ded2', borderRadius: 6, fontSize: 12 }} />
            <Area type="monotone" dataKey="commits" stroke={COLORS.primary} fill="rgba(163,76,38,0.12)" strokeWidth={2} />
            <Area type="monotone" dataKey="pull_requests" stroke={COLORS.success} fill="rgba(55,112,79,0.1)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ActiveBuilds({ builds, loading }) {
  if (loading) return <CardSkeleton />;
  if (!builds.length) return <ReadyEmpty icon={Activity} message="No active builds" />;

  return (
    <div className="studio-card">
      <div className="studio-card-header">
        <Activity size={16} />
        <h3>Active Builds</h3>
        <span className="studio-badge">{builds.filter(b => b.status === 'building').length} running</span>
      </div>
      <div className="studio-card-body">
        {builds.slice(0, 6).map((b) => (
          <div key={b.id} className="studio-build-row">
            <div className={`studio-status-dot ${b.status === 'success' ? 'dot-success' : b.status === 'failed' ? 'dot-danger' : 'dot-warning'}`} />
            <div className="studio-build-info">
              <span className="studio-build-name">{b.name}</span>
              <span className="studio-build-meta">{b.branch} · {b.commit_hash?.slice(0, 7)}</span>
            </div>
            <span className={`studio-status-label ${b.status}`}>{b.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FrontendPreview() {
  return (
    <div className="studio-card studio-card-wide">
      <div className="studio-card-header">
        <Monitor size={16} />
        <h3>Frontend Development</h3>
        <span className="studio-badge">Preview</span>
      </div>
      <div className="studio-card-body">
        <div className="studio-devices">
          <div className="studio-device studio-device-desktop">
            <div className="studio-device-bar"><span className="studio-device-dot" /><span className="studio-device-dot" /><span className="studio-device-dot" /></div>
            <div className="studio-device-content">
              <div className="studio-mock-header" />
              <div className="studio-mock-row" />
              <div className="studio-mock-grid"><div className="studio-mock-card" /><div className="studio-mock-card" /><div className="studio-mock-card" /></div>
            </div>
          </div>
          <div className="studio-device studio-device-mobile">
            <div className="studio-device-notch" />
            <div className="studio-device-content">
              <div className="studio-mock-header" style={{ height: 20 }} />
              <div className="studio-mock-row" style={{ height: 12 }} />
              <div className="studio-mock-card" style={{ height: 40 }} />
            </div>
          </div>
        </div>
        <div className="studio-device-labels">
          <span><Monitor size={12} /> Web</span>
          <span><Smartphone size={12} /> Mobile</span>
        </div>
      </div>
    </div>
  );
}

function BackendAPIs({ endpoints, loading }) {
  if (loading) return <CardSkeleton />;
  if (!endpoints.length) return <ReadyEmpty icon={Server} message="No endpoints registered" />;

  return (
    <div className="studio-card">
      <div className="studio-card-header">
        <Server size={16} />
        <h3>Backend & APIs</h3>
        <span className="studio-badge">{endpoints.length} endpoints</span>
      </div>
      <div className="studio-card-body">
        <div className="studio-api-flow">
          <span className="studio-api-layer">Client</span><ArrowUpRight size={12} />
          <span className="studio-api-layer">API</span><ArrowUpRight size={12} />
          <span className="studio-api-layer">Logic</span><ArrowUpRight size={12} />
          <span className="studio-api-layer">DB</span>
        </div>
        <div className="studio-endpoint-list">
          {endpoints.slice(0, 5).map((ep, i) => (
            <div key={ep.id || i} className="studio-endpoint-row">
              <span className={`studio-http-method ${ep.method?.toLowerCase()}`}>{ep.method}</span>
              <span className="studio-endpoint-path">{ep.path}</span>
              <span className="studio-endpoint-db">{ep.database_table}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DatabaseSchema({ schema, loading }) {
  if (loading) return <CardSkeleton />;
  if (!schema.length) return <ReadyEmpty icon={Database} message="No schema detected" />;

  return (
    <div className="studio-card">
      <div className="studio-card-header">
        <Database size={16} />
        <h3>Database & Schema</h3>
        <span className="studio-badge">{schema.length} tables</span>
      </div>
      <div className="studio-card-body">
        <div className="studio-erd">
          {schema.map((t, i) => (
            <div key={i} className="studio-erd-table">
              <div className="studio-erd-table-name">{t.table}</div>
              {t.columns.map((col, j) => (
                <div key={j} className="studio-erd-col">
                  <span className="studio-erd-col-name">{col.pk && <span className="studio-erd-pk">PK</span>}{col.name}</span>
                  <span className="studio-erd-col-type">{col.type}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PaymentsIntegration({ payments, loading }) {
  if (loading) return <CardSkeleton />;
  if (!payments.length) return <ReadyEmpty icon={CreditCard} message="No payments yet" />;

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="studio-card">
      <div className="studio-card-header">
        <CreditCard size={16} />
        <h3>Payments</h3>
        <span className="studio-badge">${totalRevenue.toFixed(0)}</span>
      </div>
      <div className="studio-card-body">
        <div className="studio-gateway-row">
          {['Stripe', 'Apple Pay', 'Credit Card'].map(g => {
            const active = payments.some(t => t.gateway === g && t.status === 'completed');
            return (
              <div key={g} className={`studio-gateway ${active ? 'gateway-active' : ''}`}>
                <span className="studio-gateway-name">{g}</span>
                <span className={`studio-status-dot ${active ? 'dot-success' : 'dot-muted'}`} />
              </div>
            );
          })}
        </div>
        <div className="studio-transactions">
          {payments.slice(0, 5).map((t, i) => (
            <div key={t.id || i} className="studio-tx-row">
              <span className="studio-tx-gateway">{t.gateway}</span>
              <span className="studio-tx-amount">${t.amount.toFixed(2)}</span>
              <span className={`studio-status-label ${t.status}`}>{t.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DeploymentPipeline({ deployments, loading }) {
  if (loading) return <CardSkeleton />;
  if (!deployments.length) return <ReadyEmpty icon={Cloud} message="No deployments yet" />;

  return (
    <div className="studio-card">
      <div className="studio-card-header">
        <Cloud size={16} />
        <h3>Deployment Pipeline</h3>
        <span className="studio-badge">{deployments.filter(d => d.status === 'success').length}/{deployments.length}</span>
      </div>
      <div className="studio-card-body">
        <div className="studio-pipeline">
          <div className="studio-pipeline-steps">
            <span className="studio-pipeline-step step-done">Commit</span><div className="studio-pipeline-arrow" />
            <span className="studio-pipeline-step step-done">Build</span><div className="studio-pipeline-arrow" />
            <span className={`studio-pipeline-step ${deployments.some(d => d.status === 'success') ? 'step-done' : ''}`}>Test</span><div className="studio-pipeline-arrow" />
            <span className={`studio-pipeline-step ${deployments.some(d => d.environment === 'production' && d.status === 'success') ? 'step-done' : ''}`}>Deploy</span>
          </div>
        </div>
        {deployments.slice(0, 5).map((d) => (
          <div key={d.id} className="studio-build-row">
            <div className={`studio-status-dot ${d.status === 'success' ? 'dot-success' : d.status === 'failed' ? 'dot-danger' : 'dot-warning'}`} />
            <div className="studio-build-info">
              <span className="studio-build-name">{d.name}</span>
              <span className="studio-build-meta">{d.environment} · {d.provider}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamActivityFeed({ activities, loading }) {
  if (loading) return <CardSkeleton />;
  if (!activities.length) return <ReadyEmpty icon={Users} message="No team activity yet" />;

  const timeAgo = (date) => {
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="studio-card studio-card-wide">
      <div className="studio-card-header">
        <Users size={16} />
        <h3>Team Activity</h3>
        <span className="studio-badge">Live</span>
      </div>
      <div className="studio-card-body">
        {activities.slice(0, 8).map((a) => (
          <div key={a.id} className="studio-activity-row">
            <div className="studio-activity-avatar">{(a.username || '?')[0].toUpperCase()}</div>
            <div className="studio-activity-info">
              <span className="studio-activity-text">
                <strong>{a.username}</strong> {a.action} {a.target && <em>{a.target}</em>}
              </span>
              <span className="studio-activity-meta">{a.details} · {timeAgo(a.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}