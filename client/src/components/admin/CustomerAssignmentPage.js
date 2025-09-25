import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import './CustomerAssignmentPage.css';

function CustomerAssignmentPage({ booking, onAssign, onCancel, onCreateNewCustomer }) {
    const [customers, setCustomers] = useState([]);
    const [remoteResults, setRemoteResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState({
        firstName: booking?.clientFirstName || '',
        lastName: booking?.clientLastName || '',
        email: '',
        phone: ''
    });

    const token = localStorage.getItem('token');
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        const trimmed = searchTerm.trim();

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = null;
        }

        if (!trimmed) {
            setSearching(false);
            setRemoteResults([]);
            return;
        }

        searchTimeoutRef.current = setTimeout(() => {
            performSearch(trimmed);
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
                searchTimeoutRef.current = null;
            }
        };
    }, [searchTerm]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const headers = { 'x-auth-token': token };
            const response = await axios.get('/api/admin/users', { headers });
            
            const rawUsers = Array.isArray(response.data) ? response.data : [];
            if (!Array.isArray(response.data)) {
                throw new Error('Invalid response format from server');
            }
            
            // Filter to get only customers (non-admin users)
            const customerUsers = rawUsers.filter(user => !user.isAdmin && user.role !== 'admin');
            
            setCustomers(customerUsers);
            setRemoteResults([]);
        } catch (err) {
            setError(err.response?.data?.msg || err.message || 'Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const performSearch = async (term) => {
        const trimmed = term.trim();
        if (!trimmed) {
            setRemoteResults([]);
            setSearching(false);
            return;
        }

        setSearching(true);
        setError('');

        try {
            const headers = { 'x-auth-token': token };
            const response = await axios.get(`/api/admin/users/search?query=${encodeURIComponent(trimmed)}`, { headers });
            const remoteUsers = Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.data?.users)
                    ? response.data.users
                    : [];
            const results = remoteUsers.filter(user => !user.isAdmin && user.role !== 'admin');
            setRemoteResults(results);
        } catch (err) {
            setError('Failed to search customers. Please try again.');
            setRemoteResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredCustomers = useMemo(() => {
        const trimmed = searchTerm.trim().toLowerCase();

        if (remoteResults.length > 0) {
            return remoteResults;
        }

        if (!trimmed) {
            return customers;
        }

        return customers.filter(customer => {
            const fullName = `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim().toLowerCase();
            const email = (customer.email ?? '').toLowerCase();
            const phone = customer.phone ? String(customer.phone).toLowerCase() : '';
            const username = (customer.username ?? '').toLowerCase();

            return (
                fullName.includes(trimmed) ||
                email.includes(trimmed) ||
                phone.includes(trimmed) ||
                username.includes(trimmed)
            );
        });
    }, [customers, remoteResults, searchTerm]);

    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);
    };

    const handleAssignBooking = async () => {
        if (!selectedCustomer) {
            alert('Please select a customer first');
            return;
        }

        try {
            setLoading(true);
            const headers = { 'x-auth-token': token };
            
            await axios.patch(`/api/bookings/${booking._id}/assign-customer`, {
                customerId: selectedCustomer._id,
                customerEmail: selectedCustomer.email
            }, { headers });

            alert(`Booking successfully assigned to ${selectedCustomer.firstName} ${selectedCustomer.lastName}. Verification email sent!`);
            onAssign(selectedCustomer);
        } catch (err) {
            console.error('Error assigning booking:', err);
            setError(err.response?.data?.msg || 'Failed to assign booking');
        } finally {
            setLoading(false);
        }
    };

    const handleNewCustomerChange = (e) => {
        setNewCustomerData({
            ...newCustomerData,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateNewCustomer = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const headers = { 'x-auth-token': token };
            
            const response = await axios.post('/api/admin/create-customer', newCustomerData, { headers });
            const newCustomer = response.data.user;
            
            // Assign the booking to the new customer
            await axios.patch(`/api/bookings/${booking._id}/assign-customer`, {
                customerId: newCustomer._id,
                customerEmail: newCustomer.email
            }, { headers });

            alert(`New customer created and booking assigned! Verification email sent to ${newCustomer.email}`);
            onAssign(newCustomer);
        } catch (err) {
            console.error('Error creating customer:', err);
            setError(err.response?.data?.msg || 'Failed to create customer');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="customer-assignment-page">
            <div className="assignment-header">
                <h2>Assign Customer to Booking</h2>
                <p>Search and select a customer to assign this booking to, or create a new customer.</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Booking Summary */}
            <div className="booking-summary">
                <h3>Booking Details</h3>
                <div className="summary-grid">
                    <div className="summary-item">
                        <span className="label">Service:</span>
                        <span className="value">
                            {booking?.customServiceName || 'Loading...'}
                        </span>
                    </div>
                    <div className="summary-item">
                        <span className="label">Date:</span>
                        <span className="value">{booking?.date ? formatDate(booking.date) : 'Loading...'}</span>
                    </div>
                    <div className="summary-item">
                        <span className="label">Time:</span>
                        <span className="value">{booking?.time || 'Loading...'}</span>
                    </div>
                    <div className="summary-item">
                        <span className="label">Client Name:</span>
                        <span className="value">{booking?.clientFirstName} {booking?.clientLastName}</span>
                    </div>
                    <div className="summary-item">
                        <span className="label">Vehicle:</span>
                        <span className="value">
                            {booking?.vehicleYear} {booking?.vehicleMake} {booking?.vehicleModel}
                        </span>
                    </div>
                </div>
            </div>

            <div className="assignment-content">
                {!showNewCustomerForm ? (
                    <>
                        {/* Customer Search */}
                        <div className="customer-search-section">
                            <div className="search-header">
                                <h3>Search Existing Customers</h3>
                                <button 
                                    onClick={() => setShowNewCustomerForm(true)}
                                    className="btn-secondary"
                                >
                                    + Create New Customer
                                </button>
                            </div>
                            
                            <div className="search-input-container">
                                <input
                                    type="text"
                                    placeholder="Search customers by name, email, or phone..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="search-input"
                                />
                                <button
                                    type="button"
                                    className="search-button"
                                    onClick={() => performSearch(searchTerm)}
                                    disabled={searching}
                                >
                                    {searching ? 'Searching...' : 'Search'}
                                </button>
                            </div>

                            {(loading || searching) ? (
                                <p>Loading customers...</p>
                            ) : (
                                <div className="customer-list">
                                    {filteredCustomers.length === 0 ? (
                                        <p>No customers found. Try adjusting your search or create a new customer.</p>
                                    ) : (
                                        filteredCustomers.map(customer => (
                                            <div
                                                key={customer._id}
                                                className={`customer-card ${selectedCustomer?._id === customer._id ? 'selected' : ''}`}
                                                onClick={() => handleCustomerSelect(customer)}
                                            >
                                                <div className="customer-info">
                                                    <h4>{customer.firstName} {customer.lastName}</h4>
                                                    <p className="customer-email">{customer.email}</p>
                                                    {customer.phone && <p className="customer-phone">{customer.phone}</p>}
                                                </div>
                                                {selectedCustomer?._id === customer._id && (
                                                    <div className="selection-indicator">✓</div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="assignment-actions">
                            <button onClick={onCancel} className="btn-cancel">
                                Cancel
                            </button>
                            <button 
                                onClick={handleAssignBooking}
                                disabled={!selectedCustomer || loading}
                                className="btn-primary"
                            >
                                {loading ? 'Assigning...' : 'Assign Booking & Send Verification'}
                            </button>
                        </div>
                    </>
                ) : (
                    /* New Customer Form */
                    <div className="new-customer-section">
                        <div className="form-header">
                            <h3>Create New Customer</h3>
                            <button 
                                onClick={() => setShowNewCustomerForm(false)}
                                className="btn-secondary"
                            >
                                ← Back to Search
                            </button>
                        </div>

                        <form onSubmit={handleCreateNewCustomer} className="new-customer-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name:</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={newCustomerData.firstName}
                                        onChange={handleNewCustomerChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name:</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={newCustomerData.lastName}
                                        onChange={handleNewCustomerChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email:</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={newCustomerData.email}
                                        onChange={handleNewCustomerChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone (Optional):</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={newCustomerData.phone}
                                        onChange={handleNewCustomerChange}
                                    />
                                </div>
                            </div>
                            
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowNewCustomerForm(false)} className="btn-cancel">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="btn-primary">
                                    {loading ? 'Creating...' : 'Create Customer & Assign Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CustomerAssignmentPage;
