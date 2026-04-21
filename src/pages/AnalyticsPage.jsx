import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSagaApi from "../hooks/useSagaApi";
import useSubscriptionStatus from "../hooks/useSubscriptionStatus";
import { canAccessFeature } from "../utils/subscriptionHelper";

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    connected: 0,
    interested: 0,
    listedProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const sagaApi = useSagaApi();
  const { statusType: subscriptionStatusType, subscriptionLoading } =
    useSubscriptionStatus();

  useEffect(() => {
    const load = async () => {
      try {
        const totalResponse = await sagaApi({
          service: "userApi",
          method: "getMatches",
          args: [{ limit: 500 }],
        });
        const connectedResponse = await sagaApi({
          service: "userApi",
          method: "getMatches",
          args: [{ status: "connected", limit: 500 }],
        });
        const interestedResponse = await sagaApi({
          service: "userApi",
          method: "getMatches",
          args: [{ status: "interested", limit: 500 }],
        });
        const conversationsResponse = await sagaApi({
          service: "userApi",
          method: "getConversations",
          args: [{ limit: 500 }],
        });
        const listingResponse = await sagaApi({
          service: "userApi",
          method: "getMyListing",
        });

        const totalData = totalResponse?.data || totalResponse;
        const connectedData = connectedResponse?.data || connectedResponse;
        const interestedData = interestedResponse?.data || interestedResponse;
        const conversationData =
          conversationsResponse?.data || conversationsResponse;
        const listingData = listingResponse?.data || listingResponse;

        const totalMatches = Array.isArray(totalData?.matches)
          ? totalData.matches
          : [];
        const connectedMatches = Array.isArray(connectedData?.matches)
          ? connectedData.matches
          : [];
        const interestedMatches = Array.isArray(interestedData?.matches)
          ? interestedData.matches
          : [];
        const conversations = Array.isArray(conversationData?.conversations)
          ? conversationData.conversations
          : [];
        const connectedByMessages = conversations.filter(
          (c) =>
            c?.lastMessage && ["interested", "connected"].includes(c?.status),
        ).length;
        const listedProducts = Array.isArray(listingData?.listing?.products)
          ? listingData.listing.products.length
          : 0;

        setStats({
          total: totalMatches.length,
          connected: Math.max(connectedMatches.length, connectedByMessages),
          interested: interestedMatches.length,
          listedProducts,
        });
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (subscriptionStatusType) {
      load();
    }
  }, [sagaApi, subscriptionStatusType]);

  // Reload analytics when subscription status changes
  useEffect(() => {
    if (!subscriptionStatusType || subscriptionLoading) return;

    const reloadInterval = setInterval(async () => {
      try {
        const totalResponse = await sagaApi({
          service: "userApi",
          method: "getMatches",
          args: [{ limit: 500 }],
        });
        const connectedResponse = await sagaApi({
          service: "userApi",
          method: "getMatches",
          args: [{ status: "connected", limit: 500 }],
        });
        const interestedResponse = await sagaApi({
          service: "userApi",
          method: "getMatches",
          args: [{ status: "interested", limit: 500 }],
        });
        const conversationsResponse = await sagaApi({
          service: "userApi",
          method: "getConversations",
          args: [{ limit: 500 }],
        });
        const listingResponse = await sagaApi({
          service: "userApi",
          method: "getMyListing",
        });

        const totalData = totalResponse?.data || totalResponse;
        const connectedData = connectedResponse?.data || connectedResponse;
        const interestedData = interestedResponse?.data || interestedResponse;
        const conversationData =
          conversationsResponse?.data || conversationsResponse;
        const listingData = listingResponse?.data || listingResponse;

        const totalMatches = Array.isArray(totalData?.matches)
          ? totalData.matches
          : [];
        const connectedMatches = Array.isArray(connectedData?.matches)
          ? connectedData.matches
          : [];
        const interestedMatches = Array.isArray(interestedData?.matches)
          ? interestedData.matches
          : [];
        const conversations = Array.isArray(conversationData?.conversations)
          ? conversationData.conversations
          : [];
        const connectedByMessages = conversations.filter(
          (c) =>
            c?.lastMessage && ["interested", "connected"].includes(c?.status),
        ).length;
        const listedProducts = Array.isArray(listingData?.listing?.products)
          ? listingData.listing.products.length
          : 0;

        setStats({
          total: totalMatches.length,
          connected: Math.max(connectedMatches.length, connectedByMessages),
          interested: interestedMatches.length,
          listedProducts,
        });
      } catch (err) {
        console.error("Failed to reload analytics:", err);
      }
    }, 5000); // Reload every 5 seconds

    return () => clearInterval(reloadInterval);
  }, [subscriptionStatusType, subscriptionLoading, sagaApi]);
  const canViewAnalytics = canAccessFeature(subscriptionStatusType, "core");

  if (!canViewAnalytics && !loading && !subscriptionLoading) {
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
          Analytics
        </h1>
        <p
          style={{
            fontSize: "clamp(14px, 2vw, 16px)",
            color: "#666",
            marginBottom: "24px",
          }}
        >
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
    <div
      style={{
        padding: "clamp(16px, 4vw, 32px)",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", color: "#193325" }}>
        Analytics
      </h1>
      <p style={{ color: "#666", fontSize: "clamp(14px, 2vw, 16px)" }}>
        Quick performance snapshot from your current matches.
      </p>

      {loading || subscriptionLoading ? (
        <p>Loading analytics...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "clamp(12px, 2vw, 24px)",
            marginTop: "16px",
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "10px",
              padding: "clamp(14px, 2vw, 24px)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#666",
                fontSize: "clamp(13px, 1.5vw, 14px)",
              }}
            >
              Total Matches
            </p>
            <h2
              style={{ margin: "6px 0 0", fontSize: "clamp(28px, 5vw, 36px)" }}
            >
              {stats.total}
            </h2>
          </div>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "10px",
              padding: "clamp(14px, 2vw, 24px)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#666",
                fontSize: "clamp(13px, 1.5vw, 14px)",
              }}
            >
              Interested
            </p>
            <h2
              style={{ margin: "6px 0 0", fontSize: "clamp(28px, 5vw, 36px)" }}
            >
              {stats.interested}
            </h2>
          </div>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "10px",
              padding: "clamp(14px, 2vw, 24px)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#666",
                fontSize: "clamp(13px, 1.5vw, 14px)",
              }}
            >
              Connected
            </p>
            <h2
              style={{ margin: "6px 0 0", fontSize: "clamp(28px, 5vw, 36px)" }}
            >
              {stats.connected}
            </h2>
          </div>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "10px",
              padding: "clamp(14px, 2vw, 24px)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#666",
                fontSize: "clamp(13px, 1.5vw, 14px)",
              }}
            >
              Products Listed
            </p>
            <h2
              style={{ margin: "6px 0 0", fontSize: "clamp(28px, 5vw, 36px)" }}
            >
              {stats.listedProducts}
            </h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
