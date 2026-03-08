import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/userSlice';
import { userApi } from '../api/userApi';
import useSubscriptionStatus from '../hooks/useSubscriptionStatus';
import { roleConfig } from '../config/theme';
import FarmConnectLogo from './FarmConnectLogo';
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
  FaChevronDown,
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
 * Displays role-based navigation menu with icons and user dropdown
 * Supports mobile and desktop views with sticky positioning
 */
function NavigationComponent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const { statusDisplay } = useSubscriptionStatus();

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

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

  const handleLogout = async () => {
    try {
      await userApi.logout();
    } catch (error) {
    }

    dispatch(logout());
    sessionStorage.clear();
    // Force full page reload to clear all state
    window.location.href = '/login';
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
            <FarmConnectLogo size={32} showText={true} />
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

          {/* Right Side - User Profile Dropdown */}
          <div className="nav-right" ref={profileDropdownRef}>
            <button
              className="user-profile-btn"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              title="User menu"
            >
              <div className="user-avatar">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt={userName} className="avatar-image" />
                ) : (
                  <div className="avatar-placeholder">{userName.charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div className="profile-info">
                <span className="user-name">{userName}</span>
                <span className="user-role">{statusDisplay}</span>
              </div>
              <FaChevronDown className={`dropdown-icon ${isProfileDropdownOpen ? 'open' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="profile-dropdown-menu">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    {user?.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt={userName} className="avatar-image-lg" />
                    ) : (
                      <div className="avatar-placeholder-lg">{userName.charAt(0).toUpperCase()}</div>
                    )}
                  </div>
                  <div className="dropdown-user-info">
                    <div className="dropdown-name">{userName}</div>
                    <div className="dropdown-email">{user?.email}</div>
                    <div className="dropdown-status">{statusDisplay}</div>
                  </div>
                </div>

                <div className="dropdown-divider" />

                <button
                  className="dropdown-item"
                  onClick={() => {
                    handleNavigate('/profile');
                    setIsProfileDropdownOpen(false);
                  }}
                >
                  <FaUser className="dropdown-icon" />
                  <span>My Profile</span>
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    handleNavigate('/settings');
                    setIsProfileDropdownOpen(false);
                  }}
                >
                  <FaCog className="dropdown-icon" />
                  <span>Settings</span>
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    handleNavigate('/apply-agent');
                    setIsProfileDropdownOpen(false);
                  }}
                >
                  <FaUsers className="dropdown-icon" />
                  <span>Apply as Agent</span>
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    handleNavigate('/agent-earnings');
                    setIsProfileDropdownOpen(false);
                  }}
                >
                  <FaChartBar className="dropdown-icon" />
                  <span>Agent Earnings</span>
                </button>

                <div className="dropdown-divider" />

                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <FaSignOutAlt className="dropdown-icon" />
                  <span>Logout</span>
                </button>
              </div>
            )}
        </div>
      </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="navigation-mobile">
        <div className="mobile-nav-header">
          <div className="nav-logo-mobile" onClick={() => navigate('/')}>
            <FarmConnectLogo size={20} showText={false} />
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
            <button
              className="mobile-user-profile-btn"
              onClick={() => handleNavigate('/profile')}
            >
              <div className="mobile-avatar">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt={userName} className="avatar-image-sm" />
                ) : (
                  <div className="avatar-placeholder-sm">{userName.charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div className="mobile-profile-info">
                <p className="mobile-user-name">{userName}</p>
                <p className="mobile-user-role">{statusDisplay}</p>
              </div>
            </button>

            <button
              className="mobile-nav-item"
              onClick={() => {
                handleNavigate('/settings');
              }}
            >
              <FaCog className="mobile-nav-icon" />
              <span>Settings</span>
            </button>

            <button
              className="mobile-nav-item"
              onClick={() => {
                handleNavigate('/apply-agent');
              }}
            >
              <FaUsers className="mobile-nav-icon" />
              <span>Apply as Agent</span>
            </button>

            <button
              className="mobile-nav-item"
              onClick={() => {
                handleNavigate('/agent-earnings');
              }}
            >
              <FaChartBar className="mobile-nav-icon" />
              <span>Agent Earnings</span>
            </button>

            <div className="mobile-nav-divider" />

            <button className="mobile-logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        )}
      </nav>
    </>
  );
}

export default NavigationComponent;
