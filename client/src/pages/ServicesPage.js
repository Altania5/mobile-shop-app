// client/src/pages/ServicesPage.js

import React, { useState, useEffect } from 'react';
import ServicesList from '../components/ServicesList';
import ServiceHelpForm from '../components/ServiceHelpForm';
import axios from 'axios';

const ServicesPage = () => {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [error, setError] = useState('');

    // Active filter states (updated when 'Apply' is clicked)
    const [searchTerm, setSearchTerm] = useState('');
    const [maxPrice, setMaxPrice] = useState(1000);
    const [durationFilters, setDurationFilters] = useState([]);

    // Draft states (updated by inputs directly)
    const [draftSearchTerm, setDraftSearchTerm] = useState('');
    const [draftMaxPrice, setDraftMaxPrice] = useState(1000);
    const [draftDurationFilters, setDraftDurationFilters] = useState([]);

    // Fetch initial data
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await axios.get('/api/services');
                setServices(res.data);
                setFilteredServices(res.data); // Initially, show all services
            } catch (err){
                setError('Could not fetch services.');
                console.error(err);
            }
        };
        fetchServices();
    }, []);

    // Helper function to parse duration
    const getDurationInMinutes = (duration) => {
        if (typeof duration === 'number') {
            return duration;
        }
        if (typeof duration !== 'string' || !duration) {
            return 0;
        }
        const match = duration.match(/(\d+(\.\d+)?)/);
        if (!match) return 0;
        let value = parseFloat(match[0]);
        if (duration.toLowerCase().includes('hour')) {
            value = value * 60;
        }
        return value;
    };

    // ** REVISED: useEffect to apply filters when active filter state changes **
    useEffect(() => {
        let tempServices = [...services];

        // 1. Filter by search term
        if (searchTerm) {
            tempServices = tempServices.filter(service =>
                service.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Filter by price
        tempServices = tempServices.filter(service => service.price <= maxPrice);

        // 3. Filter by duration
        if (durationFilters.length > 0) {
            tempServices = tempServices.filter(service => {
                const durationInMinutes = getDurationInMinutes(service.duration);
                // A service must have a valid duration AND match at least one selected filter range
                return durationInMinutes > 0 && durationFilters.some(filter => {
                    if (filter === 'lt60') return durationInMinutes < 60;
                    if (filter === '60-120') return durationInMinutes >= 60 && durationInMinutes <= 120;
                    if (filter === '121-240') return durationInMinutes > 120 && durationInMinutes <= 240;
                    if (filter === 'gt240') return durationInMinutes > 240;
                    return false;
                });
            });
        }

        setFilteredServices(tempServices);
    }, [services, searchTerm, maxPrice, durationFilters]); // This effect now directly depends on the filter states


    // --- NO CHANGES BELOW THIS LINE ---

    const handleDurationChange = (e) => {
        const { value, checked } = e.target;
        setDraftDurationFilters(prev =>
            checked ? [...prev, value] : prev.filter(item => item !== value)
        );
    };

    // This function simply updates the active filters, which then triggers the useEffect above
    const handleApplyFilters = () => {
        setSearchTerm(draftSearchTerm);
        setMaxPrice(draftMaxPrice);
        setDurationFilters(draftDurationFilters);
    };

    return (
        <>
        <div className="page-container">
            <section className="page-header">
                <h1>Your Trusted Mobile Mechanics</h1>
                <p>Professional vehicle maintenance and repair, delivered to your door. Choose from our wide range of professional mobile mechanic services.</p>
            </section>
        </div>

        <div className="container">
            <ServiceHelpForm />
        </div>

        <div className="page-container services-page-layout">
            <aside className="filter-sidebar">
                <div className="filter-widget">
                    <h4>Search Services</h4>
                    <input
                        type="text"
                        placeholder="e.g., Oil Change"
                        value={draftSearchTerm}
                        onChange={(e) => setDraftSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-widget">
                    <h4>Max Price: ${draftMaxPrice}</h4>
                    <input
                        type="range"
                        min="50"
                        max="1000"
                        step="10"
                        value={draftMaxPrice}
                        onChange={(e) => setDraftMaxPrice(Number(e.target.value))}
                        className="price-slider"
                    />
                </div>
                <div className="filter-widget">
                    <h4>By Duration</h4>
                    <div className="checkbox-group">
                        <label><input type="checkbox" value="lt60" onChange={handleDurationChange} /> &lt; 1 Hour</label>
                        <label><input type="checkbox" value="60-120" onChange={handleDurationChange} /> 1-2 Hours</label>
                        <label><input type="checkbox" value="121-240" onChange={handleDurationChange} /> 2-4 Hours</label>
                        <label><input type="checkbox" value="gt240" onChange={handleDurationChange} /> 4+ Hours</label>
                    </div>
                </div>
                <button onClick={handleApplyFilters} className="filter-apply-btn">
                    Apply Filters
                </button>
            </aside>

            <main className="services-main-content">
                {error && <p className="error-message">{error}</p>}
                <ServicesList services={filteredServices} />
            </main>
        </div>
        </>
    );
};

export default ServicesPage;