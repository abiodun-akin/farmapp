import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutRequest } from "../redux/slices/userSlice";
import useSubscriptionStatus from "../hooks/useSubscriptionStatus";
import { canAccessFeature } from "../utils/subscriptionHelper";
import useSagaApi from "../hooks/useSagaApi";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const sagaApi = useSagaApi();
  const { statusType: subscriptionStatusType, subscriptionLoading } = useSubscriptionStatus();
  const canUseSettings = canAccessFeature(subscriptionStatusType, "profile");

  const handleLogout = () => {
    dispatch(logoutRequest({ reason: "manual" }));
    navigate("/login", { replace: true });
  };

  const handleRequestData = async () => {
    setLoading(true);
    try {
      await sagaApi({ service: "userApi", method: "requestDataExport" });
      alert("Data export request submitted. You will receive an email with your data within 30 days.");
    } catch (err) {
      console.error("Error requesting data:", err);
      alert("Error submitting request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccountDelete = async () => {
    if (deleteConfirmText !== "DELETE") {
      alert('Please type "DELETE" to confirm');
      return;
    }

    setLoading(true);
    try {
      await sagaApi({
        service: "userApi",
        method: "requestAccountDelete",
        args: ["User requested account deletion"],
      });
      alert("Your account deletion request has been submitted. We will delete your account within 30 days.");
      dispatch(logoutRequest({ reason: "manual", skipApi: true }));
      window.location.href = "/login";
    } catch (err) {
      console.error("Error requesting account deletion:", err);
      alert("Error submitting request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (subscriptionLoading) {
    return <div style={{ padding: "24px" }}>Loading...</div>;
  }

  if (!canUseSettings) {
    return (
      <div style={{ padding: "clamp(16px, 4vw, 32px)", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", color: "#193325", marginBottom: "16px" }}>
          Settings
        </h1>
        <p style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "#666", marginBottom: "24px" }}>
          You need an active subscription before accessing settings.
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
    <div style={{ padding: "clamp(16px, 4vw, 32px)", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", color: "#193325", marginBottom: "8px" }}>
        Settings
      </h1>
      <p style={{ color: "#666", marginBottom: "32px", fontSize: "clamp(14px, 2vw, 16px)" }}>
        Manage your account, privacy, and data preferences.
      </p>

      {/* Account Information Section */}
      <div
        style={{
          marginBottom: "24px",
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "10px",
          padding: "clamp(16px, 3vw, 24px)",
        }}
      >
        <h2 style={{ fontSize: "clamp(16px, 2.5vw, 18px)", color: "#193325", marginBottom: "12px" }}>
          Account Information
        </h2>
        <p style={{ color: "#666", marginBottom: "8px" }}>
          <strong>Email:</strong> {user?.email || "Not available"}
        </p>
        <p style={{ color: "#666", marginBottom: "16px" }}>
          <strong>Account Type:</strong> {user?.profileType === "vendor" ? "Vendor" : "Farmer"}
        </p>
        <button
          onClick={() => navigate("/profile/" + (user?.profileType || "farmer"))}
          style={{
            background: "#2d8659",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "10px 16px",
            fontSize: "clamp(13px, 1.5vw, 14px)",
            cursor: "pointer",
            transition: "background 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#1f5f3d")}
          onMouseLeave={(e) => (e.target.style.background = "#2d8659")}
        >
          Edit Profile
        </button>
      </div>

      {/* Privacy and Data Section */}
      <div
        style={{
          marginBottom: "24px",
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "10px",
          padding: "clamp(16px, 3vw, 24px)",
        }}
      >
        <h2 style={{ fontSize: "clamp(16px, 2.5vw, 18px)", color: "#193325", marginBottom: "12px" }}>
          Data & Privacy
        </h2>
        <p style={{ color: "#666", marginBottom: "16px", fontSize: "clamp(13px, 1.5vw, 14px)" }}>
          Download a copy of your data or request account deletion. Requests are processed within 30 days.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
          <button
            onClick={handleRequestData}
            disabled={loading}
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "10px 16px",
              fontSize: "clamp(13px, 1.5vw, 14px)",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.3s ease",
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = "#1565c0")}
            onMouseLeave={(e) => (e.target.style.background = "#1976d2")}
          >
            {loading ? "Processing..." : "Request Data Export"}
          </button>

          <button
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            style={{
              background: "#ff9800",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "10px 16px",
              fontSize: "clamp(13px, 1.5vw, 14px)",
              cursor: "pointer",
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#f57c00")}
            onMouseLeave={(e) => (e.target.style.background = "#ff9800")}
          >
            {showDeleteConfirm ? "Cancel" : "Request Account Deletion"}
          </button>
        </div>

        {showDeleteConfirm && (
          <div style={{ 
            background: "#fff3cd", 
            border: "1px solid #ffc107", 
            borderRadius: "6px", 
            padding: "16px",
            marginBottom: "16px"
          }}>
            <p style={{ color: "#856404", marginBottom: "12px", fontWeight: "600" }}>
              ⚠️ This action cannot be undone
            </p>
            <p style={{ color: "#856404", marginBottom: "12px", fontSize: "clamp(13px, 1.5vw, 14px)" }}>
              Your account and all associated data will be permanently deleted. This process cannot be reversed.
            </p>
            <input
              type="text"
              placeholder='Type "DELETE" to confirm'
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                marginBottom: "12px",
                border: "1px solid #ffc107",
                borderRadius: "4px",
                fontSize: "clamp(13px, 1.5vw, 14px)",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={handleRequestAccountDelete}
              disabled={deleteConfirmText !== "DELETE" || loading}
              style={{
                background: deleteConfirmText === "DELETE" ? "#d32f2f" : "#ccc",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "10px 16px",
                fontSize: "clamp(13px, 1.5vw, 14px)",
                cursor: deleteConfirmText === "DELETE" && !loading ? "pointer" : "not-allowed",
                transition: "background 0.3s ease",
              }}
              onMouseEnter={(e) => 
                deleteConfirmText === "DELETE" && (e.target.style.background = "#b71c1c")
              }
              onMouseLeave={(e) => 
                (e.target.style.background = deleteConfirmText === "DELETE" ? "#d32f2f" : "#ccc")
              }
            >
              {loading ? "Processing..." : "Permanently Delete My Account"}
            </button>
          </div>
        )}
      </div>

      {/* Session Management Section */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "10px",
          padding: "clamp(16px, 3vw, 24px)",
        }}
      >
        <h2 style={{ fontSize: "clamp(16px, 2.5vw, 18px)", color: "#193325", marginBottom: "12px" }}>
          Session
        </h2>
        <p style={{ color: "#666", marginBottom: "16px", fontSize: "clamp(13px, 1.5vw, 14px)" }}>
          End your current session and log out of FarmConnect.
        </p>
        <button
          onClick={handleLogout}
          style={{
            background: "#b42318",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "10px 16px",
            fontSize: "clamp(13px, 1.5vw, 14px)",
            cursor: "pointer",
            transition: "background 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#8b1911")}
          onMouseLeave={(e) => (e.target.style.background = "#b42318")}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
