import React from "react";
import { useNavigate } from "react-router-dom";
import useSubscriptionStatus from "../hooks/useSubscriptionStatus";

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const {
    subscription,
    hasActiveSubscription,
    subscriptionLoading,
    subscriptionError,
  } = useSubscriptionStatus();

  const isSubscriptionActive = hasActiveSubscription && subscription?.endDate && new Date(subscription.endDate) > new Date();

  return (
    <div style={{ padding: "clamp(16px, 4vw, 32px)", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", color: "#193325", marginBottom: "8px" }}>
        Subscription
      </h1>
      {!isSubscriptionActive && !loading && !error && (
        <p style={{ color: "#666", fontSize: "clamp(14px, 2vw, 16px)", marginBottom: "20px" }}>
          Activate a subscription to unlock features like viewing matches, messaging, and analytics.
        </p>
      )}
      {isSubscriptionActive && (
        <p style={{ color: "#666", fontSize: "clamp(14px, 2vw, 16px)", marginBottom: "20px" }}>
          You can make a fresh payment at any time. A new successful payment updates your subscription period.
        </p>
      )}

      {subscriptionLoading && <p>Loading subscription...</p>}
      {!subscriptionLoading && subscriptionError && <p style={{ color: "#c62828" }}>{subscriptionError}</p>}

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
              <p><strong>Plan:</strong> {subscription.plan}</p>
              <p><strong>Status:</strong> {subscription.status}</p>
              <p><strong>End Date:</strong> {new Date(subscription.endDate).toLocaleDateString()}</p>
              <p><strong>Days Remaining:</strong> {subscription.daysRemaining}</p>
              <p>
                <strong>Extra Payment Available:</strong>{" "}
                {subscription.canMakeExtraPayment ? "Yes" : "No (already used)"}
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: "clamp(14px, 2vw, 16px)", marginBottom: "16px", color: "#555" }}>
                You don't have an active subscription. Upgrade now to access all features.
              </p>
            </>
          )}

          <button
            onClick={() => navigate("/pricing")}
            disabled={subscription && !subscription.canMakeExtraPayment}
            style={{
              marginTop: "16px",
              background:
                subscription && !subscription.canMakeExtraPayment ? "#9e9e9e" : "#2d8659",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "clamp(10px, 2vw, 14px) clamp(16px, 3vw, 24px)",
              cursor: subscription && !subscription.canMakeExtraPayment ? "not-allowed" : "pointer",
              fontSize: "clamp(14px, 2vw, 16px)",
              fontWeight: 600,
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (!(subscription && !subscription.canMakeExtraPayment)) {
                e.target.style.background = "#1f5f3d";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background =
                subscription && !subscription.canMakeExtraPayment ? "#9e9e9e" : "#2d8659";
            }}
          >
            {!isSubscriptionActive
              ? "Subscribe Now"
              : subscription && !subscription.canMakeExtraPayment
              ? "Extra Payment Used"
              : "Make Fresh Payment"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
