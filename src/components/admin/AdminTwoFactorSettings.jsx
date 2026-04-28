import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import userApi from "../../api/userApi";
import { useToast } from "../../context/ToastContext";
import "./AdminTwoFactorSettings.css";

const AdminTwoFactorSettings = () => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const { user } = useSelector((state) => state.user);
  const [twoFactorSettings, setTwoFactorSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regeneratingCodes, setRegeneratingCodes] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [newRecoveryCodes, setNewRecoveryCodes] = useState(null);

  useEffect(() => {
    loadTwoFactorSettings();
  }, []);

  const loadTwoFactorSettings = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAdminTwoFactorSettings();
      setTwoFactorSettings(response.data);
    } catch (error) {
      console.error("Failed to load 2FA settings:", error);
      addToast({
        message: "Failed to load 2FA settings",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateRecoveryCodes = async () => {
    try {
      setRegeneratingCodes(true);
      const response = await userApi.regenerateAdminRecoveryCodes();

      setNewRecoveryCodes(response.data.recoveryCodes);
      setShowRecoveryCodes(true);

      addToast({
        message:
          "Recovery codes regenerated successfully. Store them in a safe place!",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to regenerate recovery codes:", error);
      addToast({
        message:
          error.response?.data?.error || "Failed to regenerate recovery codes",
        type: "error",
      });
    } finally {
      setRegeneratingCodes(false);
    }
  };

  const handleCopyRecoveryCodes = () => {
    if (newRecoveryCodes) {
      const codesText = newRecoveryCodes.join("\n");
      navigator.clipboard.writeText(codesText);
      addToast({
        message: "Recovery codes copied to clipboard",
        type: "success",
      });
    }
  };

  const handleDownloadRecoveryCodes = () => {
    if (newRecoveryCodes) {
      const element = document.createElement("a");
      const file = new Blob([newRecoveryCodes.join("\n")], {
        type: "text/plain",
      });
      element.href = URL.createObjectURL(file);
      element.download = "farmconnect-recovery-codes.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      addToast({
        message: "Recovery codes downloaded",
        type: "success",
      });
    }
  };

  if (loading) {
    return (
      <div className="admin-2fa-settings">
        <div className="loading">Loading 2FA settings...</div>
      </div>
    );
  }

  return (
    <div className="admin-2fa-settings">
      <div className="settings-card">
        <div className="settings-header">
          <h3>Two-Factor Authentication (2FA)</h3>
          <div className="status-badge mandatory">Mandatory for Admins</div>
        </div>

        {twoFactorSettings && (
          <div className="settings-content">
            <div className="setting-item">
              <label className="setting-label">Status</label>
              <div className="setting-value">
                <span
                  className={`status-indicator ${
                    twoFactorSettings.twoFactorEnabled ? "enabled" : "disabled"
                  }`}
                >
                  {twoFactorSettings.twoFactorEnabled
                    ? "✓ Enabled"
                    : "✗ Disabled"}
                </span>
              </div>
            </div>

            <div className="setting-item">
              <label className="setting-label">Recovery Codes</label>
              <div className="setting-value">
                <span className="recovery-codes-count">
                  {twoFactorSettings.recoveryCodesCount} codes available
                </span>
              </div>
              <p className="setting-description">
                Recovery codes can be used to regain access if you lose your
                authenticator app.
              </p>
            </div>

            {twoFactorSettings.recoveryCodesGeneratedAt && (
              <div className="setting-item">
                <label className="setting-label">Last Generated</label>
                <div className="setting-value">
                  {new Date(
                    twoFactorSettings.recoveryCodesGeneratedAt,
                  ).toLocaleDateString()}
                </div>
              </div>
            )}

            <div className="message-box info">
              <strong>ℹ️ Information:</strong>
              <p>{twoFactorSettings.message}</p>
            </div>

            <div className="actions">
              <button
                className="btn btn-primary"
                onClick={handleRegenerateRecoveryCodes}
                disabled={regeneratingCodes}
              >
                {regeneratingCodes
                  ? "Regenerating..."
                  : "Regenerate Recovery Codes"}
              </button>
            </div>

            {showRecoveryCodes && newRecoveryCodes && (
              <div className="recovery-codes-display">
                <div className="codes-header">
                  <h4>Your Recovery Codes</h4>
                  <p className="warning">
                    ⚠️ Save these codes in a secure location. Each code can be
                    used once.
                  </p>
                </div>

                <div className="codes-list">
                  {newRecoveryCodes.map((code, index) => (
                    <div key={index} className="code-item">
                      {code}
                    </div>
                  ))}
                </div>

                <div className="codes-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={handleCopyRecoveryCodes}
                  >
                    📋 Copy All
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleDownloadRecoveryCodes}
                  >
                    ⬇️ Download
                  </button>
                </div>
              </div>
            )}

            <div className="message-box warning">
              <strong>⚠️ Warning:</strong>
              <p>
                Two-factor authentication cannot be disabled for admin accounts.
                It is required for all administrators for security purposes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTwoFactorSettings;
