import { useEffect, useState } from "react";
import {
  FaBox,
  FaChartLine,
  FaHandshake,
  FaLeaf,
  FaTractor,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useSagaApi from "../hooks/useSagaApi";
import useSubscriptionStatus from "../hooks/useSubscriptionStatus";
import {
  canAccessFeature,
  getSubscriptionDisplayText,
} from "../utils/subscriptionHelper";
import "./FarmerDashboard.css";

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [stats, setStats] = useState({
    matches: 0,
    messages: 0,
    profileComplete: false,
    subscriptionStatus: "inactive",
  });
  const {
    hasActiveSubscription,
    statusType: subscriptionStatusType,
    subscriptionLoading,
  } = useSubscriptionStatus();
  const sagaApi = useSagaApi();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const matchResponse = await sagaApi({
          service: "userApi",
          method: "getMatches",
        });
        // API returns { matches: [...], pagination: {...} }
        // Axios wraps it in { data: {...}, status, ... }
        const matchData = matchResponse?.data || matchResponse;
        const matches = matchData?.matches || [];

        const messageResponse = await sagaApi({
          service: "userApi",
          method: "getConversations",
        });
        const messageData = messageResponse?.data || messageResponse;
        const unreadMessages = (messageData?.conversations || []).filter(
          (conv) => conv.unreadCount > 0,
        ).length;

        const profileResponse = await sagaApi({
          service: "userApi",
          method: "getProfile",
        });
        const profileData = profileResponse?.data || profileResponse;
        const isProfileComplete = Boolean(profileData?.isProfileComplete);

        setStats((prev) => ({
          ...prev,
          matches: Array.isArray(matches) ? matches.length : 0,
          messages: typeof unreadMessages === "number" ? unreadMessages : 0,
          profileComplete: isProfileComplete,
          subscriptionStatus: canAccessFeature(subscriptionStatusType, "core")
            ? "active"
            : "inactive",
        }));
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
        setStats((prev) => ({
          ...prev,
          subscriptionStatus: canAccessFeature(subscriptionStatusType, "core")
            ? "active"
            : "inactive",
        }));
      }
    };

    if (hasActiveSubscription !== undefined) {
      loadStats();
    }
  }, [hasActiveSubscription, sagaApi, subscriptionStatusType]);

  const quickActions = [
    {
      title: "Update Profile",
      icon: <FaLeaf />,
      route: "/profile/farmer",
      color: "var(--color-pry-600)",
    },
    {
      title: "Find Vendors",
      icon: <FaHandshake />,
      route: "/matches",
      color: "var(--color-pry-700)",
    },
    {
      title: "Messages",
      icon: <FaBox />,
      route: "/messages",
      color: "var(--color-sec-600)",
    },
    {
      title: "Subscription",
      icon: <FaChartLine />,
      route: "/subscription",
      color: "var(--color-pry-800)",
    },
  ];

  const canUseDashboard = canAccessFeature(subscriptionStatusType, "core");

  if (subscriptionLoading)
    return <div style={{ padding: "24px" }}>Loading...</div>;

  if (!canUseDashboard) {
    return (
      <div
        style={{
          padding: "clamp(16px, 4vw, 32px)",
          textAlign: "center",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(24px, 4vw, 32px)",
            color: "#193325",
            marginBottom: "16px",
          }}
        >
          Dashboard
        </h1>
        <p
          style={{
            fontSize: "clamp(14px, 2vw, 16px)",
            color: "#666",
            marginBottom: "24px",
          }}
        >
          {subscriptionStatusType === "expired"
            ? "Your subscription has expired. Renew to continue accessing your dashboard features."
            : "You need an active subscription to access the dashboard and view your matches and connections."}
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
    <div className="farmer-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || "Farmer"}!</h1>
        <p className="subtitle">
          Manage your farm connections and grow your network
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "var(--color-pry-100)" }}
          >
            <FaHandshake style={{ color: "var(--color-pry-800)" }} />
          </div>
          <div className="stat-content">
            <h3>{stats.matches}</h3>
            <p>Active Matches</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "var(--color-sec-100)" }}
          >
            <FaBox style={{ color: "var(--color-sec-800)" }} />
          </div>
          <div className="stat-content">
            <h3>{stats.messages}</h3>
            <p>Unread Messages</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "var(--color-pry-100)" }}
          >
            <FaTractor style={{ color: "var(--color-pry-800)" }} />
          </div>
          <div className="stat-content">
            <h3>{stats.profileComplete ? "100%" : "0%"}</h3>
            <p>Profile Complete</p>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: "var(--color-pry-100)" }}
          >
            <FaChartLine style={{ color: "var(--color-pry-800)" }} />
          </div>
          <div className="stat-content">
            <h3>{getSubscriptionDisplayText(subscriptionStatusType)}</h3>
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
              onClick={() => navigate("/profile/farmer")}
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
