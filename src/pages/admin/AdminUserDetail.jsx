import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useSagaApi from "../../hooks/useSagaApi";
import AdminLayout from "./AdminLayout";

const AdminUserDetail = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reason, setReason] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState(null);
  const [downgradeReason, setDowngradeReason] = useState("");
  const [downgradeMsg, setDowngradeMsg] = useState(null);
  const sagaApi = useSagaApi();

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      const userRes = await sagaApi({
        service: "adminApi",
        method: "getUser",
        args: [userId],
      });
      const reportRes = await sagaApi({
        service: "adminApi",
        method: "getUserActivityReport",
        args: [userId],
      });
      setUser(userRes.data.user);
      setReport(reportRes.data);
      setError(null);
    } catch {
      setError("Unable to load user data");
    } finally {
      setLoading(false);
    }
  }, [sagaApi, userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleSuspend = async () => {
    if (!reason.trim()) {
      setError("Suspension reason is required");
      return;
    }

    try {
      await sagaApi({
        service: "adminApi",
        method: "suspendUser",
        args: [userId, reason],
      });
      setReason("");
      loadUser();
    } catch {
      setError("Unable to suspend user");
    }
  };

  const handleUnsuspend = async () => {
    try {
      await sagaApi({
        service: "adminApi",
        method: "unsuspendUser",
        args: [userId],
      });
      loadUser();
    } catch {
      setError("Unable to unsuspend user");
    }
  };

  const handleRecordViolation = async (type) => {
    try {
      await sagaApi({
        service: "adminApi",
        method: "recordViolation",
        args: [userId, type],
      });
      loadUser();
    } catch {
      setError("Unable to record violation");
    }
  };

  const handleResetPassword = async () => {
    setPwMsg(null);
    if (!newPassword.trim()) {
      setPwMsg({ type: "error", text: "Enter the new password first" });
      return;
    }
    try {
      await sagaApi({
        service: "adminApi",
        method: "resetUserPassword",
        args: [userId, newPassword],
      });
      setNewPassword("");
      setPwMsg({ type: "success", text: "Password reset successfully" });
    } catch (err) {
      setPwMsg({
        type: "error",
        text: err?.response?.data?.error || "Failed to reset password",
      });
    }
  };

  const handleManualDowngrade = async (immediate) => {
    setDowngradeMsg(null);
    try {
      const response = await sagaApi({
        service: "adminApi",
        method: "manualDowngradeSubscription",
        args: [
          userId,
          {
            immediate,
            reason: downgradeReason || "Admin manual downgrade",
          },
        ],
      });
      setDowngradeMsg({
        type: "success",
        text: response?.data?.message || "Downgrade action completed",
      });
      loadUser();
    } catch (err) {
      setDowngradeMsg({
        type: "error",
        text:
          err?.response?.data?.error || "Unable to process manual downgrade",
      });
    }
  };

  return (
    <AdminLayout title="User Detail">
      {loading && <div className="admin-card">Loading...</div>}
      {error && <div className="admin-card">{error}</div>}

      {user && (
        <div className="admin-grid">
          <div className="admin-card">
            <h3>User</h3>
            <p>{user.email}</p>
            <div className="admin-pill">
              {user.isSuspended ? "Suspended" : "Active"}
            </div>
          </div>
          <div className="admin-card">
            <h3>Violations</h3>
            <p>{user.violationCount || 0}</p>
          </div>
          <div className="admin-card">
            <h3>Flagged Messages</h3>
            <p>{user.flaggedMessageCount || 0}</p>
          </div>
          <div className="admin-card">
            <h3>Activity Score</h3>
            <p>{report?.totalScore || 0}</p>
          </div>
        </div>
      )}

      <div className="admin-card">
        <h3>Account Actions</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <input
            className="admin-input"
            placeholder="Suspension reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button className="admin-button danger" onClick={handleSuspend}>
            Suspend
          </button>
          <button className="admin-button primary" onClick={handleUnsuspend}>
            Unsuspend
          </button>
          <button
            className="admin-button"
            onClick={() => handleRecordViolation("default")}
          >
            Record Payment Default
          </button>
          <button
            className="admin-button"
            onClick={() => handleRecordViolation("cancellation")}
          >
            Record Cancellation
          </button>
        </div>
      </div>

      <div className="admin-card">
        <h3>Reset Password</h3>
        {pwMsg && (
          <div
            className={`admin-pill ${pwMsg.type === "error" ? "high" : "low"}`}
            style={{ marginBottom: 12 }}
          >
            {pwMsg.text}
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <input
            className="admin-input"
            type="password"
            placeholder="New password (min 8 chars, 1 upper, 1 number)"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPwMsg(null);
            }}
            style={{ minWidth: 280 }}
          />
          <button className="admin-button danger" onClick={handleResetPassword}>
            Reset Password
          </button>
        </div>
        <p style={{ fontSize: 11, color: "var(--admin-muted)", marginTop: 8 }}>
          Communicate the new password to the user securely. Admin accounts
          cannot be reset here.
        </p>
      </div>

      <div className="admin-card">
        <h3>Subscription Downgrade</h3>
        {downgradeMsg && (
          <div
            className={`admin-pill ${downgradeMsg.type === "error" ? "high" : "low"}`}
            style={{ marginBottom: 12 }}
          >
            {downgradeMsg.text}
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <input
            className="admin-input"
            placeholder="Downgrade reason (optional)"
            value={downgradeReason}
            onChange={(e) => setDowngradeReason(e.target.value)}
            style={{ minWidth: 300 }}
          />
          <button
            className="admin-button danger"
            onClick={() => handleManualDowngrade(true)}
          >
            Downgrade Now
          </button>
          <button
            className="admin-button"
            onClick={() => handleManualDowngrade(false)}
          >
            Schedule Downgrade
          </button>
        </div>
        <p style={{ fontSize: 11, color: "var(--admin-muted)", marginTop: 8 }}>
          Downgrade now immediately removes paid entitlement. Schedule downgrade
          applies at subscription end date.
        </p>
      </div>

      {report && (
        <div className="admin-card">
          <h3>Activity Report</h3>
          <table className="admin-table">
            <tbody>
              <tr>
                <th>Base Score</th>
                <td>{report.baseScore}</td>
              </tr>
              <tr>
                <th>Total Score</th>
                <td>{report.totalScore}</td>
              </tr>
              <tr>
                <th>Risk Level</th>
                <td>{report.riskLevel}</td>
              </tr>
              <tr>
                <th>Last Active</th>
                <td>{new Date(report.lastActive).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUserDetail;
