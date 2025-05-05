// src/components/Sidebar.jsx
import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { FaBars, FaHome, FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';
import './Sidebar.scss';

const Sidebar = () => {
  const { token, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="top-section">
        <h4 className="logo">{isOpen ? 'MyApp' : 'MA'}</h4>
        <FaBars className="toggle-btn" onClick={toggleSidebar} />
      </div>

      <nav className="nav-links">
        <NavLink to="/" className="link">
          <FaHome />
          <span className="link-text">Dashboard</span>
        </NavLink>

        {!token ? (
          <>
            <NavLink to="/login" className="link">
              <FaSignInAlt />
              <span className="link-text">Login</span>
            </NavLink>
            <NavLink to="/register" className="link">
              <FaUserPlus />
              <span className="link-text">Register</span>
            </NavLink>
          </>
        ) : (
          <button className="link logout-btn" onClick={logout}>
            <FaSignOutAlt />
            <span className="link-text">Logout</span>
          </button>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
