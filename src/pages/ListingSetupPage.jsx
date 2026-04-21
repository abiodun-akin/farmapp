import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorDisplay from "../components/ErrorDisplay";
import useSagaApi from "../hooks/useSagaApi";

const ListingSetupPage = () => {
  const sagaApi = useSagaApi();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadListing = useCallback(async () => {
    setLoading(true);
    try {
      const response = await sagaApi({
        service: "userApi",
        method: "getMyListing",
      });
      const current = response.data?.listing || null;
      setListing(current);
      setTitle(current?.title || "");
      setDescription(current?.description || "");
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load listing setup");
    } finally {
      setLoading(false);
    }
  }, [sagaApi]);

  useEffect(() => {
    loadListing();
  }, [loadListing]);

  const handleSave = async () => {
    if (!String(title || "").trim()) {
      setError("Listing title is required");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        title: String(title || "").trim(),
        description: String(description || "").trim(),
      };

      if (listing?._id) {
        await sagaApi({
          service: "userApi",
          method: "updateMyListing",
          args: [listing._id, payload],
        });
      } else {
        await sagaApi({
          service: "userApi",
          method: "createMyListing",
          args: [payload],
        });
      }

      setSuccess("Listing details saved. You can now add products.");
      await loadListing();
    } catch (err) {
      setError(err.response?.data?.error || "Could not save listing details");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ padding: 24 }}>Loading listing setup...</p>;
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}>
      <h1>Listing Setup</h1>
      <p>
        Create your listing profile first. Product upload is available next.
      </p>

      {error && (
        <ErrorDisplay error={error} onRetry={loadListing} showDismiss={false} />
      )}
      {success && (
        <p style={{ color: "#166534", fontWeight: 600 }}>{success}</p>
      )}

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Listing Title (unique)
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Example: Green Valley Farm Produce"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Listing Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Briefly describe your offering"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            border: "none",
            borderRadius: 8,
            background: "#2d8659",
            color: "#fff",
            padding: "10px 14px",
            cursor: "pointer",
          }}
        >
          {saving ? "Saving..." : "Save Listing Details"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/my-listing/products")}
          disabled={!listing?._id}
          style={{
            border: "1px solid #2d8659",
            borderRadius: 8,
            background: listing?._id ? "#fff" : "#f3f4f6",
            color: listing?._id ? "#2d8659" : "#9ca3af",
            padding: "10px 14px",
            cursor: listing?._id ? "pointer" : "not-allowed",
          }}
        >
          Continue to Product Upload
        </button>
      </div>
    </div>
  );
};

export default ListingSetupPage;
