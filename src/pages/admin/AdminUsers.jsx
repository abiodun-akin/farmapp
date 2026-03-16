import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import Pagination from "../../components/Pagination";
import { exportToCSV, prepareUsersForCSV } from "../../utils/csvExport";
import useSagaApi from "../../hooks/useSagaApi";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const sagaApi = useSagaApi();

  const loadUsers = useCallback(async (page = 1, searchTerm = "", sort = "createdAt") => {
    try {
      setLoading(true);
      const response = await sagaApi({
        service: "adminApi",
        method: "getUsers",
        args: [
          {
            search: searchTerm,
            page,
            sortBy: sort,
            limit: 15,
          },
        ],
      });
      setUsers(response.data.users || []);
      setCurrentPage(response.data.pagination.page);
      setTotalPages(response.data.pagination.pages);
      setError(null);
    } catch {
      setError("Unable to load users");
    } finally {
      setLoading(false);
    }
  }, [sagaApi]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers(1, search, sortBy);
  };

  const handleSort = (value) => {
    setSortBy(value);
    setCurrentPage(1);
    loadUsers(1, search, value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadUsers(page, search, sortBy);
    window.scrollTo(0, 0);
  };

  const handleExport = () => {
    const csv = prepareUsersForCSV(users);
    exportToCSV(csv, `users-export-${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <AdminLayout title="User Management">
      <form onSubmit={handleSearch} className="admin-card">
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            className="admin-input"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="admin-button primary" type="submit">
            Search
          </button>
          <select 
            className="admin-input"
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
          >
            <option value="createdAt">Newest</option>
            <option value="-createdAt">Oldest</option>
            <option value="activityScore">Activity Score</option>
            <option value="lastLogin">Last Login</option>
          </select>
          <button 
            className="admin-button"
            type="button"
            onClick={handleExport}
            disabled={users.length === 0}
          >
            Export CSV
          </button>
        </div>
      </form>

      <div className="admin-card">
        {loading && <div>Loading users...</div>}
        {error && <div>{error}</div>}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Score</th>
              <th>Risk</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan="6">No users found</td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name || "-"}</td>
                <td>{user.email}</td>
                <td>{user.activityScore}</td>
                <td>
                  <span
                    className={`admin-pill ${
                      user.riskLevel?.toLowerCase() || "low"
                    }`}
                  >
                    {user.riskLevel || "UNKNOWN"}
                  </span>
                </td>
                <td>{user.isSuspended ? "Suspended" : "Active"}</td>
                <td>
                  <button
                    className="admin-button"
                    onClick={() => navigate(`/admin/users/${user._id}`)}
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

export default AdminUsers;
