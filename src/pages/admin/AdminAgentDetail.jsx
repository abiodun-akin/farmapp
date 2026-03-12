import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminApi } from "../../api/adminApi";

const AdminAgentDetail = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();

  const [agent, setAgent] = useState(null);
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promoMsg, setPromoMsg] = useState(null);
  const [newCode, setNewCode] = useState({
    code: "",
    rebateType: "fixed",
    rebateValue: "",
    maxRedemptions: "",
    validTo: "",
  });

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [agentRes, promoRes] = await Promise.all([
        adminApi.getUser(agentId),
        adminApi.getAgentPromoCodes(agentId),
      ]);
      setAgent(agentRes.data.user);
      setPromoCodes(promoRes.data.promoCodes || []);
    } catch {
      setError("Unable to load agent data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [agentId]);

  const handleCreatePromo = async () => {
    setPromoMsg(null);
    if (!newCode.rebateValue) {
      setPromoMsg({ type: "error", text: "Rebate value is required" });
      return;
    }
    try {
      await adminApi.createAgentPromoCode(agentId, {
        code: newCode.code.trim().toUpperCase() || undefined, // omit to auto-generate
        rebateType: newCode.rebateType,
        rebateValue: Number(newCode.rebateValue),
        maxRedemptions: newCode.maxRedemptions
          ? Number(newCode.maxRedemptions)
          : null,
        validTo: newCode.validTo || null,
      });
      setNewCode({
        code: "",
        rebateType: "fixed",
        rebateValue: "",
        maxRedemptions: "",
        validTo: "",
      });
      setPromoMsg({ type: "success", text: "Promo code created successfully" });
      load();
    } catch (err) {
      setPromoMsg({
        type: "error",
        text: err?.response?.data?.error || "Failed to create promo code",
      });
    }
  };

  return (
    <AdminLayout title="Agent Detail">
      <button
        className="admin-button"
        onClick={() => navigate("/admin/agents")}
        style={{ marginBottom: 20 }}
      >
        ← Back to Agents
      </button>

      {loading && <div className="admin-card">Loading...</div>}
      {error && <div className="admin-card">{error}</div>}

      {agent && (
        <>
          {/* ── Wallet summary ── */}
          <div className="admin-grid" style={{ marginBottom: 20 }}>
            <div className="admin-card">
              <h3>Agent</h3>
              <p style={{ fontSize: 17 }}>{agent.name}</p>
              <p style={{ fontSize: 13, color: "var(--admin-muted)", margin: "4px 0 8px" }}>
                {agent.email}
              </p>
              <span
                className={`admin-pill ${agent.isAgent ? "low" : "high"}`}
              >
                {agent.isAgent ? "Active Agent" : "Not an Agent"}
              </span>
            </div>
            <div className="admin-card">
              <h3>Available Balance</h3>
              <p>₦{(agent.agentWallet?.availableBalance || 0).toLocaleString()}</p>
            </div>
            <div className="admin-card">
              <h3>Locked Balance</h3>
              <p>₦{(agent.agentWallet?.lockedBalance || 0).toLocaleString()}</p>
            </div>
            <div className="admin-card">
              <h3>Lifetime Earned</h3>
              <p>₦{(agent.agentWallet?.lifetimeEarned || 0).toLocaleString()}</p>
            </div>
            <div className="admin-card">
              <h3>Lifetime Withdrawn</h3>
              <p>
                ₦{(agent.agentWallet?.lifetimeWithdrawn || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* ── Create promo code (only for approved agents) ── */}
          {agent.isAgent ? (
            <div className="admin-card" style={{ marginBottom: 20 }}>
              <h3>Create Promo Code</h3>
              {promoMsg && (
                <div
                  className={`admin-pill ${promoMsg.type === "error" ? "high" : "low"}`}
                  style={{ marginBottom: 12 }}
                >
                  {promoMsg.text}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  alignItems: "flex-end",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      color: "var(--admin-muted)",
                      display: "block",
                      marginBottom: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Code <span style={{ color: "var(--admin-muted)", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    className="admin-input"
                    placeholder="Auto-generated if blank"
                    value={newCode.code}
                    onChange={(e) =>
                      setNewCode((n) => ({
                        ...n,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    style={{ width: 180 }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      color: "var(--admin-muted)",
                      display: "block",
                      marginBottom: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Rebate Type
                  </label>
                  <select
                    className="admin-input"
                    value={newCode.rebateType}
                    onChange={(e) =>
                      setNewCode((n) => ({ ...n, rebateType: e.target.value }))
                    }
                    style={{ cursor: "pointer", width: 140 }}
                  >
                    <option value="fixed">Fixed (₦)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      color: "var(--admin-muted)",
                      display: "block",
                      marginBottom: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Rebate Value *
                  </label>
                  <input
                    className="admin-input"
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={newCode.rebateValue}
                    onChange={(e) =>
                      setNewCode((n) => ({ ...n, rebateValue: e.target.value }))
                    }
                    style={{ width: 120 }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      color: "var(--admin-muted)",
                      display: "block",
                      marginBottom: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Max Redemptions
                  </label>
                  <input
                    className="admin-input"
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={newCode.maxRedemptions}
                    onChange={(e) =>
                      setNewCode((n) => ({
                        ...n,
                        maxRedemptions: e.target.value,
                      }))
                    }
                    style={{ width: 120 }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      color: "var(--admin-muted)",
                      display: "block",
                      marginBottom: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Valid Until
                  </label>
                  <input
                    className="admin-input"
                    type="date"
                    value={newCode.validTo}
                    onChange={(e) =>
                      setNewCode((n) => ({ ...n, validTo: e.target.value }))
                    }
                    style={{ width: 148 }}
                  />
                </div>
                <button className="admin-button primary" onClick={handleCreatePromo}>
                  Create Code
                </button>
              </div>
            </div>
          ) : (
            <div className="admin-card" style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: "var(--admin-muted)" }}>
                This user is not an approved agent. Approve their application
                first to assign promo codes.
              </p>
            </div>
          )}

          {/* ── Promo codes table ── */}
          <div className="admin-card">
            <h3>Promo Codes ({promoCodes.length})</h3>
            {promoCodes.length === 0 ? (
              <p style={{ fontSize: 14 }}>No promo codes assigned yet</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Used / Max</th>
                    <th>Status</th>
                    <th>Expires</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {promoCodes.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <strong style={{ letterSpacing: "0.06em" }}>
                          {p.code}
                        </strong>
                      </td>
                      <td>{p.rebateType}</td>
                      <td>
                        {p.rebateType === "fixed"
                          ? `₦${p.rebateValue.toLocaleString()}`
                          : `${p.rebateValue}%`}
                      </td>
                      <td>
                        {p.redemptionCount} / {p.maxRedemptions ?? "∞"}
                      </td>
                      <td>
                        <span
                          className={`admin-pill ${
                            p.status === "active" ? "low" : "high"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td>
                        {p.validTo
                          ? new Date(p.validTo).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminAgentDetail;
