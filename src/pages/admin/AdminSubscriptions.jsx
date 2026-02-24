import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import Pagination from "../../components/Pagination";
import { adminApi } from "../../api/adminApi";
import { exportToCSV } from "../../utils/csvExport";

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadSubscriptions = async (page = 1) => {
    try {
      setLoading(true);
      const response = await adminApi.getSubscriptionsCancelled({ 
        limit: 15, 
        page 
      });
      setSubscriptions(response.data.subscriptions || []);
      setCurrentPage(response.data.pagination.page);
      setTotalPages(response.data.pagination.pages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions(1);
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadSubscriptions(page);
    window.scrollTo(0, 0);
  };

  const handleExport = () => {
    const csv = subscriptions.map((sub) => ({
      Email: sub.email || "-",
      Plan: sub.plan,
      "Amount (NGN)": sub.amount,
      "Cancellation Reason": sub.cancellationReason || "-",
      "Cancelled Date": new Date(sub.updatedAt).toLocaleDateString(),
    }));
    exportToCSV(csv, `subscriptions-cancelled-${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <AdminLayout title="Cancelled Subscriptions">
      <div className="admin-card" style={{ marginBottom: "16px" }}>
        <button 
          className="admin-button"
          onClick={handleExport}
          disabled={subscriptions.length === 0}
        >
          Export CSV
        </button>
      </div>

      <div className="admin-card">
        {loading && <div>Loading cancellations...</div>}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 && !loading && (
              <tr>
                <td colSpan="5">No cancelled subscriptions</td>
              </tr>
            )}
            {subscriptions.map((sub) => (
              <tr key={sub._id}>
                <td>{sub.email || "-"}</td>
                <td>{sub.plan}</td>
                <td>{sub.amount}</td>
                <td>{sub.cancellationReason || "-"}</td>
                <td>{new Date(sub.updatedAt).toLocaleDateString()}</td>
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

export default AdminSubscriptions;
