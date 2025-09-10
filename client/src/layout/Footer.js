import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h3 className="footer-brand">Mobile Shop</h3>
          <p>
            Your trusted partner in mobile vehicle care. We bring expert service directly to you, combining convenience with quality.
          </p>
        </div>

        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Services</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/testimonials">Testimonials</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h3>Contact Info</h3>
          <p><span>Email:</span> JamesFerzanden@hardworkmobile.com</p>
          <p><span>Phone:</span> (123) 456-7890</p>
          <p><span>Service Area:</span> Your City, State</p>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {currentYear} Mobile Shop | All Rights Reserved
      </div>
    </footer>
  );
}

export default Footer;