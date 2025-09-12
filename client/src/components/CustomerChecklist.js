import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CustomerChecklist.css';

const CustomerChecklist = ({ user }) => {
    const [serviceType, setServiceType] = useState('quick'); // 'quick' or 'custom'

    // Generate dynamic steps based on service type and user state
    const getSteps = () => {
        const baseSteps = [
            {
                id: 1,
                title: "Create Account",
                description: "Sign up for a free account to get started",
                icon: "👤",
                completed: user ? true : false,
                action: user ? { text: "Go to Dashboard", link: "/dashboard" } : { text: "Sign Up", link: "/register" },
                note: user ? `Welcome back, ${user.name || 'valued customer'}!` : "Create your account to track service history"
            },
            {
                id: 2,
                title: "Add Payment Method",
                description: serviceType === 'quick' 
                    ? "Required for Professional Automotive Services" 
                    : "May be required for custom service requests",
                icon: "💳",
                completed: user && user.hasCardOnFile,
                action: user && !user.hasCardOnFile ? { text: "Add Card", link: "/dashboard?tab=account" } : null,
                note: serviceType === 'quick' 
                    ? "Secure payment processing • No charge until service complete"
                    : "Some services may require upfront payment authorization",
                required: serviceType === 'quick'
            }
        ];

        if (serviceType === 'quick') {
            // Professional service workflow - show choose service and schedule steps
            baseSteps.push(
                {
                    id: 3,
                    title: "Choose Your Service",
                    description: "Select from our professional automotive services",
                    icon: "🔧",
                    completed: false,
                    action: { text: "Browse Services", link: "#services" },
                    note: "All services include warranty and satisfaction guarantee"
                },
                {
                    id: 4,
                    title: "Schedule Appointment",
                    description: "Pick a convenient date and time for your service",
                    icon: "📅",
                    completed: false,
                    action: { text: "Book Now", link: "/booking" },
                    note: "Flexible scheduling including evenings and weekends"
                }
            );
        } else {
            // Custom request workflow - single step for request submission
            baseSteps.push({
                id: 3,
                title: "Submit Custom Request",
                description: "Tell us about your vehicle issue and we'll create a custom service plan",
                icon: "📝",
                completed: false,
                action: { text: "Submit Request", link: "#help-form" },
                note: "We'll contact you within 24 hours to discuss your request and schedule service"
            });
        }

        // Final step for both workflows
        baseSteps.push({
            id: baseSteps.length + 1,
            title: "Service Complete",
            description: "Our expert technician arrives and completes your service",
            icon: "✅",
            completed: false,
            action: null,
            note: "Real-time updates and progress notifications"
        });

        return baseSteps;
    };

    const steps = getSteps();

    const handleServiceTypeChange = (type) => {
        setServiceType(type);
    };

    return (
        <div className="customer-checklist-container">
            <div className="checklist-header">
                <span className="section-badge">Getting Started</span>
                <h2>How to Book Your Service</h2>
                <p>Follow these simple steps to get professional automotive service at your location</p>
            </div>

            {/* Service Type Selector */}
            <div className="service-type-selector">
                <h3>What type of service do you need?</h3>
                <div className="service-type-options">
                    <button 
                        className={`service-type-btn ${serviceType === 'quick' ? 'active' : ''}`}
                        onClick={() => handleServiceTypeChange('quick')}
                    >
                        <div className="service-type-icon">🔧</div>
                        <div className="service-type-content">
                            <h4>Professional Services</h4>
                            <p>Oil changes, brake repair, diagnostics, etc.</p>
                        </div>
                    </button>
                    <button 
                        className={`service-type-btn ${serviceType === 'custom' ? 'active' : ''}`}
                        onClick={() => handleServiceTypeChange('custom')}
                    >
                        <div className="service-type-icon">📝</div>
                        <div className="service-type-content">
                            <h4>Custom Request</h4>
                            <p>Describe your vehicle issue for a quote</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Steps Checklist */}
            <div className="checklist-steps">
                {steps.map((step, index) => (
                    <div 
                        key={step.id} 
                        className={"checklist-step"}
                    >
                        <div className="step-number">
                            {step.completed ? (
                                <span className="step-check">✓</span>
                            ) : (
                                <span className="step-icon">{step.icon}</span>
                            )}
                        </div>
                        
                        <div className="step-content">
                            <div className="step-header">
                                <h4>
                                    {step.title}
                                    {step.required && serviceType === 'quick' && (
                                        <span className="required-badge">Required</span>
                                    )}
                                </h4>
                                <p>{step.description}</p>
                            </div>
                            
                            {step.note && (
                                <div className="step-note">
                                    <span className="note-icon">ℹ️</span>
                                    {step.note}
                                </div>
                            )}
                            
                            {step.action && (
                                <div className="step-action">
                                    {step.action.link.startsWith('#') ? (
                                        <a href={step.action.link} className="step-action-btn">
                                            {step.action.text}
                                        </a>
                                    ) : (
                                        <Link to={step.action.link} className="step-action-btn">
                                            {step.action.text}
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {index < steps.length - 1 && (
                            <div className="step-connector">
                                <div className={"connector-line"}></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="checklist-actions">
                <h3>Ready to get started?</h3>
                <div className="action-buttons">
                    {serviceType === 'quick' ? (
                        <a href="#services" className="primary-action-btn">
                            <span className="btn-icon">🔧</span>
                            Browse Professional Services
                        </a>
                    ) : (
                        <Link to="/contact" className="primary-action-btn">
                            <span className="btn-icon">📝</span>
                            Request Custom Quote
                        </Link>
                    )}
                    
                    <Link to="/about" className="secondary-action-btn">
                        <span className="btn-icon">📖</span>
                        Learn More About Us
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CustomerChecklist;
