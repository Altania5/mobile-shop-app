import React, { useState } from 'react';
import axios from 'axios';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [responseMsg, setResponseMsg] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
    try {
      const response = await axios.post('/api/contact', formData);
      setResponseMsg(response.data.msg);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setMessage('Your message has been sent successfully!');
    } catch (err) {
      setMessage('An error occurred. Please try again.');
    } finally {
            setIsSubmitting(false);
        }
  };

  return (
    <div className="page-container">
      <div className="contact-header">
        <h2>Get In Touch</h2>
        <p>Have a question or need a quote? Fill out the form below, and I'll get back to you as soon as possible.</p>
      </div>
      <div className="contact-wrapper">
        <form onSubmit={handleSubmit} className="contact-form">
          {responseMsg && (
            <div className={isError ? 'error-message' : 'success-message'}>
              {responseMsg}
            </div>
          )}
          <div className="form-grid">
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" required />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your Email" required />
          </div>
          <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Subject" required />
          <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Your Message" required />
          <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
            {message && <p>{message}</p>}
        </form>
        <div className="contact-info">
          <h3>Contact Information</h3>
          <p><strong>Email:</strong> JamesFerzanden@hardworkmobile.com</p>
          <p><strong>Phone:</strong> (484) 593-3875</p>
          <p><strong>Service Area:</strong> Chester County, PA</p>
          <p><strong>Hours:</strong> Mon - Fri, 10:00 AM - 6:00 PM</p>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;