import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaLeaf, FaTractor, FaChartLine, FaHandshake, FaBox } from "react-icons/fa";
import "./FarmerDashboard.css";

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [stats, setStats] = useState({
    matches: 0,
    messages: 0,
    profile: 0,
    subscriptionStatus: 'inactive'
  });

  useEffect(() => {
    // Load farmer stats here - can integrate with API later
    // For now, using placeholder data
  }, []);

  const quickActions = [
    { 
      title: "Update Profile", 
      icon: <FaLeaf />, 
      route: "/profile/farmer",
      color: "var(--color-pry-600)"
    },
    { 
      title: "Find Vendors", 
      icon: <FaHandshake />, 
      route: "/matches",
      color: "var(--color-pry-700)"
    },
    { 
      title: "Messages", 
      icon: <FaBox />, 
      route: "/messages",
      color: "var(--color-sec-600)"
    },
    { 
      title: "Subscription", 
      icon: <FaChartLine />, 
      route: "/subscription",
      color: "var(--color-pry-800)"
    }
  ];

  return (
    <div className="farmer-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || 'Farmer'}!</h1>
        <p className="subtitle">Manage your farm connections and grow your network</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-pry-100)' }}>
            <FaHandshake style={{ color: 'var(--color-pry-800)' }} />
          </div>
          <div className="stat-content">
            <h3>{stats.matches}</h3>
            <p>Active Matches</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-sec-100)' }}>
            <FaBox style={{ color: 'var(--color-sec-800)' }} />
          </div>
          <div className="stat-content">
            <h3>{stats.messages}</h3>
            <p>Unread Messages</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-pry-100)' }}>
            <FaTractor style={{ color: 'var(--color-pry-800)' }} />
          </div>
          <div className="stat-content">
            <h3>{user?.farmerDetails ? '100%' : '0%'}</h3>
            <p>Profile Complete</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-pry-100)' }}>
            <FaChartLine style={{ color: 'var(--color-pry-800)' }} />
          </div>
          <div className="stat-content">
            <h3>{stats.subscriptionStatus === 'active' ? 'Active' : 'Inactive'}</h3>
            <p>Subscription</p>
          </div>
        </div>
      </div>

      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="quick-action-card"
              onClick={() => navigate(action.route)}
            >
              <div className="action-icon" style={{ background: action.color }}>
                {action.icon}
              </div>
              <span>{action.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-cta">
        <div className="cta-card">
          <FaLeaf className="cta-icon" />
          <div className="cta-content">
            <h3>Complete Your Profile</h3>
            <p>Add more details to get better matches with vendors</p>
            <button 
              className="cta-button"
              onClick={() => navigate('/profile/farmer')}
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
