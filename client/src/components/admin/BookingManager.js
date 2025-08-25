import React, { useState, useEffect } from 'react';
import axios from 'axios';

// A new, reusable component for displaying a single booking in the admin panel
const AdminBookingCard = ({ booking, onStatusChange }) => (
    <div className="admin-booking-card">
        <div className="card-header">
            <h4>{booking.service?.name || 'Service Not Available'}</h4>
            <select 
                value={booking.status} 
                onChange={(e) => onStatusChange(booking._id, e.target.value)}
                className={`status-select status-${booking.status.toLowerCase()}`}
            >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
            </select>
        </div>
        <div className="card-body">
            <p><strong>Client:</strong> {booking.user?.firstName} {booking.user?.lastName} ({booking.user?.email})</p>
            <p><strong>Appointment:</strong> {new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
            <p><strong>Vehicle:</strong> {booking.vehicleYear} {booking.vehicleMake} {booking.vehicleModel}</p>
        </div>
    </div>
);


function BookingManager() {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(5);
  
  const [filters, setFilters] = useState({
    customerName: '', startDate: '', endDate: '', make: '', model: '', year: '', service: ''
  });
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const token = localStorage.getItem('token');

    const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Fetch all car makes when the component mounts
  useEffect(() => {
    const fetchMakes = async () => {
        try {
            const response = await axios.get('/api/vehicles/makes');
            setMakes(response.data);
        } catch (err) {
            console.error("Failed to fetch makes", err);
        }
    };
    fetchAllBookings();
    fetchMakes();
  }, []);

  // Fetch models whenever the 'make' filter changes
  useEffect(() => {
    if (filters.make) {
        const fetchModels = async () => {
            setIsLoadingModels(true);
            try {
                const response = await axios.get(`/api/vehicles/models/${filters.make}`);
                setModels(response.data);
            } catch (err) {
                setModels([]); // Clear models on error
                console.error("Failed to fetch models", err);
            } finally {
                setIsLoadingModels(false);
            }
        };
        fetchModels();
    } else {
        setModels([]); // Clear models if make is cleared
    }
  }, [filters.make]);

  const fetchAllBookings = async () => {
    try {
      const headers = { 'x-auth-token': token };
      const response = await axios.get('/api/bookings', { headers });
      setAllBookings(response.data.sort((a, b) => new Date(b.date) - new Date(a.date))); // Sort by most recent
    } catch (err) {
      setError('Could not fetch bookings.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAllBookings();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
        setError('');
        const headers = { 'x-auth-token': token };
        const body = { status: newStatus };
        await axios.put(`/api/bookings/${bookingId}/status`, body, { headers });
        fetchAllBookings(); // Refresh the entire list to reflect the change
    } catch (err) {
        setError(err.response?.data?.msg || 'Failed to update status.');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setError('');
    try {
        const headers = { 'x-auth-token': token };
        // Filter out empty filter values before creating params
        const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
        const params = new URLSearchParams(activeFilters).toString();

        const response = await axios.get(`/api/bookings?${params}`, { headers });
        setSearchResults(response.data);
    } catch (err) {
        setError('Search failed. Please try again.');
    } finally {
        setIsSearching(false);
    }
  };

  const activeBookings = allBookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Completed');

  return (
    <div className="manager-container">
      <h3>Manage Bookings</h3>
      {error && <p className="error-message">{error}</p>}
      
      {/* --- Active Bookings Section --- */}
      <div className="manager-section">
        <h4>Active Bookings ({activeBookings.length})</h4>
        <div className="admin-booking-grid">
          {loading ? <p>Loading bookings...</p> : 
           activeBookings.length === 0 ? <p>No active bookings found.</p> : 
           activeBookings.slice(0, visibleCount).map(booking => (
            <AdminBookingCard key={booking._id} booking={booking} onStatusChange={handleStatusChange} />
          ))}
        </div>
        {activeBookings.length > visibleCount && (
            <button onClick={() => setVisibleCount(visibleCount + 5)} className="show-more-btn">
                Show 5 More
            </button>
        )}
      </div>

      <hr className="section-divider" />

      {/* --- Advanced Search Section --- */}
      <div className="manager-section">
        <h4>Advanced Booking Search</h4>
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-grid">
            <input name="customerName" value={filters.customerName} onChange={handleFilterChange} placeholder="Customer Name" />
            
            {/* --- NEW SMART FIELDS --- */}
            <div className="input-with-datalist">
              <input list="makes-list" name="make" value={filters.make} onChange={handleFilterChange} placeholder="Car Make" />
              <datalist id="makes-list">
                {makes.map((makeName, i) => <option key={i} value={makeName} />)}
              </datalist>
            </div>

            <div className="input-with-datalist">
              <input list="models-list" name="model" value={filters.model} onChange={handleFilterChange} placeholder={isLoadingModels ? "Loading..." : "Car Model"} disabled={!filters.make} />
              <datalist id="models-list">
                {models.map((modelName, i) => <option key={i} value={modelName} />)}
              </datalist>
            </div>
            
            <input name="year" type="number" value={filters.year} onChange={handleFilterChange} placeholder="Car Year" min="1900" max={new Date().getFullYear() + 1} />
            <input name="service" value={filters.service} onChange={handleFilterChange} placeholder="Service Type" />
            <label>From: <input name="startDate" type="date" value={filters.startDate} onChange={handleFilterChange} /></label>
            <label>To: <input name="endDate" type="date" value={filters.endDate} onChange={handleFilterChange} /></label>
          </div>
          <button type="submit" disabled={isSearching}>{isSearching ? 'Searching...' : 'Search Bookings'}</button>
        </form>

        {searchResults && (
          <div className="search-results">
              <h4>Search Results ({searchResults.length})</h4>
              <div className="admin-booking-grid">
                {searchResults.length === 0 ? <p>No bookings match your criteria.</p> : 
                searchResults.map(booking => (
                    <AdminBookingCard key={booking._id} booking={booking} onStatusChange={handleStatusChange} />
                ))}
              </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingManager;