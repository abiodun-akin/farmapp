import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import Pagination from "../../components/Pagination";
import { adminApi } from "../../api/adminApi";
import { exportToCSV, prepareViolationsForCSV } from "../../utils/csvExport";

const AdminViolations = () => {
  const [violations, setViolations] = useState([]);
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadViolations = async (selectedType, page = 1) => {
    try {
      setLoading(true);
      const response = await adminApi.getViolations({ 
        type: selectedType,
        page,
        limit: 15
      });
      setViolations(response.data.violations || []);
      setCurrentPage(response.data.pagination.page);
      setTotalPages(response.data.pagination.pages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadViolations(type, 1);
  }, [type]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadViolations(type, page);
    window.scrollTo(0, 0);
  };

  const handleExport = () => {
    const csv = prepareViolationsForCSV(violations);
    exportToCSV(csv, `violations-export-${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <AdminLayout title="Violations">
      <div className="admin-card">
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
          <button 
            className={`admin-button ${type === "all" ? "primary" : ""}`}
            onClick={() => {
              setType("all");
              setCurrentPage(1);
            }}
          >
            All
          </button>
          <button
            className={`admin-button ${type === "payment" ? "primary" : ""}`}
            onClick={() => {
              setType("payment");
              setCurrentPage(1);
            }}
          >
            Payment
          </button>
          <button
            className={`admin-button ${type === "flagged_messages" ? "primary" : ""}`}
            onClick={() => {
              setType("flagged_messages");
              setCurrentPage(1);
            }}
          >
            Flagged Messages
          </button>
          <button
            className={`admin-button ${type === "suspended" ? "primary" : ""}`}
            onClick={() => {
              setType("suspended");
              setCurrentPage(1);
            }}
          >
            Suspended
          </button>
          <button 
            className="admin-button"
            onClick={handleExport}
            disabled={violations.length === 0}
            style={{ marginLeft: "auto" }}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="admin-card">
        {loading && <div>Loading violations...</div>}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Type</th>
              <th>Count</th>
              <th>Suspended</th>
            </tr>
          </thead>
          <tbody>
            {violations.length === 0 && !loading && (
              <tr>
                <td colSpan="4">No violations found</td>
              </tr>
            )}
            {violations.map((item) => (
              <tr key={`${item._id}-${item.violationType}`}>
                <td>{item.email}</td>
                <td>{item.violationType}</td>
                <td>{item.violationCount || item.flaggedMessageCount || 0}</td>
                <td>{item.isSuspended ? "Yes" : "No"}</td>
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

export default AdminViolations;
