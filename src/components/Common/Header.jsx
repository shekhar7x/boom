import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" fill="currentColor" opacity="0.2" />
            <circle cx="16" cy="16" r="8" fill="currentColor" />
            <circle cx="16" cy="16" r="4" fill="white" />
          </svg>
          <span className="header-logo-text">Boom</span>
        </Link>

        <nav className="header-nav">
          <Link
            to="/"
            className={`header-nav-link ${isActive('/') ? 'active' : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
            Record
          </Link>

          <Link
            to="/videos"
            className={`header-nav-link ${isActive('/videos') ? 'active' : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="15" rx="2" />
              <polyline points="17 2 12 7 7 2" />
            </svg>
            My Videos
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
