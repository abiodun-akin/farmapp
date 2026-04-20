import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSubscriptionStatus from "../hooks/useSubscriptionStatus";

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const {
    subscription,
    hasActiveSubscription,
    subscriptionLoading,
    subscriptionError,
    refreshSubscription,
  } = useSubscriptionStatus();
  const [localRefresh, setLocalRefresh] = useState(false);

  // Calculate days remaining accurately
  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const now = new Date();
    const end = new Date(endDate);
    const daysMs = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(daysMs / (1000 * 60 * 60 * 24)));
  };

  const isSubscriptionActive =
    hasActiveSubscription &&
    subscription?.endDate &&
    new Date(subscription.endDate) > new Date();
  const daysRemaining = isSubscriptionActive
    ? calculateDaysRemaining(subscription?.endDate)
    : 0;

  useEffect(() => {
    // Auto-refresh after payment redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get("refreshed") === "true") {
      setLocalRefresh(true);
      refreshSubscription();
    }
  }, [refreshSubscription]);

  return (
    <div
      style={{
        padding: "clamp(16px, 4vw, 32px)",
        maxWidth: "700px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(24px, 4vw, 32px)",
          color: "#193325",
          marginBottom: "8px",
        }}
      >
        Subscription
      </h1>
      {!isSubscriptionActive && !subscriptionLoading && !subscriptionError && (
        <p
          style={{
            color: "#666",
            fontSize: "clamp(14px, 2vw, 16px)",
            marginBottom: "20px",
          }}
        >
          Activate a subscription to unlock features like viewing matches,
          messaging, and analytics.
        </p>
      )}
      {isSubscriptionActive && (
        <p
          style={{
            color: "#666",
            fontSize: "clamp(14px, 2vw, 16px)",
            marginBottom: "20px",
          }}
        >
          Your subscription is active. You can renew anytime before it expires
          to maintain uninterrupted access.
        </p>
      )}

      {subscriptionLoading && <p>Loading subscription...</p>}
      {!subscriptionLoading && subscriptionError && (
        <p style={{ color: "#c62828" }}>{subscriptionError}</p>
      )}

      {!subscriptionLoading && !subscriptionError && (
        <div
          style={{
            marginTop: "16px",
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: "10px",
            padding: "clamp(16px, 3vw, 24px)",
          }}
        >
          {subscription && isSubscriptionActive ? (
            <>
              <div style={{ marginBottom: "16px" }}>
                <p style={{ marginBottom: "8px" }}>
                  <strong>Plan:</strong> {subscription.plan || "Standard"}
                </p>
                <p style={{ marginBottom: "8px" }}>
                  <strong>Status:</strong>{" "}
                  <span style={{ color: "#2d8659", fontWeight: 600 }}>
                    Active
                  </span>
                </p>
                <p style={{ marginBottom: "8px" }}>
                  <strong>End Date:</strong>{" "}
                  {new Date(subscription.endDate).toLocaleDateString()}
                </p>
                <p
                  style={{
                    marginBottom: "8px",
                    color: "#1976d2",
                    fontWeight: 600,
                  }}
                >
                  <strong>Days Remaining:</strong> {daysRemaining} days
                </p>
                <p style={{ marginBottom: "0" }}>
                  <strong>Extra Payment Available:</strong>{" "}
                  {subscription.canMakeExtraPayment
                    ? "Yes"
                    : "No (already used)"}
                </p>
              </div>

              <button
                onClick={() => navigate("/pricing")}
                disabled={subscription && !subscription.canMakeExtraPayment}
                style={{
                  marginTop: "16px",
                  background:
                    subscription && !subscription.canMakeExtraPayment
                      ? "#9e9e9e"
                      : "#2d8659",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "clamp(10px, 2vw, 14px) clamp(16px, 3vw, 24px)",
                  cursor:
                    subscription && !subscription.canMakeExtraPayment
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "clamp(14px, 2vw, 16px)",
                  fontWeight: 600,
                  transition: "background 0.3s ease",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                onMouseEnter={(e) => {
                  if (!(subscription && !subscription.canMakeExtraPayment)) {
                    e.target.style.background = "#1f5f3d";
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background =
                    subscription && !subscription.canMakeExtraPayment
                      ? "#9e9e9e"
                      : "#2d8659";
                }}
              >
                {subscription && !subscription.canMakeExtraPayment
                  ? "Extra Payment Used"
                  : "Renew Subscription"}
              </button>
            </>
          ) : (
            <>
              <p
                style={{
                  fontSize: "clamp(14px, 2vw, 16px)",
                  marginBottom: "16px",
                  color: "#555",
                }}
              >
                You don't have an active subscription. Upgrade now to access all
                features.
              </p>
              <button
                onClick={() => navigate("/pricing")}
                style={{
                  background: "#2d8659",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "clamp(10px, 2vw, 14px) clamp(16px, 3vw, 24px)",
                  cursor: "pointer",
                  fontSize: "clamp(14px, 2vw, 16px)",
                  fontWeight: 600,
                  transition: "background 0.3s ease",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#1f5f3d")}
                onMouseLeave={(e) => (e.target.style.background = "#2d8659")}
              >
                Subscribe Now
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
