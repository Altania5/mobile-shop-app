import React, { useState } from 'react';
import axios from 'axios';
import './ServiceHelpForm.css';

const ServiceHelpForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        generalIssue: '',
        detailedDescription: '',
        carMake: '',
        carModel: '',
        carTrim: '',
        vin: ''
    });

    const [status, setStatus] = useState({
        submitted: false,
        message: '',
        error: false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/service-request', formData);
            setStatus({
                submitted: true,
                message: response.data.msg,
                error: false
            });
            // Reset form after successful submission
            setFormData({
                name: '',
                email: '',
                generalIssue: '',
                detailedDescription: '',
                carMake: '',
                carModel: '',
                carTrim: '',
                vin: ''
            });
        } catch (error) {
            setStatus({
                submitted: true,
                message: error.response?.data?.msg || 'An unexpected error occurred.',
                error: true
            });
        }
    };

    return (
        <div className="service-help-form-container">
            <h2>Need Help With Your Vehicle?</h2>
            <p>Fill out the form below and we'll get back to you with a quote and next steps.</p>
            <form onSubmit={handleSubmit} className="service-help-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                </div>

                <div className="form-group full-width">
                    <label htmlFor="generalIssue">General Issue *</label>
                    <input type="text" id="generalIssue" name="generalIssue" value={formData.generalIssue} onChange={handleChange} placeholder="e.g., Brake noise, Check engine light" required />
                </div>

                <div className="form-group full-width">
                    <label htmlFor="detailedDescription">Detailed Description *</label>
                    <textarea id="detailedDescription" name="detailedDescription" value={formData.detailedDescription} onChange={handleChange} rows="4" required></textarea>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="carMake">Car Make *</label>
                        <input type="text" id="carMake" name="carMake" value={formData.carMake} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="carModel">Car Model *</label>
                        <input type="text" id="carModel" name="carModel" value={formData.carModel} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="carTrim">Car Trim</label>
                        <input type="text" id="carTrim" name="carTrim" value={formData.carTrim} onChange={handleChange} />
                    </div>
                </div>
                
                <div className="form-group full-width">
                    <label htmlFor="vin">VIN *</label>
                    <input type="text" id="vin" name="vin" value={formData.vin} onChange={handleChange} required />
                </div>

                <button type="submit" className="submit-btn">Submit Request</button>

                {status.submitted && (
                    <div className={`status-message ${status.error ? 'error' : 'success'}`}>
                        {status.message}
                    </div>
                )}
            </form>
        </div>
    );
};

export default ServiceHelpForm;