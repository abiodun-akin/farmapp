import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { userApi } from "../api/userApi";
import useSubscriptionStatus from "../hooks/useSubscriptionStatus";
import { canAccessFeature } from "../utils/subscriptionHelper";

const MatchesPage = ({ title = "Matches" }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { statusType: subscriptionStatusType, subscriptionLoading } = useSubscriptionStatus();

  useEffect(() => {
    const loadData = async () => {
      try {
        const matchResponse = await userApi.getMatches();
        setMatches(matchResponse.data?.matches || []);
      } catch (err) {
        setError(err.response?.data?.error || "Unable to load matches");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  const canViewMatches = canAccessFeature(subscriptionStatusType, "core");

  if (loading || subscriptionLoading) return <div style={{ padding: "24px" }}>Loading...</div>;

  if (!canViewMatches) {
    return (
      <div style={{ padding: "clamp(16px, 4vw, 32px)", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", color: "#193325", marginBottom: "16px" }}>
          {title}
        </h1>
        <p style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "#666", marginBottom: "24px" }}>
          {subscriptionStatusType === "expired"
            ? "Your subscription has expired. Renew to continue accessing matches."
            : `You need an active subscription to view and connect with ${user?.profileType === "vendor" ? "farmers" : "vendors"}.`}
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
      <h1>{title}</h1>
      <p style={{ color: "#666" }}>
        {user?.profileType === "vendor"
          ? "View and connect with farmers who match your services."
          : "View and connect with vendors that match your needs."}
      </p>

      {error && <p style={{ color: "#c62828" }}>{error}</p>}

      {matches.length === 0 && (
        <p>No matches available yet. Complete your profile and check again.</p>
      )}

      {matches.length > 0 && (
        <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
          {matches.map((match) => (
            <div
              key={match._id}
              style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>
                Score: {match.matchScore ?? 0}% • Status: {match.status}
              </p>
              <p style={{ margin: "8px 0", color: "#555" }}>
                {match.userProfile?.bio || "No bio available"}
              </p>
              <button
                onClick={() => navigate("/messages", { state: { matchId: match._id } })}
                style={{
                  background: "#2d8659",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                Open Messages
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchesPage;
