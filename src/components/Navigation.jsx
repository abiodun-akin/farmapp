import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/userSlice';
import { theme, roleConfig } from '../config/theme';
import './Navigation.css';

// Icon imports from react-icons
import {
  FaHome,
  FaUser,
  FaHandshake,
  FaComments,
  FaCreditCard,
  FaShoppingCart,
  FaChartBar,
  FaCog,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaShieldAlt,
  FaUsers,
  FaFlag,
  FaBox,
  FaExclamationCircle,
  FaClipboardList,
} from 'react-icons/fa';

/**
 * Icon Mapper - maps icon keys to actual icon components
 */
const iconMap = {
  home: FaHome,
  user: FaUser,
  handshake: FaHandshake,
  message: FaComments,
  creditCard: FaCreditCard,
  shopping: FaShoppingCart,
  barChart: FaChartBar,
  settings: FaCog,
  shield: FaShieldAlt,
  users: FaUsers,
  flag: FaFlag,
  package: FaBox,
  alert: FaExclamationCircle,
  dashboard: FaClipboardList,
};

/**
 * Navigation Component
 * Displays role-based navigation menu with icons
 * Supports mobile and desktop views
 */
function NavigationComponent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  // Get role-specific menu configuration - use profileType if available, fallback to farmer
  const userRole = user?.profileType || 'farmer';
  const config = roleConfig[userRole] || roleConfig.farmer;

  const handleNavigate = (route) => {
    navigate(route);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const renderIcon = (iconKey) => {
    const IconComponent = iconMap[iconKey];
    return IconComponent ? <IconComponent /> : null;
  };

  // Get user name safely
  const userName = user?.name || 'User';

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="navigation-desktop">
        <div className="nav-container">
          {/* Logo */}
          <div className="nav-logo" onClick={() => navigate('/')}>
            🌾 <span>FarmConnect</span>
          </div>

          {/* Menu Items */}
          <div className="nav-menu">
            {config.menuItems.map((item, index) => (
              <button
                key={index}
                className="nav-item"
                onClick={() => handleNavigate(item.route)}
                title={item.label}
              >
                <span className="nav-icon">{renderIcon(item.icon)}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Right Side - User Info & Logout */}
          <div className="nav-right">
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-role">{config.label}</span>
            </div>
            <button className="nav-logout" onClick={handleLogout} title="Logout">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="navigation-mobile">
        <div className="mobile-nav-header">
          <div className="nav-logo-mobile" onClick={() => navigate('/')}>
            🌾
          </div>
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="mobile-menu-items">
            {config.menuItems.map((item, index) => (
              <button
                key={index}
                className="mobile-nav-item"
                onClick={() => handleNavigate(item.route)}
              >
                <span className="mobile-nav-icon">{renderIcon(item.icon)}</span>
                <span>{item.label}</span>
              </button>
            ))}
            <div className="mobile-nav-divider" />
            <div className="mobile-user-section">
              <div className="mobile-user-info">
                <p className="mobile-user-name">{userName}</p>
                <p className="mobile-user-role">{config.label}</p>
              </div>
              <button className="mobile-logout-btn" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default NavigationComponent;
