const sendEmail = require('../utils/sendEmail');

const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL || 'https://hardworkmobile-0bf9805ba163.herokuapp.com'}/verify-email/${verificationToken}`;
  
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - MobileTech Solutions</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8fafc;
                padding: 20px;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                padding: 30px 40px;
                text-align: center;
                color: white;
            }
            
            .header h1 {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 10px;
            }
            
            .header p {
                font-size: 16px;
                opacity: 0.9;
            }
            
            .content {
                padding: 40px;
            }
            
            .greeting {
                font-size: 18px;
                margin-bottom: 25px;
                color: #1e3a8a;
                font-weight: 600;
            }
            
            .message {
                font-size: 16px;
                margin-bottom: 30px;
                line-height: 1.8;
                color: #4b5563;
            }
            
            .verify-button {
                display: inline-block;
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                text-decoration: none;
                padding: 15px 35px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                margin: 20px 0;
                transition: transform 0.3s ease;
            }
            
            .verify-button:hover {
                transform: translateY(-2px);
            }
            
            .button-container {
                text-align: center;
                margin: 30px 0;
            }
            
            .alternative-text {
                background: #f3f4f6;
                padding: 20px;
                border-radius: 8px;
                margin: 25px 0;
                border-left: 4px solid #3b82f6;
            }
            
            .alternative-text p {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 10px;
            }
            
            .verification-link {
                word-break: break-all;
                font-family: monospace;
                background: #e5e7eb;
                padding: 10px;
                border-radius: 4px;
                font-size: 12px;
                color: #374151;
            }
            
            .security-notice {
                background: #fef3c7;
                border: 1px solid #fbbf24;
                padding: 15px;
                border-radius: 8px;
                margin-top: 25px;
            }
            
            .security-notice h3 {
                color: #92400e;
                font-size: 16px;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
            }
            
            .security-notice p {
                color: #92400e;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .footer {
                background: #f8fafc;
                padding: 25px 40px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }
            
            .footer p {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 8px;
            }
            
            .support-info {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #e5e7eb;
            }
            
            @media (max-width: 600px) {
                .container {
                    margin: 0;
                    border-radius: 0;
                }
                
                .header, .content, .footer {
                    padding: 25px 20px;
                }
                
                .header h1 {
                    font-size: 24px;
                }
                
                .verify-button {
                    display: block;
                    text-align: center;
                    margin: 20px 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to MobileTech Solutions!</h1>
                <p>Verify your email to get started</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Hello ${user.firstName} ${user.lastName}!
                </div>
                
                <div class="message">
                    Thank you for registering with MobileTech Solutions. To complete your account setup and start using our mobile repair services, please verify your email address by clicking the button below.
                </div>
                
                <div class="button-container">
                    <a href="${verificationUrl}" class="verify-button">Verify Email Address</a>
                </div>
                
                <div class="alternative-text">
                    <p>If the button above doesn't work, you can also verify your email by copying and pasting the following link into your browser:</p>
                    <div class="verification-link">${verificationUrl}</div>
                </div>
                
                <div class="security-notice">
                    <h3>🔒 Security Notice</h3>
                    <p>This verification link will expire in 24 hours for security reasons. If you didn't create an account with MobileTech Solutions, please ignore this email.</p>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>MobileTech Solutions</strong></p>
                <p>Professional Mobile Device Repair Services</p>
                
                <div class="support-info">
                    <p>Need help? Contact our support team</p>
                    <p>This email was sent to ${user.email}</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

  const emailOptions = {
    to: user.email,
    subject: 'Verify Your Email - MobileTech Solutions',
    html: htmlTemplate
  };

  await sendEmail(emailOptions);
};

const sendWelcomeEmail = async (user) => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to MobileTech Solutions</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8fafc;
                padding: 20px;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                padding: 30px 40px;
                text-align: center;
                color: white;
            }
            
            .content {
                padding: 40px;
            }
            
            .welcome-text {
                font-size: 18px;
                color: #1e3a8a;
                font-weight: 600;
                margin-bottom: 20px;
            }
            
            .features {
                background: #f8fafc;
                padding: 25px;
                border-radius: 8px;
                margin: 25px 0;
            }
            
            .feature-item {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .feature-icon {
                font-size: 20px;
                margin-right: 12px;
                width: 30px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to MobileTech Solutions!</h1>
                <p>Your email has been verified successfully</p>
            </div>
            
            <div class="content">
                <div class="welcome-text">
                    Hi ${user.firstName}! You're all set to get started.
                </div>
                
                <p>Your account is now active and you can access all our features:</p>
                
                <div class="features">
                    <div class="feature-item">
                        <div class="feature-icon">📱</div>
                        <div>Book repair services for your mobile devices</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">📊</div>
                        <div>Track your repair progress in real-time</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">💼</div>
                        <div>Manage your service history and work orders</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">💬</div>
                        <div>Get expert support from our team</div>
                    </div>
                </div>
                
                <p>Ready to get started? <a href="${process.env.CLIENT_URL || 'https://hardworkmobile-0bf9805ba163.herokuapp.com'}/services" style="color: #3b82f6; font-weight: 600;">Explore our services</a></p>
            </div>
        </div>
    </body>
    </html>
  `;

  const emailOptions = {
    to: user.email,
    subject: '🎉 Welcome to MobileTech Solutions!',
    html: htmlTemplate
  };

  await sendEmail(emailOptions);
};

const sendCustomBookingVerificationEmail = async (customerEmail, customerName, booking) => {
  const verificationUrl = `${process.env.CLIENT_URL || 'https://hardworkmobile-0bf9805ba163.herokuapp.com'}/verify-custom-booking/${booking.verificationToken}`;
  
  const serviceName = booking.isCustomService ? booking.customServiceName : (booking.service?.name || 'Professional Service');
  const servicePrice = booking.isCustomService ? booking.customServicePrice : (booking.service?.price || 'TBD');
  const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation Required - MobileTech Solutions</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8fafc;
                padding: 20px;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                padding: 30px 40px;
                text-align: center;
                color: white;
            }
            
            .header h1 {
                font-size: 26px;
                font-weight: 700;
                margin-bottom: 10px;
            }
            
            .header p {
                font-size: 16px;
                opacity: 0.9;
            }
            
            .content {
                padding: 40px;
            }
            
            .greeting {
                font-size: 18px;
                margin-bottom: 25px;
                color: #1e3a8a;
                font-weight: 600;
            }
            
            .message {
                font-size: 16px;
                margin-bottom: 30px;
                line-height: 1.8;
                color: #4b5563;
            }
            
            .booking-details {
                background: #f3f4f6;
                border-radius: 12px;
                padding: 25px;
                margin: 25px 0;
                border-left: 5px solid #f59e0b;
            }
            
            .booking-details h3 {
                color: #1e3a8a;
                font-size: 18px;
                margin-bottom: 15px;
            }
            
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .detail-row:last-child {
                border-bottom: none;
            }
            
            .detail-label {
                font-weight: 600;
                color: #374151;
            }
            
            .detail-value {
                color: #6b7280;
                text-align: right;
                max-width: 60%;
            }
            
            .verify-button {
                display: inline-block;
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
                text-decoration: none;
                padding: 18px 40px;
                border-radius: 10px;
                font-weight: 700;
                font-size: 16px;
                margin: 25px 0;
                transition: transform 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .verify-button:hover {
                transform: translateY(-3px);
            }
            
            .button-container {
                text-align: center;
                margin: 35px 0;
            }
            
            .alternative-text {
                background: #fef3c7;
                padding: 20px;
                border-radius: 8px;
                margin: 25px 0;
                border-left: 4px solid #f59e0b;
            }
            
            .alternative-text p {
                font-size: 14px;
                color: #92400e;
                margin-bottom: 10px;
            }
            
            .verification-link {
                word-break: break-all;
                font-family: monospace;
                background: #fbbf24;
                color: white;
                padding: 10px;
                border-radius: 4px;
                font-size: 12px;
            }
            
            .important-notice {
                background: #fee2e2;
                border: 2px solid #f87171;
                padding: 20px;
                border-radius: 8px;
                margin-top: 30px;
            }
            
            .important-notice h3 {
                color: #dc2626;
                font-size: 16px;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
            }
            
            .important-notice p {
                color: #dc2626;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .footer {
                background: #f8fafc;
                padding: 30px 40px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }
            
            .footer p {
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 8px;
            }
            
            @media (max-width: 600px) {
                .container {
                    margin: 0;
                    border-radius: 0;
                }
                
                .header, .content, .footer {
                    padding: 25px 20px;
                }
                
                .header h1 {
                    font-size: 22px;
                }
                
                .verify-button {
                    display: block;
                    text-align: center;
                    padding: 15px 20px;
                }
                
                .detail-row {
                    flex-direction: column;
                    gap: 5px;
                }
                
                .detail-value {
                    text-align: left;
                    max-width: 100%;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📋 Service Booking Confirmation</h1>
                <p>Please confirm your professional service appointment</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Hello ${customerName}!
                </div>
                
                <div class="message">
                    Our team has created a professional service booking for you. Please review the details below and confirm your appointment by clicking the confirmation button.
                </div>
                
                <div class="booking-details">
                    <h3>📝 Booking Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Service:</span>
                        <span class="detail-value">${serviceName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date:</span>
                        <span class="detail-value">${formattedDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Time:</span>
                        <span class="detail-value">${booking.time}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Duration:</span>
                        <span class="detail-value">${booking.duration || 60} minutes</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Vehicle:</span>
                        <span class="detail-value">${booking.vehicleYear} ${booking.vehicleMake} ${booking.vehicleModel}</span>
                    </div>
                    ${booking.isCustomService ? `
                    <div class="detail-row">
                        <span class="detail-label">Price:</span>
                        <span class="detail-value">$${servicePrice}</span>
                    </div>
                    ` : ''}
                    ${booking.notes ? `
                    <div class="detail-row">
                        <span class="detail-label">Notes:</span>
                        <span class="detail-value">${booking.notes}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="button-container">
                    <a href="${verificationUrl}" class="verify-button">Confirm Booking</a>
                </div>
                
                <div class="alternative-text">
                    <p>If the button above doesn't work, copy and paste this link into your browser:</p>
                    <div class="verification-link">${verificationUrl}</div>
                </div>
                
                <div class="important-notice">
                    <h3>⚠️ Action Required</h3>
                    <p>This booking confirmation link will expire in 7 days. If you did not request this service or have any questions, please contact us immediately. Your confirmation helps us prepare for your service appointment.</p>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>MobileTech Solutions</strong></p>
                <p>Professional Mobile Device Repair Services</p>
                <p>Contact us: support@mobiletech.com | (555) 123-4567</p>
                <p>This email was sent to ${customerEmail}</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const emailOptions = {
    to: customerEmail,
    subject: '📋 Booking Confirmation Required - MobileTech Solutions',
    html: htmlTemplate
  };

  await sendEmail(emailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendCustomBookingVerificationEmail
};
