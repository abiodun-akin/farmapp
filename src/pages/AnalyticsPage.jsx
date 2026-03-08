import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../api/userApi";
import useSubscriptionStatus from "../hooks/useSubscriptionStatus";
import { canAccessFeature } from "../utils/subscriptionHelper";

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, connected: 0, interested: 0 });
  const [loading, setLoading] = useState(true);
  const { statusType: subscriptionStatusType, subscriptionLoading } = useSubscriptionStatus();

  useEffect(() => {
    const load = async () => {
      try {
        const matchResponse = await userApi.getMatches();

        const matches = matchResponse.data?.matches || [];
        setStats({
          total: matches.length,
          connected: matches.filter((item) => item.status === "connected").length,
          interested: matches.filter((item) => item.status === "interested").length,
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);
  const canViewAnalytics = canAccessFeature(subscriptionStatusType, "core");

  if (!canViewAnalytics && !loading && !subscriptionLoading) {
    return (
      <div style={{ padding: "clamp(16px, 4vw, 32px)", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", color: "#193325", marginBottom: "16px" }}>
          Analytics
        </h1>
        <p style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "#666", marginBottom: "24px" }}>
          {subscriptionStatusType === "expired"
            ? "Your subscription has expired. Renew to continue viewing analytics and reports."
            : "You need an active subscription to view analytics and reports."}
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
    <div style={{ padding: "24px" }}>
      <h1>Analytics</h1>
      <p style={{ color: "#666" }}>Quick performance snapshot from your current matches.</p>

      {loading || subscriptionLoading ? (
        <p>Loading analytics...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(180px, 1fr))", gap: "12px", marginTop: "16px" }}>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "10px", padding: "14px" }}>
            <p style={{ margin: 0, color: "#666" }}>Total Matches</p>
            <h2 style={{ margin: "6px 0 0" }}>{stats.total}</h2>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "10px", padding: "14px" }}>
            <p style={{ margin: 0, color: "#666" }}>Interested</p>
            <h2 style={{ margin: "6px 0 0" }}>{stats.interested}</h2>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "10px", padding: "14px" }}>
            <p style={{ margin: 0, color: "#666" }}>Connected</p>
            <h2 style={{ margin: "6px 0 0" }}>{stats.connected}</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
