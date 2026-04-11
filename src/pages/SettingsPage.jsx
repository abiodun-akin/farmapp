import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TwoFactorSetupModal from "../components/TwoFactorSetupModal";
import useSagaApi from "../hooks/useSagaApi";
import useSubscriptionStatus from "../hooks/useSubscriptionStatus";
import { logoutRequest, setProfile } from "../redux/slices/userSlice";
import { canAccessFeature } from "../utils/subscriptionHelper";

const defaultNotificationPreferences = {
  channels: {
    email: true,
    sms: false,
    inApp: true,
  },
  offline: {
    subscribed: false,
    phoneNumber: "",
    gatewayDomain: "",
    fallbackToEmail: true,
  },
  eventTypes: {
    security: true,
    billing: true,
    matches: true,
    messages: false,
    system: true,
  },
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "06:00",
    timezone: "Africa/Lagos",
  },
  digestMode: "instant",
};

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
  const [notificationPreferences, setNotificationPreferences] = useState(
    defaultNotificationPreferences,
  );
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsSaving, setNotificationsSaving] = useState(false);
  const [notificationsMessage, setNotificationsMessage] = useState("");
  const [notificationsError, setNotificationsError] = useState("");
  const sagaApi = useSagaApi();
  const { statusType: subscriptionStatusType, subscriptionLoading } =
    useSubscriptionStatus();
  const canUseSettings = canAccessFeature(subscriptionStatusType, "profile");

  useEffect(() => {
    const loadNotificationPreferences = async () => {
      setNotificationsLoading(true);
      setNotificationsError("");
      try {
        const response = await sagaApi({
          service: "userApi",
          method: "getNotificationPreferences",
        });
        if (response?.data?.notificationPreferences) {
          setNotificationPreferences(response.data.notificationPreferences);
        }
      } catch (_err) {
        setNotificationsError(
          "Unable to load notification preferences. You can still update and save manually.",
        );
      } finally {
        setNotificationsLoading(false);
      }
    };

    loadNotificationPreferences();
  }, [sagaApi]);

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
      const response = await sagaApi({
        service: "userApi",
        method: "getRecoveryCodes",
      });
      const codes = response?.data?.recoveryCodes?.remaining || [];
      if (!codes || codes.length === 0) {
        alert("No recovery codes available to download");
        return;
      }

      const text = codes.join("\n");
      const element = document.createElement("a");
      const file = new Blob([text], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `farmconnect-recovery-codes-${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (_err) {
      alert("Error downloading recovery codes. Please try again.");
    }
  };

  const updatePreference = (path, value) => {
    setNotificationPreferences((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      let cursor = next;
      for (let i = 0; i < path.length - 1; i++) {
        cursor[path[i]] = cursor[path[i]] || {};
        cursor = cursor[path[i]];
      }
      cursor[path[path.length - 1]] = value;
      return next;
    });
  };

  const handleSaveNotificationPreferences = async () => {
    setNotificationsSaving(true);
    setNotificationsError("");
    setNotificationsMessage("");
    try {
      const response = await sagaApi({
        service: "userApi",
        method: "updateNotificationPreferences",
        args: [notificationPreferences],
      });
      if (response?.data?.notificationPreferences) {
        setNotificationPreferences(response.data.notificationPreferences);
      }
      setNotificationsMessage("Notification preferences saved.");
    } catch (err) {
      setNotificationsError(
        err?.response?.data?.error ||
          "Unable to save notification preferences.",
      );
    } finally {
      setNotificationsSaving(false);
    }
  };

  const handleSubscribeOfflineNotifications = async () => {
    setNotificationsSaving(true);
    setNotificationsError("");
    setNotificationsMessage("");
    try {
      const response = await sagaApi({
        service: "userApi",
        method: "subscribeOfflineNotifications",
        args: [
          notificationPreferences?.offline?.phoneNumber,
          notificationPreferences?.offline?.gatewayDomain,
        ],
      });
      if (response?.data?.notificationPreferences) {
        setNotificationPreferences(response.data.notificationPreferences);
      }
      setNotificationsMessage("Offline notifications subscribed successfully.");
    } catch (err) {
      setNotificationsError(
        err?.response?.data?.error ||
          "Unable to subscribe to offline notifications.",
      );
    } finally {
      setNotificationsSaving(false);
    }
  };

  const handleUnsubscribeOfflineNotifications = async () => {
    setNotificationsSaving(true);
    setNotificationsError("");
    setNotificationsMessage("");
    try {
      const response = await sagaApi({
        service: "userApi",
        method: "unsubscribeOfflineNotifications",
      });
      if (response?.data?.notificationPreferences) {
        setNotificationPreferences(response.data.notificationPreferences);
      }
      setNotificationsMessage("Offline notifications unsubscribed.");
    } catch (err) {
      setNotificationsError(
        err?.response?.data?.error ||
          "Unable to unsubscribe from offline notifications.",
      );
    } finally {
      setNotificationsSaving(false);
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
              ⚠️ This action cannot be undone
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

      {/* Notifications Section */}
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
        <p
          style={{
            color: "#666",
            marginBottom: "12px",
            fontSize: "clamp(13px, 1.5vw, 14px)",
          }}
        >
          Choose how and when you receive updates. Offline notifications use an
          SMS gateway email address to avoid extra provider costs.
        </p>

        {notificationsLoading ? (
          <p style={{ color: "#666", fontSize: "clamp(13px, 1.5vw, 14px)" }}>
            Loading notification preferences...
          </p>
        ) : (
          <>
            <div style={{ marginBottom: "12px" }}>
              <strong>Channels</strong>
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  gap: "14px",
                  flexWrap: "wrap",
                }}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(notificationPreferences.channels?.email)}
                    onChange={(e) =>
                      updatePreference(["channels", "email"], e.target.checked)
                    }
                  />{" "}
                  Email
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(notificationPreferences.channels?.sms)}
                    onChange={(e) =>
                      updatePreference(["channels", "sms"], e.target.checked)
                    }
                  />{" "}
                  Offline SMS (gateway)
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(notificationPreferences.channels?.inApp)}
                    onChange={(e) =>
                      updatePreference(["channels", "inApp"], e.target.checked)
                    }
                  />{" "}
                  In-app
                </label>
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <strong>Notification Types</strong>
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  gap: "14px",
                  flexWrap: "wrap",
                }}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(
                      notificationPreferences.eventTypes?.security,
                    )}
                    onChange={(e) =>
                      updatePreference(
                        ["eventTypes", "security"],
                        e.target.checked,
                      )
                    }
                  />{" "}
                  Security
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(
                      notificationPreferences.eventTypes?.billing,
                    )}
                    onChange={(e) =>
                      updatePreference(
                        ["eventTypes", "billing"],
                        e.target.checked,
                      )
                    }
                  />{" "}
                  Billing
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(
                      notificationPreferences.eventTypes?.matches,
                    )}
                    onChange={(e) =>
                      updatePreference(
                        ["eventTypes", "matches"],
                        e.target.checked,
                      )
                    }
                  />{" "}
                  Matches
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(
                      notificationPreferences.eventTypes?.messages,
                    )}
                    onChange={(e) =>
                      updatePreference(
                        ["eventTypes", "messages"],
                        e.target.checked,
                      )
                    }
                  />{" "}
                  Message Alerts
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(
                      notificationPreferences.eventTypes?.system,
                    )}
                    onChange={(e) =>
                      updatePreference(
                        ["eventTypes", "system"],
                        e.target.checked,
                      )
                    }
                  />{" "}
                  System
                </label>
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <strong>Quiet Hours</strong>
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  gap: "14px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(
                      notificationPreferences.quietHours?.enabled,
                    )}
                    onChange={(e) =>
                      updatePreference(
                        ["quietHours", "enabled"],
                        e.target.checked,
                      )
                    }
                  />{" "}
                  Enable quiet hours
                </label>
                <label>
                  Start{" "}
                  <input
                    type="time"
                    value={notificationPreferences.quietHours?.start || "22:00"}
                    onChange={(e) =>
                      updatePreference(["quietHours", "start"], e.target.value)
                    }
                  />
                </label>
                <label>
                  End{" "}
                  <input
                    type="time"
                    value={notificationPreferences.quietHours?.end || "06:00"}
                    onChange={(e) =>
                      updatePreference(["quietHours", "end"], e.target.value)
                    }
                  />
                </label>
              </div>
            </div>

            <div
              style={{
                marginTop: "16px",
                paddingTop: "12px",
                borderTop: "1px solid #eaeaea",
              }}
            >
              <strong>
                Offline Notifications Subscription (Feature Phones)
              </strong>
              <p
                style={{
                  color: "#666",
                  fontSize: "clamp(12px, 1.5vw, 13px)",
                  marginTop: "8px",
                }}
              >
                Provide your phone number and your carrier email-to-SMS gateway
                domain (example: 2348012345678@carrier-sms.example).
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "8px",
                }}
              >
                <input
                  type="tel"
                  placeholder="Phone number (digits only)"
                  value={notificationPreferences.offline?.phoneNumber || ""}
                  onChange={(e) =>
                    updatePreference(["offline", "phoneNumber"], e.target.value)
                  }
                  style={{
                    padding: "8px 10px",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    minWidth: "220px",
                  }}
                />
                <input
                  type="text"
                  placeholder="Gateway domain (e.g. txt.att.net)"
                  value={notificationPreferences.offline?.gatewayDomain || ""}
                  onChange={(e) =>
                    updatePreference(
                      ["offline", "gatewayDomain"],
                      e.target.value,
                    )
                  }
                  style={{
                    padding: "8px 10px",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    minWidth: "240px",
                  }}
                />
                <label
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(
                      notificationPreferences.offline?.fallbackToEmail,
                    )}
                    onChange={(e) =>
                      updatePreference(
                        ["offline", "fallbackToEmail"],
                        e.target.checked,
                      )
                    }
                  />
                  Fallback to email if SMS fails
                </label>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "10px",
                }}
              >
                <button
                  onClick={handleSubscribeOfflineNotifications}
                  disabled={notificationsSaving}
                  style={{
                    background: "#2d8659",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 14px",
                    cursor: notificationsSaving ? "not-allowed" : "pointer",
                    opacity: notificationsSaving ? 0.75 : 1,
                  }}
                >
                  Subscribe Offline Notifications
                </button>
                <button
                  onClick={handleUnsubscribeOfflineNotifications}
                  disabled={notificationsSaving}
                  style={{
                    background: "#b42318",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 14px",
                    cursor: notificationsSaving ? "not-allowed" : "pointer",
                    opacity: notificationsSaving ? 0.75 : 1,
                  }}
                >
                  Unsubscribe Offline
                </button>
              </div>
            </div>

            <div style={{ marginTop: "12px" }}>
              <button
                onClick={handleSaveNotificationPreferences}
                disabled={notificationsSaving}
                style={{
                  background: "#1976d2",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "10px 16px",
                  cursor: notificationsSaving ? "not-allowed" : "pointer",
                  opacity: notificationsSaving ? 0.75 : 1,
                }}
              >
                {notificationsSaving
                  ? "Saving..."
                  : "Save Notification Preferences"}
              </button>
            </div>
          </>
        )}

        {notificationsMessage && (
          <p style={{ color: "#2d8659", marginTop: "10px" }}>
            {notificationsMessage}
          </p>
        )}
        {notificationsError && (
          <p style={{ color: "#b42318", marginTop: "10px" }}>
            {notificationsError}
          </p>
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
              }}
            >
              ⬇️ Download
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
              }}
            >
              {emailCodesSending
                ? "Sending..."
                : emailCodesSent
                  ? "✓ Sent"
                  : "📧 Email"}
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
