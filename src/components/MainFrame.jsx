import React from 'react';
import Sidebar from './Sidebar.jsx'; // Make sure Sidebar exists
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import './MainFrame.scss';

const MainFrame = ({ children }) => (
  <div className="main-frame">
    <Sidebar />
    <div className="main-area">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  </div>
);

export default MainFrame;
