import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const STATUS_STYLES = {
  'Scheduled':          { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  'Awaiting Approval':  { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500' },
  'In Progress':        { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
  'Complete':           { bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500' },
  'Pending':            { bg: 'bg-gray-50',    text: 'text-gray-600',   border: 'border-gray-200',   dot: 'bg-gray-400' },
};

const BOOKING_STATUS_LABELS = {
  new:       'Submitted',
  contacted: 'Contacted',
  scheduled: 'Scheduled',
  completed: 'Completed',
  converted: 'Confirmed',
  declined:  'Declined',
  cancelled: 'Cancelled',
};

const BOOKING_STATUS_STYLES = {
  new:       { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
  contacted: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500' },
  scheduled: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  completed: { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500' },
  converted: { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500' },
  declined:  { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500' },
  cancelled: { bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200',   dot: 'bg-gray-400' },
};

const TIME_SLOT_LABELS = {
  morning:   'Morning (8 AM – 12 PM)',
  afternoon: 'Afternoon (12 PM – 5 PM)',
  evening:   'Evening (5 PM – 7 PM)',
};

function StatusBadge({ status, styles, labels }) {
  const s = (styles || STATUS_STYLES)[status] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };
  const label = labels ? labels[status] || status : status;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {label}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
}

function Tab({ active, label, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center w-auto px-4 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap
        ${active
          ? 'bg-[#1e2833] text-white shadow-sm'
          : 'bg-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
    >
      {label}
      {count > 0 && (
        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs
          ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-gray-800 font-semibold">{title}</p>
      <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
    </div>
  );
}

// ── Jobs tab ──

function JobsPanel({ jobs }) {
  if (!jobs.length) {
    return <EmptyState icon="🔧" title="No active jobs" subtitle="When you book a service, it will appear here." />;
  }
  const active = jobs.filter(j => j.displayStatus !== 'Complete');
  const completed = jobs.filter(j => j.displayStatus === 'Complete');

  return (
    <div className="space-y-3">
      {active.length > 0 && (
        <>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-1">Active</h3>
          {active.map(j => <JobCard key={j._id} job={j} />)}
        </>
      )}
      {completed.length > 0 && (
        <>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-1 mt-6">Completed</h3>
          {completed.map(j => <JobCard key={j._id} job={j} />)}
        </>
      )}
    </div>
  );
}

function JobCard({ job }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{job.service}</p>
          <p className="text-sm text-gray-500 mt-0.5">{job.vehicle}</p>
        </div>
        <StatusBadge status={job.displayStatus} />
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
        <span>{job.workOrderNumber}</span>
        <span>
          {job.displayStatus === 'Complete'
            ? `Completed ${formatDate(job.completedDate)}`
            : job.scheduledDate
              ? `Scheduled ${formatDate(job.scheduledDate)}`
              : `Created ${formatDate(job.createdAt)}`}
        </span>
      </div>
    </div>
  );
}

// ── Vehicles tab ──

function VehiclesPanel({ vehicles }) {
  if (!vehicles.length) {
    return <EmptyState icon="🚗" title="No vehicles yet" subtitle="Vehicles from your service history will appear here." />;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {vehicles.map((v, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg shrink-0">
              🚗
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {v.year} {v.make} {v.model}
              </p>
              {v.vin && <p className="text-xs text-gray-400 font-mono truncate">VIN: {v.vin}</p>}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <span>{v.jobCount} service{v.jobCount !== 1 ? 's' : ''}</span>
            <span>Last: {formatDate(v.lastServiceDate)}</span>
            {v.color && <span className="capitalize">{v.color}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Invoices tab ──

function InvoicesPanel({ invoices }) {
  if (!invoices.length) {
    return <EmptyState icon="📄" title="No invoices" subtitle="Invoices for completed services will appear here." />;
  }
  const unpaid = invoices.filter(inv => inv.status !== 'paid');
  const paid   = invoices.filter(inv => inv.status === 'paid');

  return (
    <div className="space-y-3">
      {unpaid.length > 0 && (
        <>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-1">Unpaid</h3>
          {unpaid.map(inv => <InvoiceRow key={inv._id} inv={inv} />)}
        </>
      )}
      {paid.length > 0 && (
        <>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-1 mt-6">Paid</h3>
          {paid.map(inv => <InvoiceRow key={inv._id} inv={inv} />)}
        </>
      )}
    </div>
  );
}

function InvoiceRow({ inv }) {
  const isPaid = inv.status === 'paid';
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{inv.service}</p>
          <p className="text-sm text-gray-500 mt-0.5">{inv.vehicle}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-gray-900">{formatCurrency(inv.total)}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold
            ${isPaid
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {isPaid ? 'Paid' : inv.status === 'overdue' ? 'Overdue' : 'Unpaid'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>{inv.invoiceNumber}</span>
          <span>{isPaid ? `Paid ${formatDate(inv.paidAt)}` : `Sent ${formatDate(inv.sentAt)}`}</span>
        </div>
        {!isPaid && inv.squareInvoiceUrl && (
          <a
            href={inv.squareInvoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
              bg-[#d4af37] text-white hover:bg-[#b8972e] transition-colors shadow-sm"
          >
            Pay Now
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

// ── Booking Requests tab ──

function BookingRequestsPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      const res = await axios.get('/api/booking-requests/mine');
      setRequests(res.data);
    } catch {
      setError('Could not load your booking requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-[#1e2833] rounded-full animate-spin" />
      </div>
    );
  }
  if (error) return <p className="text-red-500 text-sm text-center py-8">{error}</p>;

  if (!requests.length) {
    return <EmptyState icon="📋" title="No booking requests" subtitle="Requests you submit through our forms will appear here." />;
  }

  return (
    <div className="space-y-3">
      {requests.map(r => {
        const serviceLabel = r.service === 'Other' ? `Other — ${r.serviceOther || ''}` : r.service;
        return (
          <div key={r._id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{serviceLabel}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {r.vehicleYear} {r.vehicleMake} {r.vehicleModel}
                </p>
              </div>
              <StatusBadge status={r.status} styles={BOOKING_STATUS_STYLES} labels={BOOKING_STATUS_LABELS} />
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-500">
              <p>
                {formatDate(r.preferredDate)}
                {r.preferredTimeSlot && <> &mdash; {TIME_SLOT_LABELS[r.preferredTimeSlot] || r.preferredTimeSlot}</>}
              </p>
              <p className="truncate">{r.serviceAddress}</p>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Submitted {formatDate(r.createdAt)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ── Settings tab ──

function SettingsPanel() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [status, setStatus] = useState({ msg: '', ok: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setStatus({ msg: 'Passwords do not match.', ok: false });
      return;
    }
    setLoading(true);
    setStatus({ msg: '', ok: false });
    try {
      const res = await axios.post('/api/users/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setStatus({ msg: res.data.msg, ok: true });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setStatus({ msg: err.response?.data?.msg || 'Something went wrong.', ok: false });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] transition-colors';

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm max-w-md">
      <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Current Password</label>
          <input type="password" required className={inputCls}
            value={form.currentPassword}
            onChange={e => setForm({ ...form, currentPassword: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">New Password</label>
          <input type="password" required className={inputCls}
            value={form.newPassword}
            onChange={e => setForm({ ...form, newPassword: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Confirm New Password</label>
          <input type="password" required className={inputCls}
            value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[#1e2833] text-white
            hover:bg-[#2a3441] disabled:opacity-50 transition-colors"
        >
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </form>
      {status.msg && (
        <p className={`mt-3 text-sm font-medium text-center ${status.ok ? 'text-green-600' : 'text-red-600'}`}>
          {status.msg}
        </p>
      )}
    </div>
  );
}

// ── Main Dashboard ──

const DashboardPage = ({ user, onLogout }) => {
  const [tab, setTab] = useState('jobs');
  const [data, setData] = useState({ jobs: [], vehicles: [], invoices: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await axios.get('/api/portal/dashboard');
      setData(res.data);
    } catch {
      setError('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const unpaidCount = data.invoices.filter(i => i.status !== 'paid').length;
  const activeJobCount = data.jobs.filter(j => j.displayStatus !== 'Complete').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1e2833] px-4 py-6 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm">Welcome back</p>
            <h1 className="text-white text-xl font-bold mt-0.5">
              {user?.firstName || 'Customer'}
            </h1>
          </div>
          <button
            onClick={onLogout}
            className="w-auto inline-block bg-transparent px-3 py-1.5 rounded-lg text-sm font-medium text-white/70 hover:text-white
              border border-white/20 hover:border-white/40 hover:bg-transparent transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-3">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          <Tab active={tab === 'jobs'}     label="Jobs"     count={activeJobCount} onClick={() => setTab('jobs')} />
          <Tab active={tab === 'vehicles'} label="Vehicles" count={data.vehicles.length} onClick={() => setTab('vehicles')} />
          <Tab active={tab === 'invoices'} label="Invoices" count={unpaidCount} onClick={() => setTab('invoices')} />
          <Tab active={tab === 'requests'} label="Requests" count={0} onClick={() => setTab('requests')} />
          <Tab active={tab === 'settings'} label="Settings" count={0} onClick={() => setTab('settings')} />
        </div>

        {/* Content */}
        <div className="mt-4 pb-12">
          {loading && tab !== 'requests' && tab !== 'settings' ? (
            <div className="text-center py-16">
              <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-[#1e2833] rounded-full animate-spin" />
              <p className="text-gray-400 text-sm mt-3">Loading…</p>
            </div>
          ) : error && tab !== 'requests' && tab !== 'settings' ? (
            <div className="text-center py-16">
              <p className="text-red-500 font-medium">{error}</p>
              <button onClick={() => { setError(''); setLoading(true); fetchDashboard(); }}
                className="w-auto inline-block bg-transparent mt-3 text-sm text-[#d4af37] font-semibold hover:underline hover:bg-transparent">
                Try Again
              </button>
            </div>
          ) : (
            <>
              {tab === 'jobs'     && <JobsPanel jobs={data.jobs} />}
              {tab === 'vehicles' && <VehiclesPanel vehicles={data.vehicles} />}
              {tab === 'invoices' && <InvoicesPanel invoices={data.invoices} />}
              {tab === 'requests' && <BookingRequestsPanel />}
              {tab === 'settings' && <SettingsPanel />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
