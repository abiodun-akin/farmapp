import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import useSagaApi from "../../hooks/useSagaApi";

const TABS = [
  { key: "applications", label: "Applications" },
  { key: "agents", label: "Active Agents" },
  { key: "withdrawals", label: "Withdrawals" },
];

const StatusBadge = ({ status }) => {
  const colorMap = {
    pending: "medium",
    approved: "low",
    declined: "high",
    paid: "low",
  };
  return (
    <span className={`admin-pill ${colorMap[status] || ""}`}>{status}</span>
  );
};

const AdminAgents = () => {
  const [tab, setTab] = useState("applications");
  const [applications, setApplications] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState({});
  const [actionMsg, setActionMsg] = useState(null);
  const navigate = useNavigate();
  const sagaApi = useSagaApi();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [appsRes, wdRes] = await Promise.all([
        sagaApi({ service: "adminApi", method: "getAgentApplications" }),
        sagaApi({ service: "adminApi", method: "getAgentWithdrawals" }),
      ]);
      setApplications(appsRes.data.applications || []);
      setWithdrawals(wdRes.data.withdrawals || []);
    } catch {
      setError("Unable to load agent data");
    } finally {
      setLoading(false);
    }
  }, [sagaApi]);

  useEffect(() => {
    load();
  }, [load]);

  const reviewApplication = async (id, decision) => {
    setActionMsg(null);
    try {
      await sagaApi({
        service: "adminApi",
        method: "reviewAgentApplication",
        args: [id, decision, notes[id] || ""],
      });
      setActionMsg({ type: "success", text: `Application ${decision}` });
      load();
    } catch (err) {
      setActionMsg({
        type: "error",
        text: err?.response?.data?.error || "Failed to review application",
      });
    }
  };

  const reviewWithdrawal = async (id, decision) => {
    setActionMsg(null);
    try {
      await sagaApi({
        service: "adminApi",
        method: "reviewAgentWithdrawal",
        args: [id, decision, notes[id] || ""],
      });
      setActionMsg({ type: "success", text: `Withdrawal marked as ${decision}` });
      load();
    } catch (err) {
      setActionMsg({
        type: "error",
        text: err?.response?.data?.error || "Failed to review withdrawal",
      });
    }
  };

  const activeAgents = applications.filter((a) => a.status === "approved");

  return (
    <AdminLayout title="Agent Management">
      {actionMsg && (
        <div
          className={`admin-pill ${actionMsg.type === "error" ? "high" : "low"}`}
          style={{ marginBottom: 16, fontSize: 13 }}
        >
          {actionMsg.text}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`admin-button${tab === t.key ? " primary" : ""}`}
            onClick={() => {
              setTab(t.key);
              setActionMsg(null);
            }}
          >
            {t.label}
            {t.key === "applications" && (
              <span
                style={{
                  marginLeft: 6,
                  background: "rgba(246,196,83,0.3)",
                  borderRadius: 999,
                  padding: "1px 7px",
                  fontSize: 11,
                }}
              >
                {applications.filter((a) => a.status === "pending").length}
              </span>
            )}
            {t.key === "withdrawals" && (
              <span
                style={{
                  marginLeft: 6,
                  background: "rgba(246,196,83,0.3)",
                  borderRadius: 999,
                  padding: "1px 7px",
                  fontSize: 11,
                }}
              >
                {withdrawals.filter((w) => w.status === "pending").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && <div className="admin-card">{error}</div>}
      {loading && <div className="admin-card">Loading...</div>}

      {/* ── Applications ── */}
      {!loading && tab === "applications" && (
        <div className="admin-card">
          <h3>Agent Applications ({applications.length})</h3>
          {applications.length === 0 ? (
            <p style={{ fontSize: 14 }}>No applications yet</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Motivation</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a._id}>
                    <td>{a.user_id?.name || "—"}</td>
                    <td>{a.user_id?.email || "—"}</td>
                    <td>{a.contactPhone || "—"}</td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td
                      style={{
                        maxWidth: 180,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: 12,
                        color: "var(--admin-muted)",
                      }}
                      title={a.motivation}
                    >
                      {a.motivation}
                    </td>
                    <td>
                      <input
                        className="admin-input"
                        style={{ width: 130 }}
                        placeholder="Admin note"
                        value={notes[a._id] || ""}
                        onChange={(e) =>
                          setNotes((n) => ({ ...n, [a._id]: e.target.value }))
                        }
                      />
                    </td>
                    <td>
                      <div className="admin-actions">
                        {a.user_id && (
                          <button
                            className="admin-button"
                            onClick={() =>
                              navigate(`/admin/agents/${a.user_id._id}`)
                            }
                          >
                            View
                          </button>
                        )}
                        {a.status === "pending" && (
                          <>
                            <button
                              className="admin-button primary"
                              onClick={() =>
                                reviewApplication(a._id, "approved")
                              }
                            >
                              Approve
                            </button>
                            <button
                              className="admin-button danger"
                              onClick={() =>
                                reviewApplication(a._id, "declined")
                              }
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Active Agents ── */}
      {!loading && tab === "agents" && (
        <div className="admin-card">
          <h3>Active Agents ({activeAgents.length})</h3>
          {activeAgents.length === 0 ? (
            <p style={{ fontSize: 14 }}>No approved agents yet</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Approved</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeAgents.map((a) => (
                  <tr key={a._id}>
                    <td>{a.user_id?.name || "—"}</td>
                    <td>{a.user_id?.email || "—"}</td>
                    <td>{a.contactPhone || "—"}</td>
                    <td>
                      {a.reviewedAt
                        ? new Date(a.reviewedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <div className="admin-actions">
                        {a.user_id && (
                          <button
                            className="admin-button primary"
                            onClick={() =>
                              navigate(`/admin/agents/${a.user_id._id}`)
                            }
                          >
                            Manage Promo Codes
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Withdrawals ── */}
      {!loading && tab === "withdrawals" && (
        <div className="admin-card">
          <h3>Withdrawal Requests ({withdrawals.length})</h3>
          {withdrawals.length === 0 ? (
            <p style={{ fontSize: 14 }}>No withdrawal requests yet</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w._id}>
                    <td>{w.agent_id?.name || "—"}</td>
                    <td>{w.agent_id?.email || "—"}</td>
                    <td>₦{(w.amount || 0).toLocaleString()}</td>
                    <td>
                      <StatusBadge status={w.status} />
                    </td>
                    <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                    <td>
                      <input
                        className="admin-input"
                        style={{ width: 130 }}
                        placeholder="Admin note"
                        value={notes[w._id] || ""}
                        onChange={(e) =>
                          setNotes((n) => ({ ...n, [w._id]: e.target.value }))
                        }
                      />
                    </td>
                    <td>
                      <div className="admin-actions">
                        {w.status === "pending" && (
                          <>
                            <button
                              className="admin-button primary"
                              onClick={() => reviewWithdrawal(w._id, "approved")}
                            >
                              Approve
                            </button>
                            <button
                              className="admin-button danger"
                              onClick={() => reviewWithdrawal(w._id, "declined")}
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {w.status === "approved" && (
                          <button
                            className="admin-button primary"
                            onClick={() => reviewWithdrawal(w._id, "paid")}
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAgents;
