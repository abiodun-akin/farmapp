import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import Pagination from "../../components/Pagination";
import { adminApi } from "../../api/adminApi";
import { exportToCSV, prepareMessagesForCSV } from "../../utils/csvExport";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadMessages = async (page = 1) => {
    try {
      setLoading(true);
      const response = await adminApi.getFlaggedMessages({ 
        limit: 15, 
        page 
      });
      setMessages(response.data.messages || []);
      setCurrentPage(response.data.pagination.page);
      setTotalPages(response.data.pagination.pages);
      setError(null);
    } catch (err) {
      setError("Unable to load flagged messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages(1);
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadMessages(page);
    window.scrollTo(0, 0);
  };

  const handleAction = async (messageId, action) => {
    try {
      await adminApi.approveMessage(messageId, action);
      loadMessages(currentPage);
    } catch (err) {
      setError("Unable to update message status");
    }
  };

  const handleExport = () => {
    const csv = prepareMessagesForCSV(messages);
    exportToCSV(csv, `flagged-messages-${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <AdminLayout title="Flagged Messages">
      <div className="admin-card" style={{ marginBottom: "16px" }}>
        <button 
          className="admin-button"
          onClick={handleExport}
          disabled={messages.length === 0}
        >
          Export CSV
        </button>
      </div>

      <div className="admin-card">
        {loading && <div>Loading messages...</div>}
        {error && <div>{error}</div>}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sender</th>
              <th>Recipient</th>
              <th>Reason</th>
              <th>Risk</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 && !loading && (
              <tr>
                <td colSpan="5">No flagged messages</td>
              </tr>
            )}
            {messages.map((msg) => (
              <tr key={msg._id}>
                <td>{msg.sender || "Unknown"}</td>
                <td>{msg.recipient || "Unknown"}</td>
                <td>{msg.flagReason || "-"}</td>
                <td>{msg.aiAnalysisResult?.riskScore || 0}</td>
                <td>
                  <div className="admin-actions">
                    <button
                      className="admin-button primary"
                      onClick={() => handleAction(msg._id, "approve")}
                    >
                      Approve
                    </button>
                    <button
                      className="admin-button danger"
                      onClick={() => handleAction(msg._id, "reject")}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </AdminLayout>
  );
};

export default AdminMessages;
