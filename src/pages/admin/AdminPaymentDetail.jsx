import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminApi } from "../../api/adminApi";

const AdminPaymentDetail = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeEvidence, setDisputeEvidence] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    loadPayment();
  }, [paymentId]);

  const loadPayment = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getPayment(paymentId);
      setPayment(response.data.payment);
      setError(null);
    } catch (err) {
      setError("Unable to load payment details");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (
      !window.confirm(
        "Re-verify this payment with Paystack? This will check the current status."
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      await adminApi.verifyPayment(paymentId);
      alert("Payment verified successfully");
      loadPayment();
    } catch (err) {
      alert("Verification failed: " + err.response?.data?.error || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      alert("Please enter a refund reason");
      return;
    }

    if (
      !window.confirm(
        `Refund ₦${payment.amount.toLocaleString()} to ${payment.email}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      await adminApi.refundPayment(paymentId, refundReason);
      alert("Refund initiated successfully");
      setRefundReason("");
      loadPayment();
    } catch (err) {
      alert("Refund failed: " + err.response?.data?.error || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) {
      alert("Please enter a dispute reason");
      return;
    }

    try {
      setActionLoading(true);
      await adminApi.disputePayment(paymentId, disputeReason, disputeEvidence);
      alert("Dispute recorded successfully");
      setDisputeReason("");
      setDisputeEvidence("");
      loadPayment();
    } catch (err) {
      alert("Failed to record dispute: " + err.response?.data?.error || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "success":
      case "verified":
        return "low";
      case "pending":
        return "medium";
      case "failed":
      case "refunded":
        return "high";
      default:
        return "low";
    }
  };

  if (loading) {
    return <AdminLayout title="Payment Detail">Loading...</AdminLayout>;
  }

  if (error) {
    return (
      <AdminLayout title="Payment Detail">
        <div className="admin-card">{error}</div>
        <button className="admin-button" onClick={() => navigate("/admin/payments")}>
          Back to Payments
        </button>
      </AdminLayout>
    );
  }

  if (!payment) {
    return (
      <AdminLayout title="Payment Detail">
        <div className="admin-card">Payment not found</div>
        <button className="admin-button" onClick={() => navigate("/admin/payments")}>
          Back to Payments
        </button>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Payment Detail">
      <div className="admin-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>{payment.reference}</h3>
          <button className="admin-button" onClick={() => navigate("/admin/payments")}>
            Back
          </button>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <h3>Email</h3>
          <p>{payment.email}</p>
        </div>
        <div className="admin-card">
          <h3>Amount</h3>
          <p>₦{payment.amount.toLocaleString()}</p>
        </div>
        <div className="admin-card">
          <h3>Plan</h3>
          <p>{payment.plan}</p>
        </div>
        <div className="admin-card">
          <h3>Status</h3>
          <span className={`admin-pill ${getStatusBadgeClass(payment.status)}`}>
            {payment.status}
          </span>
        </div>
        <div className="admin-card">
          <h3>Refund Status</h3>
          <p>{payment.refundStatus || "none"}</p>
        </div>
        <div className="admin-card">
          <h3>Created</h3>
          <p>{new Date(payment.createdAt).toLocaleString()}</p>
        </div>
        {payment.verifiedAt && (
          <div className="admin-card">
            <h3>Verified At</h3>
            <p>{new Date(payment.verifiedAt).toLocaleString()}</p>
          </div>
        )}
        {payment.paystackTransactionId && (
          <div className="admin-card">
            <h3>Paystack Transaction ID</h3>
            <p>{payment.paystackTransactionId}</p>
          </div>
        )}
      </div>

      <div className="admin-card" style={{ marginTop: "20px" }}>
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "16px",
            borderBottom: "1px solid var(--admin-border)",
            paddingBottom: "12px",
          }}
        >
          <button
            className={`admin-button ${activeTab === "details" ? "primary" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
          <button
            className={`admin-button ${activeTab === "actions" ? "primary" : ""}`}
            onClick={() => setActiveTab("actions")}
          >
            Actions
          </button>
          {payment.paystackResponse && (
            <button
              className={`admin-button ${activeTab === "paystack" ? "primary" : ""}`}
              onClick={() => setActiveTab("paystack")}
            >
              Paystack Response
            </button>
          )}
        </div>

        {activeTab === "details" && (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ marginTop: 0 }}>Payment Details</h4>
              <table className="admin-table">
                <tbody>
                  <tr>
                    <th style={{ width: "200px" }}>Currency</th>
                    <td>{payment.currency}</td>
                  </tr>
                  <tr>
                    <th>Payment Method</th>
                    <td>{payment.paymentMethod}</td>
                  </tr>
                  <tr>
                    <th>Verification Attempts</th>
                    <td>{payment.verificationAttempts}</td>
                  </tr>
                  {payment.refundAmount > 0 && (
                    <tr>
                      <th>Refund Amount</th>
                      <td>₦{payment.refundAmount.toLocaleString()}</td>
                    </tr>
                  )}
                  {payment.refundReference && (
                    <tr>
                      <th>Refund Reference</th>
                      <td>{payment.refundReference}</td>
                    </tr>
                  )}
                  {payment.refundReason && (
                    <tr>
                      <th>Refund Reason</th>
                      <td>{payment.refundReason}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {payment.verificationErrors && payment.verificationErrors.length > 0 && (
              <div>
                <h4>Verification Errors</h4>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {payment.verificationErrors.map((err, idx) => (
                    <div key={idx} style={{ fontSize: "12px", marginBottom: "8px" }}>
                      <strong>{new Date(err.timestamp).toLocaleString()}:</strong>{" "}
                      {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "actions" && (
          <div>
            {(payment.status === "success" || payment.status === "verified") && (
              <>
                <div style={{ marginBottom: "24px" }}>
                  <h4 style={{ marginTop: 0 }}>Verify Payment</h4>
                  <p style={{ fontSize: "13px", color: "var(--admin-muted)" }}>
                    Re-verify this payment with Paystack to check the current status
                  </p>
                  <button
                    className="admin-button primary"
                    onClick={handleVerify}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Verifying..." : "Verify with Paystack"}
                  </button>
                </div>

                {payment.refundStatus !== "completed" && (
                  <div style={{ marginBottom: "24px" }}>
                    <h4 style={{ marginTop: 0 }}>Initiate Refund</h4>
                    <p style={{ fontSize: "13px", color: "var(--admin-muted)" }}>
                      This will refund ₦{payment.amount.toLocaleString()} to the customer's
                      Paystack account
                    </p>
                    <textarea
                      className="admin-input"
                      placeholder="Refund reason (required)"
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      style={{
                        marginBottom: "12px",
                        minHeight: "80px",
                        fontFamily: "inherit",
                      }}
                    />
                    <button
                      className="admin-button danger"
                      onClick={handleRefund}
                      disabled={actionLoading || !refundReason.trim()}
                    >
                      {actionLoading ? "Processing..." : "Process Refund"}
                    </button>
                  </div>
                )}
              </>
            )}

            <div>
              <h4 style={{ marginTop: 0 }}>Record Dispute</h4>
              <p style={{ fontSize: "13px", color: "var(--admin-muted)" }}>
                Use this if there's a chargeback or customer dispute
              </p>
              <textarea
                className="admin-input"
                placeholder="Dispute reason (required)"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                style={{
                  marginBottom: "12px",
                  minHeight: "80px",
                  fontFamily: "inherit",
                }}
              />
              <textarea
                className="admin-input"
                placeholder="Evidence or notes (optional)"
                value={disputeEvidence}
                onChange={(e) => setDisputeEvidence(e.target.value)}
                style={{
                  marginBottom: "12px",
                  minHeight: "60px",
                  fontFamily: "inherit",
                }}
              />
              <button
                className="admin-button danger"
                onClick={handleDispute}
                disabled={actionLoading || !disputeReason.trim()}
              >
                {actionLoading ? "Recording..." : "Record Dispute"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "paystack" && payment.paystackResponse && (
          <div>
            <h4 style={{ marginTop: 0 }}>Paystack Response Data</h4>
            <pre
              style={{
                background: "rgba(0, 0, 0, 0.3)",
                padding: "12px",
                borderRadius: "8px",
                overflow: "auto",
                fontSize: "12px",
              }}
            >
              {JSON.stringify(payment.paystackResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPaymentDetail;
