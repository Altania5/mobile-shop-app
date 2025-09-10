import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import WorkOrderForm from './WorkOrderForm';
import WorkOrderManager from './WorkOrderManager';
import CustomBookingForm from './CustomBookingForm';
import CustomerAssignmentPage from './CustomerAssignmentPage';

// AdminBookingCard component with Work Order functionality
const AdminBookingCard = ({ booking, onStatusChange, serviceStatus, onStatusTextChange, onSaveStatus, onCreateWorkOrder }) => (
    <div className="admin-booking-card">
        <div className="card-header">
            <h4>
                {booking.isCustomService 
                    ? `${booking.customServiceName} (Custom Service)` 
                    : (booking.service ? booking.service.name : 'Service Not Available')
                }
            </h4>
            <div className="header-controls">
                <select
                    value={booking.status}
                    onChange={(e) => onStatusChange(booking._id, e.target.value)}
                    className={`status-select status-${booking.status.toLowerCase().replace(/\s+/g, '-')}`}
                >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Pending Customer Verification">Pending Customer Verification</option>
                </select>
                <button 
                    className="create-work-order-btn"
                    onClick={() => onCreateWorkOrder(booking)}
                    title="Create Work Order for this booking"
                >
                    📋 Work Order
                </button>
            </div>
        </div>
        
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

        <div className="card-body">
            {booking.user ? (
                <p><strong>Client:</strong> {booking.user.firstName} {booking.user.lastName} ({booking.user.email})</p>
            ) : (
                <p><strong>Client:</strong> User Not Found</p>
            )}
            <p><strong>Appointment:</strong> {new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
            <p><strong>Vehicle:</strong> {booking.vehicleYear} {booking.vehicleMake} {booking.vehicleModel}</p>
            {booking.isCustomService && booking.customServicePrice && (
                <p><strong>Price:</strong> ${booking.customServicePrice}</p>
            )}
            {booking.duration && (
                <p><strong>Duration:</strong> {booking.duration} minutes</p>
            )}
            {booking.createdByAdmin && (
                <p><strong>Type:</strong> <span className="custom-booking-badge">Admin Created</span></p>
            )}
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
    
    // Work Order related state
    const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);
    const [showWorkOrderManager, setShowWorkOrderManager] = useState(false);
    const [selectedBookingForWorkOrder, setSelectedBookingForWorkOrder] = useState(null);
    
    // Custom Booking related state
    const [showCustomBookingForm, setShowCustomBookingForm] = useState(false);
    const [showCustomerAssignment, setShowCustomerAssignment] = useState(false);
    const [pendingCustomBooking, setPendingCustomBooking] = useState(null);

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
                setAllBookings([]);
            }
        } catch (err) {
            setError('Could not fetch bookings.');
            setAllBookings([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        const fetchMakes = async () => {
            try {
                const response = await axios.get('/api/vehicleData/makes');
                setMakes(response.data);
            } catch (err) {
                console.error("Failed to fetch makes", err);
            }
        };
        
        fetchAllBookings();
        fetchMakes();
    }, [fetchAllBookings]); 

    useEffect(() => {
        if (filters.make) {
            const fetchModels = async () => {
                setIsLoadingModels(true);
                try {
                    const response = await axios.get(`/api/vehicleData/models/${filters.make}`);
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
            if (Array.isArray(response.data)) {
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

    const handleCreateWorkOrder = (booking) => {
        setSelectedBookingForWorkOrder(booking);
        setShowWorkOrderForm(true);
        setShowWorkOrderManager(false);
    };

    const handleWorkOrderSaved = () => {
        setShowWorkOrderForm(false);
        setSelectedBookingForWorkOrder(null);
        // Optionally refresh bookings to update any related data
        fetchAllBookings();
    };

    const handleShowWorkOrderManager = () => {
        setShowWorkOrderManager(true);
        setShowWorkOrderForm(false);
    };

    const handleBackToBookings = () => {
        setShowWorkOrderForm(false);
        setShowWorkOrderManager(false);
        setSelectedBookingForWorkOrder(null);
        setShowCustomBookingForm(false);
        setShowCustomerAssignment(false);
        setPendingCustomBooking(null);
    };
    
    const handleCreateCustomBooking = () => {
        setShowCustomBookingForm(true);
        setShowWorkOrderForm(false);
        setShowWorkOrderManager(false);
        setShowCustomerAssignment(false);
    };
    
    const handleCustomBookingSaved = (bookingData) => {
        setPendingCustomBooking(bookingData);
        setShowCustomBookingForm(false);
        setShowCustomerAssignment(true);
    };
    
    const handleCustomerAssigned = () => {
        fetchAllBookings();
        handleBackToBookings();
    };

    const activeBookings = Array.isArray(allBookings)
        ? allBookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Completed')
        : [];
    
    const renderBookingCard = (booking) => (
        <AdminBookingCard 
            key={booking._id} 
            booking={booking} 
            onStatusChange={handleStatusChange}
            serviceStatus={serviceStatuses[booking._id] || ''}
            onStatusTextChange={(e) => handleStatusTextChange(e, booking._id)}
            onSaveStatus={() => handleSaveStatus(booking._id)}
            onCreateWorkOrder={handleCreateWorkOrder}
        />
    );

    // Conditional rendering based on current view
    if (showCustomBookingForm) {
        return (
            <div className="manager-container">
                <div className="manager-header">
                    <button onClick={handleBackToBookings} className="back-button">
                        ← Back to Bookings
                    </button>
                    <h3>Create Custom Booking</h3>
                </div>
                <CustomBookingForm 
                    onSave={handleCustomBookingSaved}
                    onCancel={handleBackToBookings}
                />
            </div>
        );
    }
    
    if (showCustomerAssignment) {
        return (
            <div className="manager-container">
                <div className="manager-header">
                    <button onClick={handleBackToBookings} className="back-button">
                        ← Back to Bookings
                    </button>
                    <h3>Assign Customer</h3>
                </div>
                <CustomerAssignmentPage 
                    booking={pendingCustomBooking}
                    onAssign={handleCustomerAssigned}
                    onCancel={handleBackToBookings}
                />
            </div>
        );
    }
    
    if (showWorkOrderForm) {
        return (
            <div className="manager-container">
                <div className="manager-header">
                    <button onClick={handleBackToBookings} className="back-button">
                        ← Back to Bookings
                    </button>
                    <h3>Create Work Order</h3>
                </div>
                <WorkOrderForm 
                    booking={selectedBookingForWorkOrder}
                    onSave={handleWorkOrderSaved}
                    onCancel={handleBackToBookings}
                />
            </div>
        );
    }

    if (showWorkOrderManager) {
        return (
            <div className="manager-container">
                <div className="manager-header">
                    <button onClick={handleBackToBookings} className="back-button">
                        ← Back to Bookings
                    </button>
                    <h3>Work Order Manager</h3>
                </div>
                <WorkOrderManager onBack={handleBackToBookings} />
            </div>
        );
    }

    return (
        <div className="manager-container">
            <div className="manager-header">
                <h3>Manage Bookings</h3>
                <div className="header-buttons">
                    <button onClick={handleCreateCustomBooking} className="custom-booking-btn">
                        ➕ Create Custom Booking
                    </button>
                    <button onClick={handleShowWorkOrderManager} className="work-order-manager-btn">
                        📋 Work Order Manager
                    </button>
                </div>
            </div>
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
                            {/* THE FIX: Added safety check for the 'makes' array */}
                            <datalist id="makes-list">
                                {Array.isArray(makes) && makes.map((makeName, i) => <option key={i} value={makeName} />)}
                            </datalist>
                        </div>
                        <div className="input-with-datalist">
                            <input list="models-list" name="model" value={filters.model} onChange={handleFilterChange} placeholder={isLoadingModels ? "Loading..." : "Car Model"} disabled={!filters.make} />
                            {/* THE FIX: Added safety check for the 'models' array */}
                            <datalist id="models-list">
                                {Array.isArray(models) && models.map((modelName, i) => <option key={i} value={modelName} />)}
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
                            Array.isArray(searchResults) && searchResults.map(renderBookingCard)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BookingManager;