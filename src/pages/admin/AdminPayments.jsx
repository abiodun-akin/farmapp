import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import Pagination from "../../components/Pagination";
import { adminApi } from "../../api/adminApi";
import { exportToCSV, preparePaymentsForCSV } from "../../utils/csvExport";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const loadPayments = async (page = 1, filterStatus = "all", searchTerm = "") => {
    try {
      setLoading(true);
      const response = await adminApi.getPayments({
        status: filterStatus,
        search: searchTerm,
        page,
        limit: 15,
      });
      setPayments(response.data.payments || []);
      setCurrentPage(response.data.pagination.page);
      setTotalPages(response.data.pagination.pages);
      setError(null);
    } catch (err) {
      setError("Unable to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments(1, status, search);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPayments(1, status, search);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setCurrentPage(1);
    loadPayments(1, newStatus, search);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadPayments(page, status, search);
    window.scrollTo(0, 0);
  };

  const handleExport = () => {
    const csv = preparePaymentsForCSV(payments);
    exportToCSV(csv, `payments-export-${new Date().toISOString().split("T")[0]}`);
  };

  const getStatusColor = (status) => {
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

  return (
    <AdminLayout title="Payment Management">
      <form onSubmit={handleSearch} className="admin-card">
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            className="admin-input"
            placeholder="Search by reference or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="admin-button primary" type="submit">
            Search
          </button>
        </div>
      </form>

      <div className="admin-card">
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
          <button
            className={`admin-button ${status === "all" ? "primary" : ""}`}
            onClick={() => handleStatusChange("all")}
          >
            All
          </button>
          <button
            className={`admin-button ${status === "pending" ? "primary" : ""}`}
            onClick={() => handleStatusChange("pending")}
          >
            Pending
          </button>
          <button
            className={`admin-button ${status === "success" ? "primary" : ""}`}
            onClick={() => handleStatusChange("success")}
          >
            Successful
          </button>
          <button
            className={`admin-button ${status === "verified" ? "primary" : ""}`}
            onClick={() => handleStatusChange("verified")}
          >
            Verified
          </button>
          <button
            className={`admin-button ${status === "failed" ? "primary" : ""}`}
            onClick={() => handleStatusChange("failed")}
          >
            Failed
          </button>
          <button
            className={`admin-button ${status === "refunded" ? "primary" : ""}`}
            onClick={() => handleStatusChange("refunded")}
          >
            Refunded
          </button>
          <button
            className="admin-button"
            onClick={handleExport}
            disabled={payments.length === 0}
            style={{ marginLeft: "auto" }}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="admin-card">
        {loading && <div>Loading payments...</div>}
        {error && <div style={{ color: "#e84848" }}>{error}</div>}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && !loading && (
              <tr>
                <td colSpan="7">No payments found</td>
              </tr>
            )}
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td style={{ fontSize: "12px", fontFamily: "monospace" }}>
                  {payment.reference.substring(0, 20)}...
                </td>
                <td>{payment.email}</td>
                <td>{payment.plan}</td>
                <td>₦{payment.amount.toLocaleString()}</td>
                <td>
                  <span className={`admin-pill ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </td>
                <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="admin-button"
                    onClick={() => navigate(`/admin/payments/${payment._id}`)}
                  >
                    View
                  </button>
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

export default AdminPayments;
