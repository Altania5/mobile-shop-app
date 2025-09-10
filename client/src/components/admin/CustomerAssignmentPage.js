import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomerAssignmentPage.css';

function CustomerAssignmentPage({ booking, onAssign, onCancel, onCreateNewCustomer }) {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState({
        firstName: booking?.clientFirstName || '',
        lastName: booking?.clientLastName || '',
        email: '',
        phone: ''
    });

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = customers.filter(customer => {
                const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
                const email = customer.email.toLowerCase();
                const search = searchTerm.toLowerCase();
                return fullName.includes(search) || email.includes(search);
            });
            setFilteredCustomers(filtered);
        } else {
            setFilteredCustomers(customers);
        }
    }, [searchTerm, customers]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const headers = { 'x-auth-token': token };
            console.log('Fetching customers from /api/admin/users');
            
            const response = await axios.get('/api/admin/users', { headers });
            console.log('Response received:', response.data);
            
            // Check if response.data is an array
            if (!Array.isArray(response.data)) {
                console.error('API response is not an array:', response.data);
                throw new Error('Invalid response format from server');
            }
            
            // Filter to get only customers (non-admin users)
            const customerUsers = response.data.filter(user => 
                !user.isAdmin && user.role !== 'admin'
            );
            console.log('Filtered customers:', customerUsers);
            
            setCustomers(customerUsers);
            setFilteredCustomers(customerUsers);
        } catch (err) {
            console.error('Error fetching customers:', err);
            console.error('Error details:', err.response?.data);
            setError(err.response?.data?.msg || err.message || 'Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

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
                                    placeholder="Search customers by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>

                            {loading ? (
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
