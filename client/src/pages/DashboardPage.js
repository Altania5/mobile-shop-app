import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ChangePasswordForm from '../components/ChangePasswordForm';
import './DashboardPage.css';

const STATUS_LABELS = {
  new:       'Submitted',
  contacted: 'Contacted',
  scheduled: 'Scheduled',
  completed: 'Completed',
  converted: 'Confirmed',
  declined:  'Declined',
  cancelled: 'Cancelled',
};

const STATUS_COLORS = {
  new:       { background: 'rgba(59,130,246,0.1)', color: '#1d4ed8', border: '#93c5fd' },
  contacted: { background: 'rgba(234,179,8,0.1)',  color: '#854d0e', border: '#fde047' },
  scheduled: { background: 'rgba(168,85,247,0.1)', color: '#7c3aed', border: '#c4b5fd' },
  completed: { background: 'rgba(34,197,94,0.1)',  color: '#166534', border: '#86efac'  },
  converted: { background: 'rgba(34,197,94,0.1)',  color: '#166534', border: '#86efac'  },
  declined:  { background: 'rgba(239,68,68,0.1)',  color: '#991b1b', border: '#fca5a5'  },
  cancelled: { background: 'rgba(107,114,128,0.1)',color: '#374151', border: '#d1d5db'  },
};

const TIME_SLOT_LABELS = {
  morning:   'Morning (8 AM – 12 PM)',
  afternoon: 'Afternoon (12 PM – 5 PM)',
  evening:   'Evening (5 PM – 7 PM)',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.new;
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: '0.8rem',
      fontWeight: 700,
      border: `1px solid ${s.border}`,
      background: s.background,
      color: s.color,
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

const BookingRequests = () => {
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

  if (loading) return <div className="loader">Loading…</div>;
  if (error)   return <p style={{ color: 'var(--error-color)' }}>{error}</p>;

  return (
    <div className="page-container">
      <h2 style={{ marginTop: 0 }}>My Booking Requests</h2>
      {requests.length === 0 ? (
        <p style={{ color: 'var(--text-light-color)' }}>
          You haven't submitted any booking requests yet.
        </p>
      ) : (
        <div className="bookings-list">
          {requests.map(r => {
            const serviceLabel = r.service === 'Other'
              ? `Other — ${r.serviceOther || ''}`
              : r.service;
            return (
              <div key={r._id} className="booking-card">
                <div className="booking-card-header">
                  <h3>{serviceLabel}</h3>
                  <StatusBadge status={r.status} />
                </div>
                <div className="booking-card-body">
                  <p>
                    <strong>Vehicle:</strong>{' '}
                    {r.vehicleYear} {r.vehicleMake} {r.vehicleModel}
                  </p>
                  <p>
                    <strong>Preferred Date:</strong> {formatDate(r.preferredDate)}
                    {r.preferredTimeSlot && (
                      <> &mdash; {TIME_SLOT_LABELS[r.preferredTimeSlot] || r.preferredTimeSlot}</>
                    )}
                  </p>
                  <p><strong>Address:</strong> {r.serviceAddress}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light-color)' }}>
                    Submitted {new Date(r.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AccountSettings = () => (
  <div className="settings-container">
    <div className="settings-section">
      <ChangePasswordForm />
    </div>
  </div>
);

const DashboardPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('requests');

  return (
    <div className="dashboard-container">
      <h1>My Account</h1>
      <div className="dashboard-tabs">
        <button
          className={`dashboard-tab-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Booking Requests
        </button>
        <button
          className={`dashboard-tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Account Settings
        </button>
      </div>
      <div className="dashboard-content">
        {activeTab === 'requests'  && <BookingRequests />}
        {activeTab === 'settings'  && <AccountSettings user={user} />}
      </div>
    </div>
  );
};

export default DashboardPage;
