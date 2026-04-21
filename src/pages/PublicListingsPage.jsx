import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ErrorDisplay from "../components/ErrorDisplay";
import { DEFAULT_MARKETPLACE_CURRENCY } from "../data/marketplaceOptions";
import useSagaApi from "../hooks/useSagaApi";
import {
  convertAmount,
  loadRatesForCurrencies,
} from "../utils/currencyConverter";
import "./PublicListingsPage.css";

const PublicListingsPage = () => {
  const sagaApi = useSagaApi();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [displayCurrency, setDisplayCurrency] = useState(
    DEFAULT_MARKETPLACE_CURRENCY,
  );
  const [ratesByBase, setRatesByBase] = useState({});
  const user = useSelector((state) => state.user.user);

  const isAuthenticated = !!localStorage.getItem("token");
  const currentUserId = user?._id || user?.id || "";

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await sagaApi({
        service: "userApi",
        method: "getPublicListings",
      });
      const list = response.data?.listings || [];
      setListings(list);

      const baseCurrencies = list.flatMap((listing) =>
        (listing.products || []).map((product) => product.currency || ""),
      );
      const rates = await loadRatesForCurrencies(baseCurrencies);
      setRatesByBase(rates);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load listings");
    } finally {
      setLoading(false);
    }
  }, [sagaApi]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const openMessageThread = async (listingId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const response = await sagaApi({
        service: "userApi",
        method: "createListingMessageContext",
        args: [listingId],
      });

      const matchId = response.data?.matchId;
      if (!matchId) {
        setError("Unable to start messaging thread");
        return;
      }

      navigate("/messages", { state: { matchId } });
    } catch (err) {
      setError(err.response?.data?.error || "Unable to start chat");
    }
  };

  const getLocationConfidenceMessage = (location) => {
    const confidence = location?.locationConfidence;
    if (confidence?.message) {
      return confidence.message;
    }

    return "Location confidence unavailable. Confirm exact pickup or delivery point in chat before payment.";
  };

  const getMapEmbedUrl = (location) => {
    const lat = Number(location?.latitude);
    const lng = Number(location?.longitude);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const bounds = `${lat - 0.05}%2C${lng - 0.05}%2C${lat + 0.05}%2C${lng + 0.05}`;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${bounds}&layer=mapnik&marker=${lat}%2C${lng}`;
    }

    const fallback = encodeURIComponent(
      [location?.location, location?.lga, location?.state, location?.country]
        .filter(Boolean)
        .join(", "),
    );

    if (!fallback) return "";
    return `https://www.openstreetmap.org/export/embed.html?bbox=3.2%2C6.3%2C3.6%2C6.7&layer=mapnik&search=${fallback}`;
  };

  const totalProductCount = useMemo(
    () =>
      listings.reduce(
        (total, listing) =>
          total +
          (Array.isArray(listing.products) ? listing.products.length : 0),
        0,
      ),
    [listings],
  );

  return (
    <>
      <div className="marketplace-dashboard-shell">
        <div className="public-listings-shell">
          <header className="public-listings-header dashboard-like">
            <div>
              <h2>Marketplace</h2>
              <p>
                Premium listings ranked by real activity. Browse now and start a
                conversation when you are ready.
              </p>
            </div>
            <label className="market-currency-select">
              Display prices in
              <select
                value={displayCurrency}
                onChange={(event) => setDisplayCurrency(event.target.value)}
              >
                {["NGN", "GHS", "KES", "UGX", "TZS", "ZAR", "USD", "EUR"].map(
                  (code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ),
                )}
              </select>
            </label>
          </header>

          <section className="market-stats-grid" aria-label="marketplace-stats">
            <article className="market-stat-card">
              <p>Total Listings</p>
              <h3>{listings.length}</h3>
            </article>
            <article className="market-stat-card">
              <p>Total Products</p>
              <h3>{totalProductCount}</h3>
            </article>
            <article className="market-stat-card">
              <p>Ranking Mode</p>
              <h3>Activity Score</h3>
            </article>
          </section>

          {loading && <p>Loading listings...</p>}
          {error && (
            <ErrorDisplay
              error={error}
              onRetry={fetchListings}
              showDismiss={false}
            />
          )}

          {!loading && listings.length === 0 && (
            <p className="empty-listings">
              No featured listings available right now.
            </p>
          )}

          <div className="public-listing-grid">
            {listings.map((listing, index) => {
              const ownListing =
                currentUserId &&
                String(currentUserId) === String(listing.owner_id);

              return (
                <article key={listing._id} className="public-listing-card">
                  <div className="public-listing-topbar">
                    <span className="rank-badge">Rank #{index + 1}</span>
                    {listing.featured && (
                      <span className="featured-badge">Featured</span>
                    )}
                  </div>

                  <h2>{listing.title}</h2>
                  <p className="listing-owner">
                    {listing.owner?.name} ({listing.owner?.profileType})
                  </p>
                  <p className="listing-description">{listing.description}</p>

                  <div className="listing-score">
                    Performance Score: {listing.ownerPerformanceScore}
                  </div>

                  <section className="listing-products">
                    <h3>Products</h3>
                    {listing.products.map((product, productIndex) => {
                      const conversion = convertAmount({
                        amount: product.price,
                        fromCurrency: product.currency,
                        toCurrency: displayCurrency,
                        ratesByBase,
                      });

                      return (
                        <div
                          key={`${listing._id}-${productIndex}`}
                          className="listing-product-item"
                        >
                          <div>
                            <strong>{product.name}</strong>
                            {product.category ? ` - ${product.category}` : ""}
                          </div>
                          <div>
                            {product.currency} {product.price}
                            {product.unit ? ` / ${product.unit}` : ""}
                          </div>
                          {conversion.converted && (
                            <div className="converted-price">
                              Approx. {displayCurrency}{" "}
                              {conversion.convertedAmount?.toFixed(2)}
                            </div>
                          )}
                          <div>Qty: {product.quantityAvailable}</div>
                          {product.description && (
                            <div>{product.description}</div>
                          )}
                          {!!product.images?.length && (
                            <div className="public-product-images">
                              {product.images
                                .slice(0, 3)
                                .map((image, imageIndex) => (
                                  <img
                                    key={`${listing._id}-${productIndex}-${imageIndex}`}
                                    src={image}
                                    alt={product.name}
                                  />
                                ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </section>

                  <div className="listing-card-actions">
                    <button
                      type="button"
                      onClick={() => openMessageThread(listing._id)}
                      disabled={!!ownListing}
                      title={
                        ownListing
                          ? "You cannot message your own listing"
                          : "Message seller"
                      }
                    >
                      {ownListing ? "Your Listing" : "Message"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLocation(listing.location)}
                    >
                      View Location
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {selectedLocation && (
        <div
          className="map-modal-overlay"
          onClick={() => setSelectedLocation(null)}
        >
          <div
            className="map-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="map-modal-header">
              <h3>Seller Location</h3>
              <button type="button" onClick={() => setSelectedLocation(null)}>
                Close
              </button>
            </div>
            <p>
              {[
                selectedLocation.location,
                selectedLocation.lga,
                selectedLocation.state,
                selectedLocation.country,
              ]
                .filter(Boolean)
                .join(", ") || "Location details unavailable"}
            </p>
            <p className="map-accuracy-note">
              {getLocationConfidenceMessage(selectedLocation)}
            </p>
            {getMapEmbedUrl(selectedLocation) ? (
              <iframe
                title="seller-location-map"
                src={getMapEmbedUrl(selectedLocation)}
                loading="lazy"
                className="map-embed"
              />
            ) : (
              <p>
                Map preview unavailable because coordinates were not provided.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PublicListingsPage;
