import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { africanCountries } from "../data/africanCountries";
import useSagaApi from "../hooks/useSagaApi";
import useSubscriptionStatus from "../hooks/useSubscriptionStatus";
import { canAccessFeature } from "../utils/subscriptionHelper";

const MatchesPage = ({ title = "Matches" }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterFarmingArea, setFilterFarmingArea] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxDistanceKm, setMaxDistanceKm] = useState("");
  const sagaApi = useSagaApi();
  const { statusType: subscriptionStatusType, subscriptionLoading } =
    useSubscriptionStatus();
  const canViewMatches = canAccessFeature(subscriptionStatusType, "core");

  useEffect(() => {
    if (subscriptionLoading) {
      return;
    }

    if (!canViewMatches) {
      setLoading(false);
      setMatches([]);
      setError("");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const matchResponse = await sagaApi({
          service: "userApi",
          method: "getMatches",
          args: [
            {
              ...(filterCountry ? { country: filterCountry } : {}),
              ...(filterState ? { state: filterState } : {}),
              ...(filterService ? { service: filterService } : {}),
              ...(filterFarmingArea ? { farmingArea: filterFarmingArea } : {}),
              ...(minScore ? { minScore } : {}),
              ...(maxDistanceKm ? { maxDistanceKm } : {}),
            },
          ],
        });
        setMatches(matchResponse.data?.matches || []);
      } catch (err) {
        setError(err.response?.data?.error || "Unable to load matches");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    sagaApi,
    filterCountry,
    filterState,
    filterService,
    filterFarmingArea,
    minScore,
    maxDistanceKm,
    canViewMatches,
    subscriptionLoading,
  ]);

  if (loading || subscriptionLoading)
    return <div style={{ padding: "24px" }}>Loading...</div>;

  if (!canViewMatches) {
    return (
      <div
        style={{
          padding: "clamp(16px, 4vw, 32px)",
          textAlign: "center",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(24px, 4vw, 32px)",
            color: "#193325",
            marginBottom: "16px",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: "clamp(14px, 2vw, 16px)",
            color: "#666",
            marginBottom: "24px",
          }}
        >
          {subscriptionStatusType === "expired"
            ? "Your subscription has expired. Renew to continue accessing matches."
            : `You need an active subscription to view and connect with ${user?.profileType === "vendor" ? "farmers" : "vendors"}.`}
        </p>
        <button
          onClick={() => navigate("/pricing")}
          style={{
            background: "#2d8659",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "clamp(10px, 2vw, 14px) clamp(20px, 3vw, 32px)",
            fontSize: "clamp(14px, 2vw, 16px)",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#1f5f3d")}
          onMouseLeave={(e) => (e.target.style.background = "#2d8659")}
        >
          Subscribe Now
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1>{title}</h1>
      <p style={{ color: "#666" }}>
        {user?.profileType === "vendor"
          ? "View and connect with farmers who match your services."
          : "View and connect with vendors that match your needs."}
      </p>

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "12px",
          marginBottom: "8px",
          flexWrap: "wrap",
        }}
      >
        <select
          value={filterCountry}
          onChange={(event) => setFilterCountry(event.target.value)}
          style={{
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            minWidth: "220px",
          }}
        >
          <option value="">All Countries</option>
          {africanCountries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={filterState}
          onChange={(event) => setFilterState(event.target.value)}
          placeholder="Filter by state/region"
          style={{
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            minWidth: "220px",
          }}
        />
        {user?.profileType === "farmer" ? (
          <input
            type="text"
            value={filterService}
            onChange={(event) => setFilterService(event.target.value)}
            placeholder="Filter by vendor service"
            style={{
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              minWidth: "220px",
            }}
          />
        ) : (
          <input
            type="text"
            value={filterFarmingArea}
            onChange={(event) => setFilterFarmingArea(event.target.value)}
            placeholder="Filter by farming area"
            style={{
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              minWidth: "220px",
            }}
          />
        )}
        <input
          type="number"
          min="0"
          max="100"
          value={minScore}
          onChange={(event) => setMinScore(event.target.value)}
          placeholder="Minimum score"
          style={{
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            minWidth: "160px",
          }}
        />
        <input
          type="number"
          min="1"
          value={maxDistanceKm}
          onChange={(event) => setMaxDistanceKm(event.target.value)}
          placeholder="Max distance (km)"
          style={{
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            minWidth: "180px",
          }}
        />
        <button
          onClick={() => {
            setFilterCountry("");
            setFilterState("");
            setFilterService("");
            setFilterFarmingArea("");
            setMinScore("");
            setMaxDistanceKm("");
          }}
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            background: "#fff",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Clear Filters
        </button>
      </div>

      {error && <p style={{ color: "#c62828" }}>{error}</p>}

      {matches.length === 0 && (
        <p>No matches available yet. Complete your profile and check again.</p>
      )}

      {matches.length > 0 && (
        <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
          {matches.map((match) => (
            <div
              key={match._id}
              style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>
                Score: {match.matchScore ?? 0}% • Status: {match.status}
              </p>
              <p style={{ margin: "8px 0", color: "#555" }}>
                {match.userProfile?.bio || "No bio available"}
              </p>
              <button
                onClick={() =>
                  navigate("/messages", { state: { matchId: match._id } })
                }
                style={{
                  background: "#2d8659",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                Open Messages
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchesPage;
