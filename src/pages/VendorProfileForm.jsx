import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import ErrorDisplay from "../components/ErrorDisplay";
import { africanCountries } from "../data/africanCountries";
import {
  certifications,
  getLGAsForState,
  nigerianStates,
  vendorBusinessTypes,
  vendorInterests,
  yearsOfExperience,
} from "../data/nigerianGeoData";
import { useForm } from "../hooks/useForm";
import useSagaApi from "../hooks/useSagaApi";
import useSubscriptionStatus from "../hooks/useSubscriptionStatus";
import { setProfile } from "../redux/slices/userSlice";
import { canAccessFeature } from "../utils/subscriptionHelper";
import "./VendorProfileForm.css";

/**
 * Vendor Profile Form Component
 * Collects detailed vendor information with dropdown fields and geolocation
 */
const VendorProfileForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [customInterests, setCustomInterests] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const sagaApi = useSagaApi();
  const { statusType: subscriptionStatusType, subscriptionLoading } =
    useSubscriptionStatus();

  const { formData, handleChange, handleArrayChange, errors } = useForm({
    phone: "",
    country: "Nigeria",
    location: "",
    state: "",
    lga: "",
    latitude: "",
    longitude: "",
    profileImageUrl: "",
    bio: "",
    vendorDetails: {
      businessType: "",
      servicesOffered: [],
      yearsInBusiness: "",
      certifications: [],
      operatingAreas: [],
      businessRegistration: "",
      offersCredit: false,
      interests: [],
      otherInterests: "",
      additionalInfo: "",
    },
  });

  // Get available LGAs for selected state
  const availableLGAs = formData.state ? getLGAsForState(formData.state) : [];

  const isNigeria = formData.country === "Nigeria";

  const toNumericCoordinate = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const clampCoordinate = (field, value) => {
    if (field === "latitude") {
      return Math.min(90, Math.max(-90, value));
    }
    return Math.min(180, Math.max(-180, value));
  };

  const setCoordinateValue = (field, value) => {
    const numeric = toNumericCoordinate(value);
    if (numeric === null) {
      handleArrayChange(field, "");
      return;
    }

    const clamped = clampCoordinate(field, numeric);
    handleArrayChange(field, String(clamped));
  };

  const nudgeCoordinate = (field, delta) => {
    const base = toNumericCoordinate(formData[field]) ?? 0;
    const nudged = clampCoordinate(field, base + delta);
    handleArrayChange(field, nudged.toFixed(6));
  };

  const getManualPinPreviewUrl = () => {
    const latitude = toNumericCoordinate(formData.latitude);
    const longitude = toNumericCoordinate(formData.longitude);

    if (latitude === null || longitude === null) {
      return "";
    }

    const bounds = `${latitude - 0.03}%2C${longitude - 0.03}%2C${latitude + 0.03}%2C${longitude + 0.03}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bounds}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  };

  const getLocationUpdatePrompt = () => {
    const lat = Number(formData.latitude);
    const lng = Number(formData.longitude);
    const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);
    const hasAddressText =
      !!String(formData.location || "").trim() ||
      !!String(formData.lga || "").trim() ||
      !!String(formData.state || "").trim() ||
      !!String(formData.country || "").trim();

    if (hasCoordinates) {
      const withinAfrica = lat >= -35 && lat <= 38 && lng >= -20 && lng <= 55;
      if (!withinAfrica) {
        return "Your coordinates appear outside supported region and may place your map pin incorrectly. Save profile anyway?";
      }
      return "";
    }

    if (hasAddressText) {
      return "No GPS coordinates were provided. Buyers may see only an approximate map location. Continue saving your profile?";
    }

    return "Location details are incomplete and map preview may be unavailable to buyers. Continue saving your profile?";
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await sagaApi({
          service: "userApi",
          method: "getProfile",
        });
        const profile = response.data?.profile;

        if (!profile || profile.profileType !== "vendor") {
          return;
        }

        handleArrayChange("phone", profile.phone || "");
        handleArrayChange("country", profile.country || "Nigeria");
        handleArrayChange("location", profile.location || "");
        handleArrayChange("state", profile.state || "");
        handleArrayChange("lga", profile.lga || "");
        handleArrayChange(
          "latitude",
          profile.latitude ? String(profile.latitude) : "",
        );
        handleArrayChange(
          "longitude",
          profile.longitude ? String(profile.longitude) : "",
        );
        handleArrayChange("profileImageUrl", profile.profileImageUrl || "");
        handleArrayChange("bio", profile.bio || "");
        handleArrayChange("vendorDetails", {
          businessType: profile.vendorDetails?.businessType || "",
          servicesOffered: profile.vendorDetails?.servicesOffered || [],
          yearsInBusiness: profile.vendorDetails?.yearsInBusiness || "",
          certifications: profile.vendorDetails?.certifications || [],
          operatingAreas: profile.vendorDetails?.operatingAreas || [],
          businessRegistration:
            profile.vendorDetails?.businessRegistration || "",
          offersCredit: profile.vendorDetails?.offersCredit || false,
          interests: profile.vendorDetails?.interests || [],
          otherInterests: profile.vendorDetails?.otherInterests || "",
          additionalInfo: profile.vendorDetails?.additionalInfo || "",
        });
        setCustomInterests(profile.vendorDetails?.otherInterests || "");

        dispatch(setProfile(profile));
      } catch (err) {
        // Track error for display - could be email verification required or API error
        const errorMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to load profile. Please verify your email or try again.";
        setError(errorMessage);
        console.error("Error loading profile:", err);
      }
    };

    loadProfile();
  }, [dispatch, handleArrayChange, sagaApi]);

  /**
   * Handle multi-select for nested arrays
   * Correctly passes nested field path to handleArrayChange
   */
  const handleMultiSelect = (fieldName, value) => {
    const currentArray = formData.vendorDetails[fieldName] || [];
    const updated = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    // Pass nested field path with dot notation
    handleArrayChange(`vendorDetails.${fieldName}`, updated);
  };

  /**
   * Handle nested field updates (for select dropdowns)
   */
  const handleNestedChange = (fieldName, value) => {
    handleArrayChange(`vendorDetails.${fieldName}`, value);
  };

  /**
   * Get current geolocation
   */
  const handleGetLocation = () => {
    setGeoLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleArrayChange("latitude", latitude.toString());
          handleArrayChange("longitude", longitude.toString());
          handleArrayChange(
            "location",
            `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
          );
          setGeoLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError(
            "Failed to get your location. Please enable location services.",
          );
          setGeoLoading(false);
        },
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setGeoLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const locationPrompt = getLocationUpdatePrompt();
      if (locationPrompt && !window.confirm(locationPrompt)) {
        setSubmitting(false);
        return;
      }

      // Validate required fields
      if (
        !formData.phone ||
        !formData.location ||
        !formData.country ||
        !formData.state
      ) {
        throw new Error("Please fill in all required fields");
      }

      if (isNigeria && !formData.lga) {
        throw new Error("Please select your Local Government Area");
      }

      if (
        !formData.vendorDetails.businessType ||
        formData.vendorDetails.servicesOffered.length === 0 ||
        !formData.vendorDetails.yearsInBusiness ||
        formData.vendorDetails.interests.length === 0
      ) {
        throw new Error("Please complete all profile details");
      }

      const submitData = {
        ...formData,
        vendorDetails: {
          ...formData.vendorDetails,
          otherInterests: formData.vendorDetails.interests.includes(
            "Other (Please specify)",
          )
            ? customInterests
            : "",
        },
      };

      const response = await sagaApi({
        service: "userApi",
        method: "completeVendorProfile",
        args: [submitData],
      });

      setSuccess(true);

      // Dispatch to update redux state with profile data
      if (response?.data?.profile) {
        dispatch(
          setProfile({
            ...response.data.profile,
            profileType: "vendor",
          }),
        );
      } else {
        // If API doesn't return profile, at least ensure profileType is set
        dispatch(setProfile({ profileType: "vendor" }));
      }

      // Redirect to vendor dashboard after 2 seconds
      setTimeout(() => {
        navigate("/vendor-dashboard");
      }, 2000);
    } catch (err) {
      setError(err.message || "Error saving profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="profile-form-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Profile Completed Successfully!</h2>
          <p>Your vendor profile has been saved. Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const canUseProfile = canAccessFeature(subscriptionStatusType, "profile");

  if (subscriptionLoading)
    return <div style={{ padding: "24px" }}>Loading...</div>;

  if (!canUseProfile) {
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
          Complete Your Profile
        </h1>
        <p
          style={{
            fontSize: "clamp(14px, 2vw, 16px)",
            color: "#666",
            marginBottom: "24px",
          }}
        >
          You need an active subscription to complete and manage your profile.
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
    <div className="profile-form-container">
      <form className="vendor-profile-form" onSubmit={handleSubmit} noValidate>
        <h1>Complete Your Vendor Profile</h1>
        <p className="form-subtitle">
          Help farmers find and connect with your services
        </p>

        {error && (
          <ErrorDisplay
            error={error}
            errorCode={
              error.includes("verification") ? "EMAIL_NOT_VERIFIED" : undefined
            }
            onRetry={() => window.location.reload()}
            showDismiss={false}
          />
        )}

        {/* Contact & Location */}
        <div className="form-section">
          <h2>Contact & Location</h2>

          <div className="form-group">
            <label htmlFor="country">Country *</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={(event) => {
                handleChange(event);
                handleArrayChange("state", "");
                handleArrayChange("lga", "");
              }}
              required
            >
              <option value="">Select Country</option>
              {africanCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g., +234 800 000 0000"
              required
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="state">State/Region *</label>
              {isNigeria ? (
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select State</option>
                  {nigerianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state or region"
                  required
                />
              )}
              {errors.state && <span className="error">{errors.state}</span>}
            </div>

            {isNigeria && (
              <div className="form-group">
                <label htmlFor="lga">Local Government Area *</label>
                <select
                  id="lga"
                  name="lga"
                  value={formData.lga}
                  onChange={handleChange}
                  required
                  disabled={!formData.state}
                >
                  <option value="">Select LGA</option>
                  {availableLGAs.map((lga) => (
                    <option key={lga} value={lga}>
                      {lga}
                    </option>
                  ))}
                </select>
                {!formData.state && (
                  <small className="hint">Please select a state first</small>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="location">Specific Location/Address *</label>
            <div className="location-input-group">
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Your business location/address"
                required
              />
              <button
                type="button"
                className="geolocation-btn"
                onClick={handleGetLocation}
                disabled={geoLoading}
              >
                {geoLoading ? "Getting Location..." : "📍 Use GPS"}
              </button>
            </div>
            {errors.location && (
              <span className="error">{errors.location}</span>
            )}
            <small className="hint">
              {formData.latitude &&
                `Coordinates: ${formData.latitude}, ${formData.longitude}`}
            </small>

            <div className="manual-pin-editor">
              <p className="manual-pin-title">Manually correct map pin</p>
              <p className="manual-pin-subtitle">
                Fine-tune your latitude and longitude if GPS pin is off.
              </p>

              <div className="manual-pin-grid">
                <div className="form-group">
                  <label htmlFor="manual-latitude">Latitude</label>
                  <input
                    id="manual-latitude"
                    type="number"
                    step="0.000001"
                    min="-90"
                    max="90"
                    value={formData.latitude}
                    onChange={(event) =>
                      setCoordinateValue("latitude", event.target.value)
                    }
                    placeholder="e.g. 6.5244"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="manual-longitude">Longitude</label>
                  <input
                    id="manual-longitude"
                    type="number"
                    step="0.000001"
                    min="-180"
                    max="180"
                    value={formData.longitude}
                    onChange={(event) =>
                      setCoordinateValue("longitude", event.target.value)
                    }
                    placeholder="e.g. 3.3792"
                  />
                </div>
              </div>

              <div className="manual-pin-controls">
                <button
                  type="button"
                  className="pin-adjust-btn"
                  onClick={() => nudgeCoordinate("latitude", 0.0005)}
                >
                  Move North
                </button>
                <button
                  type="button"
                  className="pin-adjust-btn"
                  onClick={() => nudgeCoordinate("latitude", -0.0005)}
                >
                  Move South
                </button>
                <button
                  type="button"
                  className="pin-adjust-btn"
                  onClick={() => nudgeCoordinate("longitude", 0.0005)}
                >
                  Move East
                </button>
                <button
                  type="button"
                  className="pin-adjust-btn"
                  onClick={() => nudgeCoordinate("longitude", -0.0005)}
                >
                  Move West
                </button>
              </div>

              {getManualPinPreviewUrl() ? (
                <iframe
                  title="manual-pin-preview-vendor"
                  className="manual-pin-map"
                  src={getManualPinPreviewUrl()}
                  loading="lazy"
                />
              ) : (
                <small className="hint">
                  Enter both coordinates to preview corrected pin.
                </small>
              )}
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="form-section">
          <h2>Business Information</h2>

          <div className="form-group">
            <label htmlFor="businessType">Business Type *</label>
            <select
              id="businessType"
              name="businessType"
              value={formData.vendorDetails.businessType}
              onChange={(e) =>
                handleNestedChange("businessType", e.target.value)
              }
              required
            >
              <option value="">Select Business Type</option>
              {vendorBusinessTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Services Offered *</label>
            <div className="checkbox-group">
              {vendorInterests.slice(0, -1).map((service) => (
                <label key={service} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.vendorDetails.servicesOffered.includes(
                      service,
                    )}
                    onChange={() =>
                      handleMultiSelect("servicesOffered", service)
                    }
                  />
                  <span>{service}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="yearsInBusiness">Years in Business *</label>
              <select
                id="yearsInBusiness"
                name="yearsInBusiness"
                value={formData.vendorDetails.yearsInBusiness}
                onChange={(e) =>
                  handleNestedChange("yearsInBusiness", e.target.value)
                }
                required
              >
                <option value="">Select Years</option>
                {yearsOfExperience.map((years) => (
                  <option key={years} value={years}>
                    {years}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="businessRegistration">
                Business Registration Number
              </label>
              <input
                type="text"
                id="businessRegistration"
                name="businessRegistration"
                value={formData.vendorDetails.businessRegistration}
                onChange={(e) =>
                  handleNestedChange("businessRegistration", e.target.value)
                }
                placeholder="e.g., BN/123456"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.vendorDetails.offersCredit}
                onChange={(e) =>
                  handleNestedChange("offersCredit", e.target.checked)
                }
              />
              <span>We offer credit/financing options</span>
            </label>
          </div>
        </div>

        {/* Service Coverage & Details */}
        <div className="form-section">
          <h2>Service Coverage & Details</h2>

          <div className="form-group">
            <label>Certifications & Compliance</label>
            <div className="checkbox-group">
              {certifications.map((cert) => (
                <label key={cert} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.vendorDetails.certifications.includes(
                      cert,
                    )}
                    onChange={() => handleMultiSelect("certifications", cert)}
                  />
                  <span>{cert}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>What are you interested in? * (Select all that apply)</label>
            <div className="checkbox-group">
              {vendorInterests.map((interest) => (
                <label key={interest} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.vendorDetails.interests.includes(
                      interest,
                    )}
                    onChange={() => handleMultiSelect("interests", interest)}
                  />
                  <span>{interest}</span>
                </label>
              ))}
            </div>
          </div>

          {formData.vendorDetails.interests.includes(
            "Other (Please specify)",
          ) && (
            <div className="form-group">
              <label htmlFor="customInterests">
                Please specify other interests
              </label>
              <textarea
                id="customInterests"
                value={customInterests}
                onChange={(e) => setCustomInterests(e.target.value)}
                placeholder="Enter other interests here..."
                rows="3"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="bio">About Your Business</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about your business and what you offer..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="profileImageUrl">Profile Image URL</label>
            <input
              type="url"
              id="profileImageUrl"
              name="profileImageUrl"
              value={formData.profileImageUrl || ""}
              onChange={handleChange}
              placeholder="https://example.com/your-business-logo.jpg"
            />
            {formData.profileImageUrl && (
              <img
                src={formData.profileImageUrl}
                alt="Profile preview"
                style={{
                  marginTop: "10px",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #ddd",
                }}
              />
            )}
          </div>

          <div className="form-group">
            <label htmlFor="additionalInfo">Additional Information</label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.vendorDetails.additionalInfo}
              onChange={(e) =>
                handleNestedChange("additionalInfo", e.target.value)
              }
              placeholder="Any other details you'd like to share..."
              rows="3"
            />
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={submitting}>
          {submitting ? "Saving Profile..." : "Complete Profile"}
        </button>
      </form>
    </div>
  );
};

export default VendorProfileForm;
