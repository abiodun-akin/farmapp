import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useSagaApi from "../../hooks/useSagaApi";

const AdminModerationPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [flaggedMessages, setFlaggedMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });
  const [actionInProgress, setActionInProgress] = useState(null);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const sagaApi = useSagaApi();

  // Only admins can access this page
  const isAdmin = user?.isAdmin;

  const fetchFlaggedMessages = async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const response = await sagaApi({
        service: "adminApi",
        method: "getFlaggedMessages",
        args: [pagination],
      });
      setFlaggedMessages(response?.messages || []);
    } catch (_error) {
      console.error("Error fetching flagged messages");
      alert("Failed to load flagged messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchFlaggedMessages();
    }
  }, [isAdmin, pagination.page]);

  const handleApproveMessage = async (messageId) => {
    const reason = prompt("Enter approval reason (optional):", "Approved by admin");
    if (reason === null) return;

    setActionInProgress(messageId);
    try {
      await sagaApi({
        service: "adminApi",
        method: "approveMessage",
        args: [messageId, { reason }],
      });
      alert("Message approved");
      fetchFlaggedMessages();
    } catch (_error) {
      alert("Error approving message");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    const sendWarning = window.confirm("Record violation and send warning to sender?");
    const reason = prompt("Deletion reason:", "Message violates policy");
    if (reason === null) return;

    setActionInProgress(messageId);
    try {
      await sagaApi({
        service: "adminApi",
        method: "deleteMessage",
        args: [messageId, { reason, sendWarning }],
      });
      alert(sendWarning ? "Message deleted and warning sent" : "Message deleted");
      fetchFlaggedMessages();
    } catch (_error) {
      alert("Error deleting message");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleWarnSender = async (messageId) => {
    const reason = prompt("Warning message:", "Your message violated our community guidelines");
    if (reason === null) return;

    setActionInProgress(messageId);
    try {
      await sagaApi({
        service: "adminApi",
        method: "warnMessageSender",
        args: [messageId, { reason }],
      });
      alert("Warning sent to sender");
      fetchFlaggedMessages();
    } catch (_error) {
      alert("Error sending warning");
    } finally {
      setActionInProgress(null);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <h1>Access Denied</h1>
        <p>Admin access required</p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "clamp(16px, 4vw, 32px)", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "24px", color: "#193325" }}>Message Moderation Queue</h1>

      {loading && <p style={{ textAlign: "center", color: "#666" }}>Loading flagged messages...</p>}

      {!loading && flaggedMessages.length === 0 && (
        <p style={{ textAlign: "center", color: "#999" }}>No flagged messages to review</p>
      )}

      {!loading && flaggedMessages.length > 0 && (
        <div>
          <p style={{ marginBottom: "16px", color: "#666" }}>
            Total flagged: {flaggedMessages.length}
          </p>

          {flaggedMessages.map((msg) => (
            <div
              key={msg._id}
              style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "16px",
                cursor: "pointer",
              }}
              onClick={() =>
                setExpandedMessage(expandedMessage === msg._id ? null : msg._id)
              }
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: "bold", color: "#193325" }}>
                    From: {msg.sender}
                  </p>
                  <p style={{ margin: "4px 0", color: "#666", fontSize: "14px" }}>
                    To: {msg.recipient}
                  </p>
                  <p style={{ margin: "4px 0", color: "#b42318", fontSize: "13px" }}>
                    Risk Score: {msg.aiAnalysisResult?.riskScore || 0}/100
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "12px", color: "#999" }}>
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {expandedMessage === msg._id && (
                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #e0e0e0" }}>
                  <div
                    style={{
                      background: "#f5f5f5",
                      padding: "12px",
                      borderRadius: "6px",
                      marginBottom: "16px",
                    }}
                  >
                    <p style={{ margin: 0, color: "#333", whiteSpace: "pre-wrap" }}>
                      {msg.content}
                    </p>
                  </div>

                  {msg.aiAnalysisResult && (
                    <div style={{ marginBottom: "16px", padding: "12px", background: "#f0f7ff", borderRadius: "6px" }}>
                      <h4 style={{ margin: "0 0 8px 0", color: "#0066cc" }}>AI Analysis</h4>
                      <p style={{ margin: "4px 0", fontSize: "13px" }}>
                        <strong>Reason:</strong> {msg.aiAnalysisResult.reason}
                      </p>
                      {msg.aiAnalysisResult.flaggedPatterns?.length > 0 && (
                        <div>
                          <strong style={{ fontSize: "13px" }}>Flagged Patterns:</strong>
                          <ul style={{ margin: "4px 0", fontSize: "13px", paddingLeft: "20px" }}>
                            {msg.aiAnalysisResult.flaggedPatterns.map((p, i) => (
                              <li key={i}>
                                {p.category}: {p.pattern}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => handleApproveMessage(msg._id)}
                      disabled={actionInProgress === msg._id}
                      style={{
                        background: "#2d8659",
                        color: "#fff",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        cursor: actionInProgress === msg._id ? "not-allowed" : "pointer",
                        fontSize: "13px",
                        opacity: actionInProgress === msg._id ? 0.7 : 1,
                      }}
                    >
                      {actionInProgress === msg._id ? "Processing..." : "✓ Approve"}
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      disabled={actionInProgress === msg._id}
                      style={{
                        background: "#b42318",
                        color: "#fff",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        cursor: actionInProgress === msg._id ? "not-allowed" : "pointer",
                        fontSize: "13px",
                        opacity: actionInProgress === msg._id ? 0.7 : 1,
                      }}
                    >
                      {actionInProgress === msg._id ? "Processing..." : "✕ Delete"}
                    </button>
                    <button
                      onClick={() => handleWarnSender(msg._id)}
                      disabled={actionInProgress === msg._id}
                      style={{
                        background: "#ff9800",
                        color: "#fff",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        cursor: actionInProgress === msg._id ? "not-allowed" : "pointer",
                        fontSize: "13px",
                        opacity: actionInProgress === msg._id ? 0.7 : 1,
                      }}
                    >
                      {actionInProgress === msg._id ? "Processing..." : "⚠ Warn Sender"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminModerationPage;
