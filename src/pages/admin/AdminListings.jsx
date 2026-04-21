import { useCallback, useEffect, useState } from "react";
import ErrorDisplay from "../../components/ErrorDisplay";
import Pagination from "../../components/Pagination";
import useSagaApi from "../../hooks/useSagaApi";
import AdminLayout from "./AdminLayout";

const STATUS_OPTIONS = ["all", "enabled", "suspended", "disabled"];
const ACTION_OPTIONS = ["enable", "unsuspend", "disable", "suspend"];

const AdminListings = () => {
  const sagaApi = useSagaApi();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionTarget, setActionTarget] = useState("");

  const loadListings = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const response = await sagaApi({
          service: "adminApi",
          method: "getListings",
          args: [
            {
              page,
              limit: 10,
              search,
              moderationStatus: statusFilter,
            },
          ],
        });

        setListings(response.data?.listings || []);
        setCurrentPage(response.data?.pagination?.page || 1);
        setTotalPages(response.data?.pagination?.pages || 1);
        setError("");
      } catch (err) {
        setError(err?.response?.data?.error || "Unable to load listings");
      } finally {
        setLoading(false);
      }
    },
    [sagaApi, search, statusFilter],
  );

  useEffect(() => {
    loadListings(1);
  }, [loadListings]);

  const promptReasonIfNeeded = (action) => {
    if (action === "enable" || action === "unsuspend") {
      return "";
    }

    return (
      window.prompt(
        `Enter reason to ${action} this item:`,
        "Policy violation or moderation decision",
      ) || ""
    );
  };

  const moderateListing = async (listingId, action) => {
    const reason = promptReasonIfNeeded(action);
    setActionTarget(`listing-${listingId}`);

    try {
      await sagaApi({
        service: "adminApi",
        method: "moderateListing",
        args: [listingId, { action, reason }],
      });
      await loadListings(currentPage);
    } catch (err) {
      setError(
        err?.response?.data?.error || "Unable to update listing moderation",
      );
    } finally {
      setActionTarget("");
    }
  };

  const moderateProduct = async (listingId, productIndex, action) => {
    const reason = promptReasonIfNeeded(action);
    setActionTarget(`product-${listingId}-${productIndex}`);

    try {
      await sagaApi({
        service: "adminApi",
        method: "moderateProduct",
        args: [listingId, productIndex, { action, reason }],
      });
      await loadListings(currentPage);
    } catch (err) {
      setError(
        err?.response?.data?.error || "Unable to update product moderation",
      );
    } finally {
      setActionTarget("");
    }
  };

  return (
    <AdminLayout title="Listings & Products">
      <div className="admin-card">
        <div
          className="admin-actions"
          style={{ justifyContent: "space-between", flexWrap: "wrap" }}
        >
          <input
            className="admin-input"
            placeholder="Search title, description, product"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ minWidth: "280px" }}
          />
          <select
            className="admin-input"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            className="admin-button primary"
            onClick={() => loadListings(1)}
          >
            Apply Filters
          </button>
        </div>
      </div>

      {error && (
        <ErrorDisplay
          error={error}
          onRetry={() => loadListings(currentPage)}
          showDismiss={false}
        />
      )}

      <div className="admin-card">
        {loading ? (
          <p>Loading listings...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Products</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.length === 0 && (
                <tr>
                  <td colSpan="5">No listings found</td>
                </tr>
              )}
              {listings.map((listing) => (
                <tr key={listing._id}>
                  <td>
                    <strong>{listing.title}</strong>
                    <div>{listing.ownerProfileType}</div>
                  </td>
                  <td>
                    <div>{listing.owner?.name || "-"}</div>
                    <div>{listing.owner?.email || "-"}</div>
                  </td>
                  <td>
                    <div className="admin-pill">{listing.moderationStatus}</div>
                    <div style={{ marginTop: "6px" }}>
                      {listing.moderationReason || "No reason set"}
                    </div>
                  </td>
                  <td>
                    <div>
                      {listing.activeProductCount}/{listing.productCount} active
                    </div>
                    <details style={{ marginTop: "8px" }}>
                      <summary>Products</summary>
                      <div
                        style={{
                          marginTop: "8px",
                          display: "grid",
                          gap: "8px",
                        }}
                      >
                        {(listing.products || []).map((product) => (
                          <div
                            key={`${listing._id}-${product.index}`}
                            style={{
                              border: "1px solid rgba(246, 196, 83, 0.2)",
                              borderRadius: "8px",
                              padding: "8px",
                            }}
                          >
                            <div>
                              <strong>{product.name}</strong> (
                              {product.moderationStatus})
                            </div>
                            <div>
                              {product.currency} {product.price} | Qty{" "}
                              {product.quantityAvailable}
                            </div>
                            <div
                              className="admin-actions"
                              style={{ marginTop: "6px" }}
                            >
                              {ACTION_OPTIONS.map((action) => (
                                <button
                                  key={`${listing._id}-${product.index}-${action}`}
                                  className={`admin-button ${action === "disable" || action === "suspend" ? "danger" : "primary"}`}
                                  disabled={
                                    actionTarget ===
                                    `product-${listing._id}-${product.index}`
                                  }
                                  onClick={() =>
                                    moderateProduct(
                                      listing._id,
                                      product.index,
                                      action,
                                    )
                                  }
                                >
                                  {action}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </td>
                  <td>
                    <div className="admin-actions" style={{ flexWrap: "wrap" }}>
                      {ACTION_OPTIONS.map((action) => (
                        <button
                          key={`${listing._id}-${action}`}
                          className={`admin-button ${action === "disable" || action === "suspend" ? "danger" : "primary"}`}
                          disabled={actionTarget === `listing-${listing._id}`}
                          onClick={() => moderateListing(listing._id, action)}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => loadListings(page)}
        loading={loading}
      />
    </AdminLayout>
  );
};

export default AdminListings;
