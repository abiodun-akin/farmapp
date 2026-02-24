import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { adminApi } from "../../api/adminApi";

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [flaggedMessages, setFlaggedMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const dashboardRes = await adminApi.getDashboard();
        const flaggedRes = await adminApi.getFlaggedMessages({ limit: 5, page: 1 });
        setOverview(dashboardRes.data.overview);
        setFlaggedMessages(flaggedRes.data.messages || []);
      } catch (err) {
        setError("Unable to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <AdminLayout title="Admin Overview">
      {loading && <div className="admin-card">Loading...</div>}
      {error && <div className="admin-card">{error}</div>}
      {overview && (
        <div className="admin-grid">
          <div className="admin-card">
            <h3>Total Users</h3>
            <p>{overview.totalUsers}</p>
          </div>
          <div className="admin-card">
            <h3>Suspended Users</h3>
            <p>{overview.suspendedUsers}</p>
          </div>
          <div className="admin-card">
            <h3>Payment Violations</h3>
            <p>{overview.usersWithViolations}</p>
          </div>
          <div className="admin-card">
            <h3>Users With Flags</h3>
            <p>{overview.usersWithFlaggedMessages}</p>
          </div>
        </div>
      )}

      <div className="admin-card">
        <h3>Recent Flagged Messages</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sender</th>
              <th>Recipient</th>
              <th>Reason</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {flaggedMessages.length === 0 && (
              <tr>
                <td colSpan="4">No flagged messages</td>
              </tr>
            )}
            {flaggedMessages.map((msg) => (
              <tr key={msg._id}>
                <td>{msg.sender || "Unknown"}</td>
                <td>{msg.recipient || "Unknown"}</td>
                <td>{msg.flagReason || "-"}</td>
                <td>{msg.aiAnalysisResult?.riskScore || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
