import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../api';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const { setShowNewProjectModal } = useApp();

  useEffect(() => {
    api.get('/studio/payments').then(r => setPayments(r.data)).catch(() => {});
  }, []);

  const completed = payments.filter(p => p.status === 'completed');
  const totalRevenue = completed.reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter(p => p.status === 'pending');
  const failed = payments.filter(p => p.status === 'failed');

  return (
    <div className="page-layout">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div>
          <h1>Payments</h1>
          <p className="text-muted">Financial operations and gateway status</p>
        </div>
      </motion.div>

      {payments.length === 0 ? (
        <div className="page-empty" style={{ marginTop: 20 }}>
          <DollarSign size={40} className="page-empty-icon" />
          <h3>No transactions yet</h3>
          <p>Payment transactions appear here once you process payments via Stripe, Apple Pay, or credit card.</p>
          <div className="page-gateways" style={{ maxWidth: 400, marginTop: 8 }}>
            {['Stripe', 'Apple Pay', 'Credit Card'].map(g => (
              <div key={g} className="page-gateway-card">
                <CreditCard size={16} />
                <span>{g}</span>
                <span className="studio-status-dot dot-muted" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="page-stats">
            <div className="page-stat-card"><span className="page-stat-value" style={{ color: 'var(--success)' }}>${totalRevenue.toFixed(0)}</span>Revenue</div>
            <div className="page-stat-card"><span className="page-stat-value" style={{ color: 'var(--primary)' }}>{completed.length}</span>Completed</div>
            <div className="page-stat-card"><span className="page-stat-value" style={{ color: 'var(--warning)' }}>{pending.length}</span>Pending</div>
            <div className="page-stat-card"><span className="page-stat-value" style={{ color: 'var(--danger)' }}>{failed.length}</span>Failed</div>
          </div>
          <div className="page-section">
            <h3 className="page-section-title">Gateway Status</h3>
            <div className="page-gateways">
              {['Stripe', 'Apple Pay', 'Credit Card'].map(g => {
                const active = payments.some(p => p.gateway === g && p.status === 'completed');
                return (
                  <div key={g} className={`page-gateway-card ${active ? 'gateway-active' : ''}`}>
                    <CreditCard size={18} />
                    <span>{g}</span>
                    <span className={`studio-status-dot ${active ? 'dot-success' : 'dot-muted'}`} />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="page-section">
            <h3 className="page-section-title">Transactions</h3>
            <div className="page-list">
              {payments.map((p, i) => (
                <div key={p.id || i} className="page-list-item" style={{ cursor: 'default' }}>
                  <div className={`studio-status-dot ${p.status === 'completed' ? 'dot-success' : p.status === 'failed' ? 'dot-danger' : 'dot-warning'}`} />
                  <div className="page-list-info">
                    <span className="page-list-title">{p.gateway}</span>
                    <span className="page-list-meta">{p.transaction_id || '—'}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--text-h)', marginRight: 12 }}>${p.amount.toFixed(2)}</span>
                  <span className={`studio-status-label ${p.status}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}