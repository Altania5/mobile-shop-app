import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Updated AdminBookingCard to include the new service status feature
const AdminBookingCard = ({ booking, onStatusChange, serviceStatus, onStatusTextChange, onSaveStatus }) => (
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
        
        {/* ---- START: New Service Status Input ---- */}
        {(booking.status === 'Pending' || booking.status === 'Confirmed') && (
            <div className="service-status-input-container">
                <input
                    type="text"
                    placeholder="Update service progress..."
                    value={serviceStatus}
                    onChange={onStatusTextChange}
                />
                <button onClick={onSaveStatus}>Save</button>
            </div>
        )}
        {/* ---- END: New Service Status Input ---- */}

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
    const [serviceStatuses, setServiceStatuses] = useState({});

    const [filters, setFilters] = useState({
        customerName: '', startDate: '', endDate: '', make: '', model: '', year: '', service: ''
    });
    const [searchResults, setSearchResults] = useState(null); 
    const [isSearching, setIsSearching] = useState(false);
    const token = localStorage.getItem('token');

    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);

const fetchAllBookings = useCallback(async () => {
    try {
        setLoading(true);
        const headers = { 'x-auth-token': token };
        const response = await axios.get('/api/bookings/all', { headers });

        if (Array.isArray(response.data)) {
            const bookingsData = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setAllBookings(bookingsData);

            const initialStatuses = bookingsData.reduce((acc, booking) => {
                acc[booking._id] = booking.serviceStatus || '';
                return acc;
            }, {});
            setServiceStatuses(initialStatuses);
        } else {
            setError('Received an invalid response from the server.');
            setAllBookings([]); 
        }
        
    } catch (err) {
        setError('Could not fetch bookings.');
        setAllBookings([]);
    } finally {
        setLoading(false);
    }
}, [token]);

    // This useEffect hook fetches initial data
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
    }, [fetchAllBookings]); 

    // This useEffect hook handles fetching models when a make is selected
    useEffect(() => {
        if (filters.make) {
            const fetchModels = async () => {
                setIsLoadingModels(true);
                try {
                    const response = await axios.get(`/api/vehicles/models/${filters.make}`);
                    setModels(response.data);
                } catch (err) {
                    setModels([]);
                } finally {
                    setIsLoadingModels(false);
                }
            };
            fetchModels();
        } else {
            setModels([]);
        }
    }, [filters.make]);

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            setError('');
            const headers = { 'x-auth-token': token };
            const body = { status: newStatus };
            await axios.patch(`/api/bookings/${bookingId}/status`, body, { headers });
            fetchAllBookings();
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
            const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
            const params = new URLSearchParams(activeFilters).toString();
            const response = await axios.get(`/api/bookings/all?${params}`, { headers });
        
            if(Array.isArray(response.data)) {
              setSearchResults(response.data);
            } else {
              setSearchResults([]);
            }
        } catch (err) {
            setError('Search failed. Please try again.');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleStatusTextChange = (e, bookingId) => {
        const { value } = e.target;
        setServiceStatuses(prev => ({ ...prev, [bookingId]: value }));
    };

    const handleSaveStatus = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'x-auth-token': token };

            await axios.patch(`/api/bookings/${bookingId}/status`, {
                serviceStatus: serviceStatuses[bookingId],
            }, { headers });

            fetchAllBookings();
            alert('Status updated successfully!');
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update status.');
        }
    };

    const activeBookings = allBookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Completed');
    
    const renderBookingCard = (booking) => (
        <AdminBookingCard 
            key={booking._id} 
            booking={booking} 
            onStatusChange={handleStatusChange}
            serviceStatus={serviceStatuses[booking._id] || ''}
            onStatusTextChange={(e) => handleStatusTextChange(e, booking._id)}
            onSaveStatus={() => handleSaveStatus(booking._id)}
        />
    );

    return (
        <div className="manager-container">
            <h3>Manage Bookings</h3>
            {error && <p className="error-message">{error}</p>}
            
            <div className="manager-section">
                <h4>Active Bookings ({activeBookings.length})</h4>
                <div className="admin-booking-grid">
                    {loading ? <p>Loading bookings...</p> : 
                    activeBookings.length === 0 ? <p>No active bookings found.</p> : 
                    activeBookings.slice(0, visibleCount).map(renderBookingCard)}
                </div>
                {activeBookings.length > visibleCount && (
                    <button onClick={() => setVisibleCount(visibleCount + 5)} className="show-more-btn">
                        Show 5 More
                    </button>
                )}
            </div>

            <hr className="section-divider" />

            <div className="manager-section">
                <h4>Advanced Booking Search</h4>
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-grid">
                        <input name="customerName" value={filters.customerName} onChange={handleFilterChange} placeholder="Customer Name" />
                        <div className="input-with-datalist">
                            <input list="makes-list" name="make" value={filters.make} onChange={handleFilterChange} placeholder="Car Make" />
                            <datalist id="makes-list">{makes.map((makeName, i) => <option key={i} value={makeName} />)}</datalist>
                        </div>
                        <div className="input-with-datalist">
                            <input list="models-list" name="model" value={filters.model} onChange={handleFilterChange} placeholder={isLoadingModels ? "Loading..." : "Car Model"} disabled={!filters.make} />
                            <datalist id="models-list">{models.map((modelName, i) => <option key={i} value={modelName} />)}</datalist>
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
                        Array.isArray(searchResults) && searchResults.map(renderBookingCard)}
                    </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BookingManager;