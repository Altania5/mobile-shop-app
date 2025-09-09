import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TimeSlotManager.css';

const TimeSlotManager = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statistics, setStatistics] = useState(null);
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    time: '',
    isRecurring: false,
    recurringPattern: 'weekly',
    recurringEndDate: '',
    notes: ''
  });
  
  // Bulk creation states
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkData, setBulkData] = useState({
    serviceId: '',
    startDate: '',
    endDate: '',
    times: '',
    notes: ''
  });
  
  // Filters
  const [filters, setFilters] = useState({
    serviceId: '',
    startDate: '',
    endDate: '',
    isAvailable: '',
    isBooked: ''
  });
  
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchServices();
    fetchTimeSlots();
    fetchStatistics();
  }, []);

  useEffect(() => {
    if (Object.values(filters).some(val => val !== '')) {
      fetchTimeSlots();
    }
  }, [filters]);

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services');
      setServices(response.data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      const headers = { 'x-auth-token': token };
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await axios.get(`/api/timeSlots?${params}`, { headers });
      setTimeSlots(response.data.timeSlots || []);
    } catch (err) {
      setError('Error fetching time slots');
      console.error('Error fetching time slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const headers = { 'x-auth-token': token };
      const response = await axios.get('/api/timeSlots/statistics', { headers });
      setStatistics(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try {
      const headers = { 'x-auth-token': token };
      await axios.post('/api/timeSlots', formData, { headers });
      
      setShowCreateForm(false);
      setFormData({
        serviceId: '',
        date: '',
        time: '',
        isRecurring: false,
        recurringPattern: 'weekly',
        recurringEndDate: '',
        notes: ''
      });
      
      fetchTimeSlots();
      fetchStatistics();
      setError('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Error creating time slot');
    }
  };

  const handleBulkCreate = async (e) => {
    e.preventDefault();
    try {
      const headers = { 'x-auth-token': token };
      
      // Generate date range
      const dates = [];
      const start = new Date(bulkData.startDate);
      const end = new Date(bulkData.endDate);
      
      for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
        dates.push(new Date(date).toISOString().split('T')[0]);
      }
      
      // Parse times
      const times = bulkData.times.split(',').map(time => time.trim()).filter(time => time);
      
      const payload = {
        serviceId: bulkData.serviceId,
        dates,
        times,
        notes: bulkData.notes
      };
      
      await axios.post('/api/timeSlots/bulk', payload, { headers });
      
      setShowBulkForm(false);
      setBulkData({
        serviceId: '',
        startDate: '',
        endDate: '',
        times: '',
        notes: ''
      });
      
      fetchTimeSlots();
      fetchStatistics();
      setError('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Error creating bulk time slots');
    }
  };

  const handleUpdateSlot = async (slotId, updates) => {
    try {
      const headers = { 'x-auth-token': token };
      await axios.put(`/api/timeSlots/${slotId}`, updates, { headers });
      
      fetchTimeSlots();
      fetchStatistics();
      setError('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Error updating time slot');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) return;
    
    try {
      const headers = { 'x-auth-token': token };
      await axios.delete(`/api/timeSlots/${slotId}`, { headers });
      
      fetchTimeSlots();
      fetchStatistics();
      setError('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Error deleting time slot');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSlots.size === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedSlots.size} time slots?`)) return;
    
    try {
      const headers = { 'x-auth-token': token };
      await axios.delete('/api/timeSlots/bulk', {
        headers,
        data: { ids: Array.from(selectedSlots) }
      });
      
      setSelectedSlots(new Set());
      fetchTimeSlots();
      fetchStatistics();
      setError('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Error deleting time slots');
    }
  };

  const handleSlotSelection = (slotId) => {
    const newSelected = new Set(selectedSlots);
    if (newSelected.has(slotId)) {
      newSelected.delete(slotId);
    } else {
      newSelected.add(slotId);
    }
    setSelectedSlots(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSlots.size === timeSlots.length) {
      setSelectedSlots(new Set());
    } else {
      setSelectedSlots(new Set(timeSlots.map(slot => slot._id)));
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (time) => {
    return time;
  };

  return (
    <div className="time-slot-manager">
      <div className="manager-header">
        <h2>Time Slot Manager</h2>
        <div className="header-actions">
          <button 
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            + Create Time Slot
          </button>
          <button 
            onClick={() => setShowBulkForm(true)}
            className="btn-secondary"
          >
            📅 Bulk Create
          </button>
          {selectedSlots.size > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="btn-danger"
            >
              🗑 Delete Selected ({selectedSlots.size})
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Statistics */}
      {statistics && (
        <div className="statistics-card">
          <div className="stat-item">
            <span className="stat-number">{statistics.totalSlots}</span>
            <span className="stat-label">Total Slots</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{statistics.availableSlots}</span>
            <span className="stat-label">Available</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{statistics.bookedSlots}</span>
            <span className="stat-label">Booked</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{statistics.utilizationRate}%</span>
            <span className="stat-label">Utilization</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-card">
        <h3>Filters</h3>
        <div className="filters-grid">
          <select
            value={filters.serviceId}
            onChange={(e) => setFilters({...filters, serviceId: e.target.value})}
          >
            <option value="">All Services</option>
            {services.map(service => (
              <option key={service._id} value={service._id}>
                {service.name}
              </option>
            ))}
          </select>
          
          <input
            type="date"
            placeholder="Start Date"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
          />
          
          <input
            type="date"
            placeholder="End Date"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
          />
          
          <select
            value={filters.isAvailable}
            onChange={(e) => setFilters({...filters, isAvailable: e.target.value})}
          >
            <option value="">All Availability</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
          
          <select
            value={filters.isBooked}
            onChange={(e) => setFilters({...filters, isBooked: e.target.value})}
          >
            <option value="">All Booking Status</option>
            <option value="true">Booked</option>
            <option value="false">Not Booked</option>
          </select>
          
          <button 
            onClick={() => setFilters({serviceId: '', startDate: '', endDate: '', isAvailable: '', isBooked: ''})}
            className="btn-outline"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Time Slots Table */}
      <div className="slots-table-card">
        <div className="table-header">
          <h3>Time Slots</h3>
          {timeSlots.length > 0 && (
            <label className="select-all">
              <input
                type="checkbox"
                checked={selectedSlots.size === timeSlots.length}
                onChange={handleSelectAll}
              />
              Select All
            </label>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading time slots...</div>
        ) : (
          <div className="slots-table-wrapper">
            <table className="slots-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Customer</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {timeSlots.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data">No time slots found</td>
                  </tr>
                ) : (
                  timeSlots.map(slot => (
                    <tr key={slot._id} className={slot.isBooked ? 'booked' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedSlots.has(slot._id)}
                          onChange={() => handleSlotSelection(slot._id)}
                          disabled={slot.isBooked}
                        />
                      </td>
                      <td>{slot.service?.name || 'Unknown Service'}</td>
                      <td>{formatDate(slot.date)}</td>
                      <td>{formatTime(slot.time)}</td>
                      <td>
                        <span className={`status ${slot.isBooked ? 'booked' : slot.isAvailable ? 'available' : 'unavailable'}`}>
                          {slot.isBooked ? 'Booked' : slot.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td>
                        {slot.booking ? 
                          `${slot.booking.clientFirstName} ${slot.booking.clientLastName}` : 
                          '-'
                        }
                      </td>
                      <td className="notes-cell">
                        {slot.notes || '-'}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {!slot.isBooked && (
                            <button
                              onClick={() => handleUpdateSlot(slot._id, { isAvailable: !slot.isAvailable })}
                              className={`btn-toggle ${slot.isAvailable ? 'available' : 'unavailable'}`}
                              title={slot.isAvailable ? 'Make Unavailable' : 'Make Available'}
                            >
                              {slot.isAvailable ? '🔒' : '🔓'}
                            </button>
                          )}
                          
                          {!slot.isBooked && (
                            <button
                              onClick={() => handleDeleteSlot(slot._id)}
                              className="btn-delete"
                              title="Delete Slot"
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Time Slot Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Time Slot</h3>
              <button onClick={() => setShowCreateForm(false)}>✖</button>
            </div>
            
            <form onSubmit={handleCreateSlot}>
              <div className="form-row">
                <label>
                  Service *
                  <select
                    value={formData.serviceId}
                    onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                    required
                  >
                    <option value="">Select Service</option>
                    {services.map(service => (
                      <option key={service._id} value={service._id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  Date *
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </label>
                
                <label>
                  Time *
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                  />
                  Create Recurring Time Slots
                </label>
              </div>

              {formData.isRecurring && (
                <>
                  <div className="form-row">
                    <label>
                      Pattern
                      <select
                        value={formData.recurringPattern}
                        onChange={(e) => setFormData({...formData, recurringPattern: e.target.value})}
                      >
                        <option value="weekly">Weekly</option>
                        <option value="daily">Daily</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </label>
                    
                    <label>
                      End Date
                      <input
                        type="date"
                        value={formData.recurringEndDate}
                        onChange={(e) => setFormData({...formData, recurringEndDate: e.target.value})}
                        required
                      />
                    </label>
                  </div>
                </>
              )}

              <div className="form-row">
                <label>
                  Notes
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Optional notes for this time slot"
                    rows="3"
                  />
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Create Time Slot
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Create Modal */}
      {showBulkForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Bulk Create Time Slots</h3>
              <button onClick={() => setShowBulkForm(false)}>✖</button>
            </div>
            
            <form onSubmit={handleBulkCreate}>
              <div className="form-row">
                <label>
                  Service *
                  <select
                    value={bulkData.serviceId}
                    onChange={(e) => setBulkData({...bulkData, serviceId: e.target.value})}
                    required
                  >
                    <option value="">Select Service</option>
                    {services.map(service => (
                      <option key={service._id} value={service._id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  Start Date *
                  <input
                    type="date"
                    value={bulkData.startDate}
                    onChange={(e) => setBulkData({...bulkData, startDate: e.target.value})}
                    required
                  />
                </label>
                
                <label>
                  End Date *
                  <input
                    type="date"
                    value={bulkData.endDate}
                    onChange={(e) => setBulkData({...bulkData, endDate: e.target.value})}
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Times * (comma-separated, e.g., "09:00, 10:00, 14:00")
                  <input
                    type="text"
                    value={bulkData.times}
                    onChange={(e) => setBulkData({...bulkData, times: e.target.value})}
                    placeholder="09:00, 10:00, 14:00, 15:00"
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Notes
                  <textarea
                    value={bulkData.notes}
                    onChange={(e) => setBulkData({...bulkData, notes: e.target.value})}
                    placeholder="Optional notes for these time slots"
                    rows="3"
                  />
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Create Time Slots
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowBulkForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotManager;
