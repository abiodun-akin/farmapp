import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ErrorDisplay from "../components/ErrorDisplay";
import { africanCountries } from "../data/africanCountries";
import { nigerianStates } from "../data/nigerianGeoData";
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
  const [expressInterestLoading, setExpressInterestLoading] = useState({});
  const debounceTimerRef = useRef(null);
  const sagaApi = useSagaApi();
  const { statusType: subscriptionStatusType, subscriptionLoading } =
    useSubscriptionStatus();
  const canViewMatches = canAccessFeature(subscriptionStatusType, "core");

  // Debounced fetch function
  const fetchMatches = (
    country,
    state,
    service,
    farmingArea,
    score,
    distance,
  ) => {
    if (subscriptionLoading || !canViewMatches) return;

    setLoading(true);
    sagaApi({
      service: "userApi",
      method: "getMatches",
      args: [
        {
          ...(country ? { country } : {}),
          ...(state ? { state } : {}),
          ...(service ? { service } : {}),
          ...(farmingArea ? { farmingArea } : {}),
          ...(score ? { minScore: score } : {}),
          ...(distance ? { maxDistanceKm: distance } : {}),
        },
      ],
    })
      .then((matchResponse) => {
        setMatches(matchResponse.data?.matches || []);
        setError("");
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Unable to load matches");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Initial load
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

    fetchMatches(
      filterCountry,
      filterState,
      filterService,
      filterFarmingArea,
      minScore,
      maxDistanceKm,
    );
  }, [subscriptionLoading, canViewMatches]);

  // Debounced filter updates
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchMatches(
        filterCountry,
        filterState,
        filterService,
        filterFarmingArea,
        minScore,
        maxDistanceKm,
      );
    }, 500); // 500ms debounce delay

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    filterCountry,
    filterState,
    filterService,
    filterFarmingArea,
    minScore,
    maxDistanceKm,
    sagaApi,
    subscriptionLoading,
    canViewMatches,
  ]);

  // Handle express interest in a match
  const handleExpressInterest = async (matchId) => {
    try {
      setExpressInterestLoading((prev) => ({ ...prev, [matchId]: true }));
      const response = await sagaApi({
        service: "userApi",
        method: "expressInterest",
        args: [matchId],
      });

      // Update the match in the local state
      setMatches((prev) =>
        prev.map((match) =>
          match._id === matchId ? { ...match, status: "interested" } : match,
        ),
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to express interest. Please try again.",
      );
    } finally {
      setExpressInterestLoading((prev) => ({ ...prev, [matchId]: false }));
    }
  };

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
    <div
      style={{
        padding: "clamp(16px, 4vw, 24px)",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "clamp(20px, 4vw, 28px)" }}>{title}</h1>
      <p style={{ color: "#666", fontSize: "clamp(13px, 2vw, 14px)" }}>
        {user?.profileType === "vendor"
          ? "View and connect with farmers who match your services."
          : "View and connect with vendors that match your needs."}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "8px",
          marginTop: "12px",
          marginBottom: "16px",
        }}
      >
        <select
          value={filterCountry}
          onChange={(event) => {
            event.preventDefault();
            setFilterCountry(event.target.value);
            // Reset state filter when country changes
            if (event.target.value !== "Nigeria") {
              setFilterState("");
            }
          }}
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "clamp(12px, 1.5vw, 14px)",
            backgroundColor: "#fff",
            cursor: "pointer",
          }}
        >
          <option value="">All Countries</option>
          {africanCountries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        {filterCountry === "Nigeria" ? (
          <select
            value={filterState}
            onChange={(event) => setFilterState(event.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "clamp(12px, 1.5vw, 14px)",
              backgroundColor: "#fff",
              cursor: "pointer",
            }}
          >
            <option value="">All States</option>
            {nigerianStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={filterState}
            onChange={(event) => setFilterState(event.target.value)}
            placeholder="State/region"
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "clamp(12px, 1.5vw, 14px)",
            }}
          />
        )}
        {user?.profileType === "farmer" ? (
          <input
            type="text"
            value={filterService}
            onChange={(event) => setFilterService(event.target.value)}
            placeholder="Vendor service"
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "clamp(12px, 1.5vw, 14px)",
            }}
          />
        ) : (
          <input
            type="text"
            value={filterFarmingArea}
            onChange={(event) => setFilterFarmingArea(event.target.value)}
            placeholder="Farming area"
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "clamp(12px, 1.5vw, 14px)",
            }}
          />
        )}
        <input
          type="number"
          min="0"
          max="100"
          value={minScore}
          onChange={(event) => setMinScore(event.target.value)}
          placeholder="Min score"
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "clamp(12px, 1.5vw, 14px)",
          }}
        />
        <input
          type="number"
          min="1"
          value={maxDistanceKm}
          onChange={(event) => setMaxDistanceKm(event.target.value)}
          placeholder="Max dist (km)"
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            fontSize: "clamp(12px, 1.5vw, 14px)",
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
            background: "#f5f5f5",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "clamp(12px, 1.5vw, 14px)",
            fontWeight: 500,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#e0e0e0")}
          onMouseLeave={(e) => (e.target.style.background = "#f5f5f5")}
        >
          Clear
        </button>
      </div>

      {error && (
        <ErrorDisplay
          error={error}
          onRetry={() => window.location.reload()}
          showDismiss={false}
        />
      )}

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
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {match.status === "potential" ? (
                  <button
                    onClick={() => handleExpressInterest(match._id)}
                    disabled={expressInterestLoading[match._id]}
                    style={{
                      background: "#4CAF50",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      cursor: expressInterestLoading[match._id]
                        ? "wait"
                        : "pointer",
                      opacity: expressInterestLoading[match._id] ? 0.6 : 1,
                      transition: "all 0.2s ease",
                      flex: 1,
                      minWidth: "150px",
                    }}
                    onMouseEnter={(e) => {
                      if (!expressInterestLoading[match._id]) {
                        e.target.style.background = "#45a049";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!expressInterestLoading[match._id]) {
                        e.target.style.background = "#4CAF50";
                      }
                    }}
                  >
                    {expressInterestLoading[match._id]
                      ? "Expressing Interest..."
                      : "Express Interest"}
                  </button>
                ) : (
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
                      flex: 1,
                      minWidth: "150px",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.background = "#1f5f3d")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.background = "#2d8659")
                    }
                  >
                    Open Messages
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchesPage;
