import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import Pagination from "../../components/Pagination";
import { adminApi } from "../../api/adminApi";

const AdminPaymentAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  useEffect(() => {
    loadPendingPayments(currentPage);
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const statsRes = await adminApi.getPaymentStats();
      const dailyRes = await adminApi.getPaymentDailyStats(days);

      setStats(statsRes.data);
      setDailyStats(dailyRes.data.dailyStats);
      setError(null);
    } catch (err) {
      setError("Unable to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingPayments = async (page = 1) => {
    try {
      const response = await adminApi.getPendingPayments({
        limit: 10,
        page,
      });
      setPendingPayments(response.data.payments || []);
      setCurrentPage(response.data.pagination.page);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      console.error("Unable to load pending payments");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadPendingPayments(page);
  };

  if (loading) {
    return <AdminLayout title="Payment Analytics">Loading...</AdminLayout>;
  }

  return (
    <AdminLayout title="Payment Analytics">
      {error && <div className="admin-card">{error}</div>}

      {stats && (
        <>
          <div className="admin-grid">
            <div className="admin-card">
              <h3>Total Revenue</h3>
              <p style={{ fontSize: "28px", fontWeight: 700 }}>
                ₦{(stats.overview.totalRevenue || 0).toLocaleString()}
              </p>
              <p style={{ fontSize: "12px", margin: "8px 0 0 0", color: "var(--admin-muted)" }}>
                {stats.statsByStatus.reduce((sum, s) => sum + (s.count || 0), 0)} total payments
              </p>
            </div>

            <div className="admin-card">
              <h3>Successful Payments</h3>
              <p style={{ fontSize: "28px", fontWeight: 700 }}>
                {stats.overview.successfulPayments}
              </p>
              <p style={{ fontSize: "12px", margin: "8px 0 0 0", color: "var(--admin-muted)" }}>
                {stats.overview.successRate}% success rate
              </p>
            </div>

            <div className="admin-card">
              <h3>Pending Payments</h3>
              <p style={{ fontSize: "28px", fontWeight: 700 }}>
                {stats.overview.pendingPayments}
              </p>
              <p style={{ fontSize: "12px", margin: "8px 0 0 0", color: "var(--admin-muted)" }}>
                Awaiting verification
              </p>
            </div>

            <div className="admin-card">
              <h3>Refunded</h3>
              <p style={{ fontSize: "28px", fontWeight: 700 }}>
                ₦{(stats.overview.refundedAmount || 0).toLocaleString()}
              </p>
              <p style={{ fontSize: "12px", margin: "8px 0 0 0", color: "var(--admin-muted)" }}>
                Total refunded amount
              </p>
            </div>
          </div>

          <div className="admin-card">
            <h3>Payment Status Breakdown</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Total Amount</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {stats.statsByStatus && stats.statsByStatus.length > 0 ? (
                  stats.statsByStatus.map((item, idx) => {
                    const total = stats.statsByStatus.reduce((sum, s) => sum + s.count, 0);
                    const percentage = ((item.count / total) * 100).toFixed(1);
                    return (
                      <tr key={idx}>
                        <td style={{ textTransform: "capitalize" }}>{item._id}</td>
                        <td>{item.count}</td>
                        <td>₦{(item.totalAmount || 0).toLocaleString()}</td>
                        <td>{percentage}%</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-card">
            <h3>Revenue by Plan</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Transactions</th>
                  <th>Revenue</th>
                  <th>Avg. Transaction</th>
                </tr>
              </thead>
              <tbody>
                {stats.revenueByPlan && stats.revenueByPlan.length > 0 ? (
                  stats.revenueByPlan.map((plan, idx) => (
                    <tr key={idx}>
                      <td style={{ textTransform: "capitalize" }}>{plan._id}</td>
                      <td>{plan.count}</td>
                      <td>₦{(plan.revenue || 0).toLocaleString()}</td>
                      <td>₦{((plan.revenue || 0) / plan.count).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-card">
            <div style={{ marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Daily Revenue</h3>
              <select 
                className="admin-input"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                style={{ width: "auto" }}
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
              </select>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transactions</th>
                  <th>Successful</th>
                  <th>Failed</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {dailyStats && dailyStats.length > 0 ? (
                  dailyStats.map((day, idx) => (
                    <tr key={idx}>
                      <td>{day._id}</td>
                      <td>{day.count}</td>
                      <td style={{ color: "var(--admin-accent-2)" }}>{day.successful}</td>
                      <td style={{ color: "var(--admin-accent)" }}>{day.failed}</td>
                      <td>₦{(day.revenue || 0).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No data available for this period</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="admin-card">
        <h3>Pending Payments (Needs Review)</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Hours Old</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {pendingPayments && pendingPayments.length > 0 ? (
              pendingPayments.map((payment) => (
                <tr key={payment._id}>
                  <td>{payment.email}</td>
                  <td>{payment.plan}</td>
                  <td>₦{payment.amount.toLocaleString()}</td>
                  <td>
                    {payment.hoursOld > 24 ? (
                      <span style={{ color: "var(--admin-accent)" }}>
                        {Math.floor(payment.hoursOld / 24)} days
                      </span>
                    ) : (
                      payment.hoursOld + " hrs"
                    )}
                  </td>
                  <td>{new Date(payment.createdAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No pending payments</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pendingPayments && pendingPayments.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          loading={false}
        />
      )}
    </AdminLayout>
  );
};

export default AdminPaymentAnalytics;
