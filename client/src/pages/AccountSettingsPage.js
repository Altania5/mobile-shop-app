import React from 'react';
import ChangePasswordForm from '../components/ChangePasswordForm';
import SquarePaymentForm from '../components/SquarePaymentForm';
import './AccountSettingsPage.css';

const AccountSettingsPage = () => {
    return (
        <div className="account-settings-page">
            <div className="container">
                <h1>Account Settings</h1>
                <div className="settings-container">
                    <div className="settings-section">
                        <ChangePasswordForm />
                    </div>
                    <div className="settings-section">
                        <SquarePaymentForm />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSettingsPage;