import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaStore, FaUsers, FaChartLine, FaComments, FaCreditCard } from "react-icons/fa";
import useSubscriptionStatus from "../hooks/useSubscriptionStatus";
import { canAccessFeature } from "../utils/subscriptionHelper";
import "./VendorDashboard.css";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [stats, setStats] = useState({
    customers: 0,
    messages: 0,
    revenue: 0,
    subscriptionStatus: 'inactive'
  });
  const {
    hasActiveSubscription,
    statusType: subscriptionStatusType,
    subscriptionLoading,
  } = useSubscriptionStatus();

  useEffect(() => {
    setStats(prev => ({
      ...prev,
      subscriptionStatus: hasActiveSubscription ? 'active' : 'inactive'
    }));
  }, [hasActiveSubscription]);

  const quickActions = [
    { 
      title: "Update Profile", 
      icon: <FaStore />, 
      route: "/profile/vendor",
      color: "var(--color-sec-600)"
    },
    { 
      title: "Find Farmers", 
      icon: <FaUsers />, 
      route: "/customers",
      color: "var(--color-sec-700)"
    },
    { 
      title: "Messages", 
      icon: <FaComments />, 
      route: "/messages",
      color: "var(--color-pry-700)"
    },
    { 
      title: "Analytics", 
      icon: <FaChartLine />, 
      route: "/analytics",
      color: "var(--color-sec-800)"
    }
  ];

  const canUseDashboard = canAccessFeature(subscriptionStatusType, "core");

  if (subscriptionLoading) return <div style={{ padding: "24px" }}>Loading...</div>;

  if (!canUseDashboard) {
    return (
      <div style={{ padding: "clamp(16px, 4vw, 32px)", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", color: "#193325", marginBottom: "16px" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "#666", marginBottom: "24px" }}>
          {subscriptionStatusType === "expired"
            ? "Your subscription has expired. Renew to continue accessing your dashboard features."
            : "You need an active subscription to access the dashboard and manage your business."}
        </p>
        <button
          onClick={() => navigate("/pricing")}
          style={{
            background: "#2d8659",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "clamp(10px, 2vw, 14px) clamp(20px, 3vw, 32px)",
            fontSize: "clamp(14px, 2vw, 16px)",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#1f5f3d")}
          onMouseLeave={(e) => (e.target.style.background = "#2d8659")}
        >
          Subscribe Now
        </button>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || 'Vendor'}!</h1>
        <p className="subtitle">Manage your business and connect with farmers</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-sec-100)' }}>
            <FaUsers style={{ color: 'var(--color-sec-800)' }} />
          </div>
          <div className="stat-content">
            <h3>{stats.customers}</h3>
            <p>Active Customers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-pry-100)' }}>
            <FaComments style={{ color: 'var(--color-pry-800)' }} />
          </div>
          <div className="stat-content">
            <h3>{stats.messages}</h3>
            <p>Unread Messages</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-sec-100)' }}>
            <FaStore style={{ color: 'var(--color-sec-800)' }} />
          </div>
          <div className="stat-content">
            <h3>{user?.vendorDetails ? '100%' : '0%'}</h3>
            <p>Profile Complete</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-sec-100)' }}>
            <FaCreditCard style={{ color: 'var(--color-sec-800)' }} />
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
          <FaStore className="cta-icon" />
          <div className="cta-content">
            <h3>Complete Your Business Profile</h3>
            <p>Add more details to attract more farmers and grow your business</p>
            <button 
              className="cta-button"
              onClick={() => navigate('/profile/vendor')}
            >
              Update My Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
