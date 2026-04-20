import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TwoFactorSetupModal from "../components/TwoFactorSetupModal";
import useSagaApi from "../hooks/useSagaApi";
import useSubscriptionStatus from "../hooks/useSubscriptionStatus";
import { logoutRequest, setProfile } from "../redux/slices/userSlice";
import { canAccessFeature } from "../utils/subscriptionHelper";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [twoFactorBusy, setTwoFactorBusy] = useState(false);
  const [twoFactorMessage, setTwoFactorMessage] = useState("");
  const [recoveryCodeStatus, setRecoveryCodeStatus] = useState(null);
  const [recoveryCodesBusy, setRecoveryCodesBusy] = useState(false);
  const [emailCodesSending, setEmailCodesSending] = useState(false);
  const [emailCodesError, setEmailCodesError] = useState("");
  const [emailCodesSent, setEmailCodesSent] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const sagaApi = useSagaApi();
  const { statusType: subscriptionStatusType, subscriptionLoading } =
    useSubscriptionStatus();
  const canUseSettings = canAccessFeature(subscriptionStatusType, "profile");

  const handleLogout = () => {
    dispatch(logoutRequest({ reason: "manual" }));
    navigate("/login", { replace: true });
  };

  const handleRequestData = async () => {
    setLoading(true);
    try {
      await sagaApi({ service: "userApi", method: "requestDataExport" });
      alert(
        "Data export request submitted. You will receive an email with your data within 30 days.",
      );
    } catch (err) {
      console.error("Error requesting data:", err);
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Error submitting request. Please try again.";
      alert(errorMsg);
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
      alert(
        "Your account deletion request has been submitted. We will delete your account within 30 days.",
      );
      dispatch(logoutRequest({ reason: "manual", skipApi: true }));
      window.location.href = "/login";
    } catch (err) {
      console.error("Error requesting account deletion:", err);
      alert("Error submitting request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTwoFactor = async () => {
    if (user?.twoFactorEnabled) {
      // Disable 2FA
      setTwoFactorBusy(true);
      setTwoFactorMessage("");
      try {
        await sagaApi({ service: "userApi", method: "disableTwoFactor" });
        dispatch(setProfile({ twoFactorEnabled: false }));
        setTwoFactorMessage("Two-factor authentication disabled");
        setRecoveryCodeStatus(null);
        setShowRecoveryCodes(false);
      } catch (err) {
        setTwoFactorMessage(
          err?.response?.data?.error || "Unable to disable 2FA",
        );
      } finally {
        setTwoFactorBusy(false);
      }
    } else {
      // Enable 2FA - show setup modal
      setShow2FAModal(true);
    }
  };

  const handle2FASetupSuccess = (setupResult) => {
    dispatch(setProfile({ twoFactorEnabled: true }));
    setTwoFactorMessage("Two-factor authentication enabled successfully!");
    setRecoveryCodeStatus({ remaining: 10, total: 10 });
    setShow2FAModal(false);
  };

  const handleFetchRecoveryCodes = async () => {
    setRecoveryCodesBusy(true);
    try {
      const response = await sagaApi({
        service: "userApi",
        method: "getRecoveryCodes",
      });
      setRecoveryCodeStatus(response?.data?.recoveryCodes);
    } catch (_err) {
      console.error("Error fetching recovery codes");
    } finally {
      setRecoveryCodesBusy(false);
    }
  };

  const handleRegenerateRecoveryCodes = async () => {
    if (
      !window.confirm(
        "This will invalidate your current recovery codes. Continue?",
      )
    ) {
      return;
    }

    setRecoveryCodesBusy(true);
    try {
      const response = await sagaApi({
        service: "userApi",
        method: "regenerateRecoveryCodes",
      });
      alert(
        `New recovery codes generated! Save them in a safe place:\n\n${response?.data?.recoveryCodes?.join("\n")}`,
      );
      setRecoveryCodeStatus({ remaining: 10, total: 10 });
    } catch (_err) {
      alert("Error regenerating recovery codes. Please try again.");
    } finally {
      setRecoveryCodesBusy(false);
    }
  };

  const handleSendRecoveryCodesEmail = async () => {
    setEmailCodesSending(true);
    setEmailCodesError("");
    try {
      await sagaApi({
        service: "userApi",
        method: "sendRecoveryCodesEmail",
      });
      setEmailCodesSent(true);
      setTimeout(() => setEmailCodesSent(false), 3000);
    } catch (err) {
      setEmailCodesError(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to send recovery codes email",
      );
    } finally {
      setEmailCodesSending(false);
    }
  };

  const handleDownloadRecoveryCodes = async () => {
    try {
      // Confirm before regenerating and downloading
      if (
        !window.confirm(
          "Downloading recovery codes will regenerate new ones. Your old codes will no longer work. Continue?",
        )
      ) {
        return;
      }

      // Regenerate codes to get plain text versions (hashed codes can't be viewed after storage)
      const response = await sagaApi({
        service: "userApi",
        method: "regenerateRecoveryCodes",
      });

      const recCodes = response?.recoveryCodes || response?.data?.recoveryCodes;
      if (!recCodes || !Array.isArray(recCodes) || recCodes.length === 0) {
        alert("Failed to generate recovery codes. Please try again.");
        return;
      }

      const text = recCodes.join("\n");
      const element = document.createElement("a");
      const file = new Blob([text], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `farmconnect-recovery-codes-${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(element);
      element.click();
      setTimeout(() => {
        document.body.removeChild(element);
        URL.revokeObjectURL(element.href);
      }, 100);

      alert("Recovery codes downloaded successfully. Keep them safe!");
    } catch (err) {
      console.error("Error downloading recovery codes:", err);
      alert("Error downloading recovery codes. Please try again.");
    }
  };

  if (subscriptionLoading) {
    return <div style={{ padding: "24px" }}>Loading...</div>;
  }

  if (!canUseSettings) {
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
          Settings
        </h1>
        <p
          style={{
            fontSize: "clamp(14px, 2vw, 16px)",
            color: "#666",
            marginBottom: "24px",
          }}
        >
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
    <div
      style={{
        padding: "clamp(16px, 4vw, 32px)",
        maxWidth: "800px",
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
        Settings
      </h1>
      <p
        style={{
          color: "#666",
          marginBottom: "32px",
          fontSize: "clamp(14px, 2vw, 16px)",
        }}
      >
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
        <h2
          style={{
            fontSize: "clamp(16px, 2.5vw, 18px)",
            color: "#193325",
            marginBottom: "12px",
          }}
        >
          Account Information
        </h2>
        <p style={{ color: "#666", marginBottom: "8px" }}>
          <strong>Email:</strong> {user?.email || "Not available"}
        </p>
        <p style={{ color: "#666", marginBottom: "16px" }}>
          <strong>Account Type:</strong>{" "}
          {user?.profileType === "vendor" ? "Vendor" : "Farmer"}
        </p>
        <button
          onClick={() =>
            navigate("/profile/" + (user?.profileType || "farmer"))
          }
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

      {/* Notification Preferences Section */}
      <div
        style={{
          marginBottom: "24px",
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "10px",
          padding: "clamp(16px, 3vw, 24px)",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(16px, 2.5vw, 18px)",
            color: "#193325",
            marginBottom: "12px",
          }}
        >
          Notifications
        </h2>
        <p style={{ color: "#666", marginBottom: "16px" }}>
          <strong>Manage how and when you receive notifications</strong>
        </p>
        <p
          style={{
            color: "#666",
            marginBottom: "16px",
            fontSize: "clamp(13px, 1.5vw, 14px)",
          }}
        >
          Control notification channels (email, SMS, push), notification types,
          and quiet hours.
        </p>
        <button
          onClick={() => navigate("/settings/notifications")}
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
          Manage Notification Preferences
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
        <h2
          style={{
            fontSize: "clamp(16px, 2.5vw, 18px)",
            color: "#193325",
            marginBottom: "12px",
          }}
        >
          Data & Privacy
        </h2>
        <p
          style={{
            color: "#666",
            marginBottom: "16px",
            fontSize: "clamp(13px, 1.5vw, 14px)",
          }}
        >
          Download a copy of your data or request account deletion. Requests are
          processed within 30 days.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
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
            onMouseEnter={(e) =>
              !loading && (e.target.style.background = "#1565c0")
            }
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
          <div
            style={{
              background: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: "6px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <p
              style={{
                color: "#856404",
                marginBottom: "12px",
                fontWeight: "600",
              }}
            >
              Warning: This action cannot be undone
            </p>
            <p
              style={{
                color: "#856404",
                marginBottom: "12px",
                fontSize: "clamp(13px, 1.5vw, 14px)",
              }}
            >
              Your account and all associated data will be permanently deleted.
              This process cannot be reversed.
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
                cursor:
                  deleteConfirmText === "DELETE" && !loading
                    ? "pointer"
                    : "not-allowed",
                transition: "background 0.3s ease",
              }}
              onMouseEnter={(e) =>
                deleteConfirmText === "DELETE" &&
                (e.target.style.background = "#b71c1c")
              }
              onMouseLeave={(e) =>
                (e.target.style.background =
                  deleteConfirmText === "DELETE" ? "#d32f2f" : "#ccc")
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
        <h2
          style={{
            fontSize: "clamp(16px, 2.5vw, 18px)",
            color: "#193325",
            marginBottom: "12px",
          }}
        >
          Security
        </h2>
        <p
          style={{
            color: "#666",
            marginBottom: "16px",
            fontSize: "clamp(13px, 1.5vw, 14px)",
          }}
        >
          Protect your account with two-factor authentication via email code.
        </p>
        <p
          style={{
            color: "#666",
            marginBottom: "12px",
            fontSize: "clamp(13px, 1.5vw, 14px)",
          }}
        >
          <strong>2FA Status:</strong>{" "}
          {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
        </p>
        <button
          onClick={handleToggleTwoFactor}
          disabled={twoFactorBusy}
          style={{
            background: user?.twoFactorEnabled ? "#b42318" : "#2d8659",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "10px 16px",
            fontSize: "clamp(13px, 1.5vw, 14px)",
            cursor: twoFactorBusy ? "not-allowed" : "pointer",
            transition: "background 0.3s ease",
            opacity: twoFactorBusy ? 0.75 : 1,
            marginBottom: "10px",
          }}
        >
          {twoFactorBusy
            ? "Updating..."
            : user?.twoFactorEnabled
              ? "Disable Two-Factor Authentication"
              : "Enable Two-Factor Authentication"}
        </button>
        {twoFactorMessage && (
          <p
            style={{
              color: "#666",
              marginBottom: "4px",
              fontSize: "clamp(13px, 1.5vw, 14px)",
            }}
          >
            {twoFactorMessage}
          </p>
        )}

        {user?.twoFactorEnabled && (
          <div
            style={{
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <h3
              style={{
                fontSize: "clamp(14px, 2vw, 16px)",
                marginBottom: "8px",
              }}
            >
              Recovery Codes
            </h3>
            <p
              style={{
                color: "#666",
                fontSize: "clamp(12px, 1.5vw, 13px)",
                marginBottom: "8px",
              }}
            >
              {recoveryCodeStatus
                ? `${recoveryCodeStatus.remaining} of ${recoveryCodeStatus.total} codes remaining`
                : "Load recovery codes to see status"}
            </p>
            <button
              onClick={handleFetchRecoveryCodes}
              disabled={recoveryCodesBusy}
              style={{
                background: "#0066cc",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 12px",
                fontSize: "clamp(12px, 1.5vw, 13px)",
                cursor: recoveryCodesBusy ? "not-allowed" : "pointer",
                marginRight: "8px",
                opacity: recoveryCodesBusy ? 0.75 : 1,
              }}
            >
              {recoveryCodesBusy ? "Loading..." : "View Status"}
            </button>
            <button
              onClick={handleRegenerateRecoveryCodes}
              disabled={recoveryCodesBusy}
              style={{
                background: "#ff9800",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 12px",
                fontSize: "clamp(12px, 1.5vw, 13px)",
                cursor: recoveryCodesBusy ? "not-allowed" : "pointer",
                marginRight: "8px",
                opacity: recoveryCodesBusy ? 0.75 : 1,
              }}
            >
              {recoveryCodesBusy ? "Generating..." : "Generate New Codes"}
            </button>
            <button
              onClick={handleDownloadRecoveryCodes}
              disabled={recoveryCodesBusy}
              style={{
                background: "#4caf50",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 12px",
                fontSize: "clamp(12px, 1.5vw, 13px)",
                cursor: recoveryCodesBusy ? "not-allowed" : "pointer",
                marginRight: "8px",
                opacity: recoveryCodesBusy ? 0.75 : 1,
                minWidth: "100px",
                whiteSpace: "nowrap",
              }}
            >
              Download
            </button>
            <button
              onClick={handleSendRecoveryCodesEmail}
              disabled={recoveryCodesBusy || emailCodesSending}
              style={{
                background: emailCodesSent ? "#2196f3" : "#9c27b0",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 12px",
                fontSize: "clamp(12px, 1.5vw, 13px)",
                cursor:
                  recoveryCodesBusy || emailCodesSending
                    ? "not-allowed"
                    : "pointer",
                opacity: recoveryCodesBusy || emailCodesSending ? 0.75 : 1,
                minWidth: "100px",
                whiteSpace: "nowrap",
              }}
            >
              {emailCodesSending
                ? "Sending..."
                : emailCodesSent
                  ? "Sent"
                  : "Email"}
            </button>
            {emailCodesError && (
              <p
                style={{
                  color: "#d32f2f",
                  fontSize: "clamp(12px, 1.5vw, 13px)",
                  marginTop: "8px",
                }}
              >
                {emailCodesError}
              </p>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "10px",
          padding: "clamp(16px, 3vw, 24px)",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(16px, 2.5vw, 18px)",
            color: "#193325",
            marginBottom: "12px",
          }}
        >
          Session
        </h2>
        <p
          style={{
            color: "#666",
            marginBottom: "16px",
            fontSize: "clamp(13px, 1.5vw, 14px)",
          }}
        >
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

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <TwoFactorSetupModal
          onClose={() => setShow2FAModal(false)}
          onSuccess={handle2FASetupSuccess}
          user={user}
          sagaApi={sagaApi}
        />
      )}
    </div>
  );
};

export default SettingsPage;
