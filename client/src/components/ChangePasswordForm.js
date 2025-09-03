import React, { useState } from 'react';
import axios from 'axios';
import './ChangePasswordForm.css';

const ChangePasswordForm = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [status, setStatus] = useState({ message: '', type: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmNewPassword) {
            setStatus({ message: 'New passwords do not match.', type: 'error' });
            return;
        }
        setStatus({ message: 'Updating...', type: 'info' });

        try {
            const res = await axios.post('/api/users/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            setStatus({ message: res.data.msg, type: 'success' });
            // Clear form
            setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (error) {
            const message = error.response?.data?.msg || 'An error occurred.';
            setStatus({ message, type: 'error' });
        }
    };

    return (
        <div className="change-password-container">
            <h3>Change Password</h3>
            <form onSubmit={handleSubmit} className="change-password-form">
                <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmNewPassword">Confirm New Password</label>
                    <input
                        type="password"
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Update Password</button>
            </form>
            {status.message && (
                <div className={`status-message ${status.type}`}>
                    {status.message}
                </div>
            )}
        </div>
    );
};

export default ChangePasswordForm;