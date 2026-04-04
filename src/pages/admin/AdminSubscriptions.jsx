import { useCallback, useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import useSagaApi from "../../hooks/useSagaApi";
import { exportToCSV } from "../../utils/csvExport";
import AdminLayout from "./AdminLayout";

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [targetUserId, setTargetUserId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userOptions, setUserOptions] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [downgradeReason, setDowngradeReason] = useState("");
  const [downgradeMode, setDowngradeMode] = useState("immediate");
  const [downgradeMsg, setDowngradeMsg] = useState(null);
  const sagaApi = useSagaApi();

  const loadSubscriptions = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const response = await sagaApi({
          service: "adminApi",
          method: "getSubscriptionsCancelled",
          args: [{ limit: 15, page }],
        });
        setSubscriptions(response.data.subscriptions || []);
        setCurrentPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.pages);
      } finally {
        setLoading(false);
      }
    },
    [sagaApi],
  );

  useEffect(() => {
    loadSubscriptions(1);
  }, [loadSubscriptions]);

  useEffect(() => {
    let active = true;
    const searchTerm = userSearch.trim();

    if (searchTerm.length < 2) {
      setUserOptions([]);
      return () => {
        active = false;
      };
    }

    const timeoutId = setTimeout(async () => {
      try {
        setSearchingUsers(true);
        const response = await sagaApi({
          service: "adminApi",
          method: "getUsers",
          args: [{ search: searchTerm, limit: 8, page: 1 }],
        });

        if (!active) {
          return;
        }

        const users = response?.data?.users || [];
        setUserOptions(users);
      } catch {
        if (active) {
          setUserOptions([]);
        }
      } finally {
        if (active) {
          setSearchingUsers(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [sagaApi, userSearch]);

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
    exportToCSV(
      csv,
      `subscriptions-cancelled-${new Date().toISOString().split("T")[0]}`,
    );
  };

  const handleManualDowngrade = async () => {
    setDowngradeMsg(null);

    if (!targetUserId.trim()) {
      setDowngradeMsg({ type: "error", text: "User ID is required" });
      return;
    }

    try {
      const response = await sagaApi({
        service: "adminApi",
        method: "manualDowngradeSubscription",
        args: [
          targetUserId.trim(),
          {
            immediate: downgradeMode === "immediate",
            reason: downgradeReason || "Admin manual downgrade",
          },
        ],
      });

      setDowngradeMsg({
        type: "success",
        text: response?.data?.message || "Manual downgrade completed",
      });
      loadSubscriptions(currentPage);
    } catch (error) {
      setDowngradeMsg({
        type: "error",
        text:
          error?.response?.data?.error || "Unable to process manual downgrade",
      });
    }
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

      <div className="admin-card" style={{ marginBottom: "16px" }}>
        <h3>Manual Downgrade</h3>
        {downgradeMsg && (
          <div
            className={`admin-pill ${downgradeMsg.type === "error" ? "high" : "low"}`}
            style={{ marginBottom: 12 }}
          >
            {downgradeMsg.text}
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <input
            className="admin-input"
            placeholder="Search user by email or name"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            style={{ minWidth: 280 }}
          />
          <input
            className="admin-input"
            placeholder="Target User ID"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            style={{ minWidth: 280 }}
          />
          <select
            className="admin-input"
            value={downgradeMode}
            onChange={(e) => setDowngradeMode(e.target.value)}
            style={{ minWidth: 180 }}
          >
            <option value="immediate">Downgrade Now</option>
            <option value="scheduled">Schedule at End Date</option>
          </select>
          <input
            className="admin-input"
            placeholder="Reason (optional)"
            value={downgradeReason}
            onChange={(e) => setDowngradeReason(e.target.value)}
            style={{ minWidth: 300 }}
          />
          <button
            className="admin-button danger"
            onClick={handleManualDowngrade}
          >
            Apply
          </button>
        </div>
        {(searchingUsers || userOptions.length > 0) && (
          <div style={{ marginTop: 10 }}>
            {searchingUsers && (
              <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>
                Searching users...
              </p>
            )}
            {userOptions.map((u) => (
              <button
                key={u._id}
                type="button"
                className="admin-button"
                style={{ marginRight: 8, marginTop: 8 }}
                onClick={() => {
                  setTargetUserId(u._id);
                  setUserSearch(u.email || u.name || "");
                }}
              >
                {u.email || u.name || "User"} ({u._id})
              </button>
            ))}
          </div>
        )}
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
