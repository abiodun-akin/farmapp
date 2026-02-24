import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminApi } from "../../api/adminApi";

const AdminUserDetail = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reason, setReason] = useState("");

  const loadUser = async () => {
    try {
      setLoading(true);
      const userRes = await adminApi.getUser(userId);
      const reportRes = await adminApi.getUserActivityReport(userId);
      setUser(userRes.data.user);
      setReport(reportRes.data);
      setError(null);
    } catch (err) {
      setError("Unable to load user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [userId]);

  const handleSuspend = async () => {
    if (!reason.trim()) {
      setError("Suspension reason is required");
      return;
    }

    try {
      await adminApi.suspendUser(userId, reason);
      setReason("");
      loadUser();
    } catch (err) {
      setError("Unable to suspend user");
    }
  };

  const handleUnsuspend = async () => {
    try {
      await adminApi.unsuspendUser(userId);
      loadUser();
    } catch (err) {
      setError("Unable to unsuspend user");
    }
  };

  const handleRecordViolation = async (type) => {
    try {
      await adminApi.recordViolation(userId, type);
      loadUser();
    } catch (err) {
      setError("Unable to record violation");
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
