import React from 'react';
import './Footer.scss';

const Footer = () => (
  <footer className="footer">
    <p>&copy; {new Date().getFullYear()} Finance Tracker. All rights reserved.</p>
  </footer>
);

export default Footer;
