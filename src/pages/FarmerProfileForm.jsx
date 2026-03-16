import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import "./FarmerProfileForm.css";
import useSubscriptionStatus from "../hooks/useSubscriptionStatus";
import { useForm } from "../hooks/useForm";
import { setProfile } from "../redux/slices/userSlice";
import { canAccessFeature } from "../utils/subscriptionHelper";
import useSagaApi from "../hooks/useSagaApi";
import {
  nigerianStates,
  farmingAreas,
  crops,
  animals,
  farmSizes,
  yearsOfExperience,
  certifications,
  farmerInterests,
  getLGAsForState,
} from "../data/nigerianGeoData";

/**
 * Farmer Profile Form Component
 * Collects detailed farmer information with dropdown fields and geolocation
 */
const FarmerProfileForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [customInterests, setCustomInterests] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const sagaApi = useSagaApi();
  const { statusType: subscriptionStatusType, subscriptionLoading } = useSubscriptionStatus();

  const { formData, handleChange, handleArrayChange, errors } = useForm({
    phone: "",
    location: "",
    state: "",
    lga: "",
    latitude: "",
    longitude: "",
    bio: "",
    farmerDetails: {
      farmingAreas: [],
      cropsProduced: [],
      animalsRaised: [],
      farmSize: "",
      yearsOfExperience: "",
      certifications: [],
      interests: [],
      otherInterests: "",
      additionalInfo: "",
    },
  });

  // Get available LGAs for selected state
  const availableLGAs = formData.state
    ? getLGAsForState(formData.state)
    : [];

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await sagaApi({ service: "userApi", method: "getProfile" });
        const profile = response.data?.profile;

        if (!profile || profile.profileType !== "farmer") {
          return;
        }

        handleArrayChange("phone", profile.phone || "");
        handleArrayChange("location", profile.location || "");
        handleArrayChange("state", profile.state || "");
        handleArrayChange("lga", profile.lga || "");
        handleArrayChange("latitude", profile.latitude ? String(profile.latitude) : "");
        handleArrayChange("longitude", profile.longitude ? String(profile.longitude) : "");
        handleArrayChange("bio", profile.bio || "");
        handleArrayChange("farmerDetails", {
          farmingAreas: profile.farmerDetails?.farmingAreas || [],
          cropsProduced: profile.farmerDetails?.cropsProduced || [],
          animalsRaised: profile.farmerDetails?.animalsRaised || [],
          farmSize: profile.farmerDetails?.farmSize || "",
          yearsOfExperience: profile.farmerDetails?.yearsOfExperience || "",
          certifications: profile.farmerDetails?.certifications || [],
          interests: profile.farmerDetails?.interests || [],
          otherInterests: profile.farmerDetails?.otherInterests || "",
          additionalInfo: profile.farmerDetails?.additionalInfo || "",
        });
        setCustomInterests(profile.farmerDetails?.otherInterests || "");

        dispatch(setProfile(profile));
      } catch {
        // Profile may not exist yet for first-time users.
      }
    };

    loadProfile();
  }, [dispatch, handleArrayChange, sagaApi]);

  /**
   * Handle multi-select for nested arrays
   * Correctly passes nested field path to handleArrayChange
   */
  const handleMultiSelect = (fieldName, value) => {
    const currentArray = formData.farmerDetails[fieldName] || [];
    const updated = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    // Pass nested field path with dot notation
    handleArrayChange(`farmerDetails.${fieldName}`, updated);
  };

  /**
   * Handle nested field updates (for select dropdowns)
   */
  const handleNestedChange = (fieldName, value) => {
    handleArrayChange(`farmerDetails.${fieldName}`, value);
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
            `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`
          );
          setGeoLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError("Failed to get your location. Please enable location services.");
          setGeoLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setGeoLoading(false);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate required fields
      if (!formData.phone || !formData.location || !formData.state) {
        throw new Error("Please fill in all required fields");
      }

      if (!formData.lga) {
        throw new Error("Please select your Local Government Area");
      }

      if (
        formData.farmerDetails.farmingAreas.length === 0 ||
        formData.farmerDetails.cropsProduced.length === 0 ||
        !formData.farmerDetails.yearsOfExperience ||
        formData.farmerDetails.interests.length === 0
      ) {
        throw new Error("Please complete all profile details");
      }

      const submitData = {
        ...formData,
        farmerDetails: {
          ...formData.farmerDetails,
          otherInterests:
            formData.farmerDetails.interests.includes("Other (Please specify)")
              ? customInterests
              : "",
        },
      };

      const response = await sagaApi({
        service: "userApi",
        method: "completeFarmerProfile",
        args: [submitData],
      });

      setSuccess(true);

      // Dispatch to update redux state with profile data
      if (response?.data?.profile) {
        dispatch(
          setProfile({
            ...response.data.profile,
            profileType: "farmer",
          })
        );
      } else {
        // If API doesn't return profile, at least ensure profileType is set
        dispatch(setProfile({ profileType: "farmer" }));
      }

      // Redirect to farmer dashboard after 2 seconds
      setTimeout(() => {
        navigate("/farmer-dashboard");
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
          <p>Your farmer profile has been saved. Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const canUseProfile = canAccessFeature(subscriptionStatusType, "profile");

  if (subscriptionLoading) return <div style={{ padding: "24px" }}>Loading...</div>;

  if (!canUseProfile) {
    return (
      <div style={{ padding: "clamp(16px, 4vw, 32px)", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", color: "#193325", marginBottom: "16px" }}>
          Complete Your Profile
        </h1>
        <p style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "#666", marginBottom: "24px" }}>
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
      <form className="farmer-profile-form" onSubmit={handleSubmit}>
        <h1>Complete Your Farmer Profile</h1>
        <p className="form-subtitle">
          Help us understand your farming background and interests
        </p>

        {error && <div className="error-message">{error}</div>}

        {/* Contact Information */}
        <div className="form-section">
          <h2>Contact Information</h2>

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
              <label htmlFor="state">State *</label>
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
              {errors.state && <span className="error">{errors.state}</span>}
            </div>

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
                <small className="hint">
                  Please select a state first
                </small>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Specific Location *</label>
            <div className="location-input-group">
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Yaba, Lagos or your address"
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
            {errors.location && <span className="error">{errors.location}</span>}
            <small className="hint">
              {formData.latitude &&
                `Coordinates: ${formData.latitude}, ${formData.longitude}`}
            </small>
          </div>
        </div>

        {/* Farming Background */}
        <div className="form-section">
          <h2>Farming Background</h2>

          <div className="form-group">
            <label>Farming Areas *</label>
            <div className="checkbox-group">
              {farmingAreas.map((area) => (
                <label key={area} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.farmerDetails.farmingAreas.includes(area)}
                    onChange={() => handleMultiSelect("farmingAreas", area)}
                  />
                  <span>{area}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Crops Produced *</label>
            <div className="checkbox-group">
              {crops.map((crop) => (
                <label key={crop} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.farmerDetails.cropsProduced.includes(crop)}
                    onChange={() => handleMultiSelect("cropsProduced", crop)}
                  />
                  <span>{crop}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Animals/Livestock Raised</label>
            <div className="checkbox-group">
              {animals.map((animal) => (
                <label key={animal} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.farmerDetails.animalsRaised.includes(
                      animal
                    )}
                    onChange={() => handleMultiSelect("animalsRaised", animal)}
                  />
                  <span>{animal}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="farmSize">Farm Size</label>
              <select
                id="farmSize"
                name="farmSize"
                value={formData.farmerDetails.farmSize}
                onChange={(e) => handleNestedChange("farmSize", e.target.value)}
              >
                <option value="">Select Farm Size</option>
                {farmSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="experience">Years of Experience *</label>
              <select
                id="experience"
                name="yearsOfExperience"
                value={formData.farmerDetails.yearsOfExperience}
                onChange={(e) =>
                  handleNestedChange("yearsOfExperience", e.target.value)
                }
                required
              >
                <option value="">Select Experience</option>
                {yearsOfExperience.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Qualifications & Interests */}
        <div className="form-section">
          <h2>Qualifications & Interests</h2>

          <div className="form-group">
            <label>Certifications</label>
            <div className="checkbox-group">
              {certifications.map((cert) => (
                <label key={cert} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.farmerDetails.certifications.includes(
                      cert
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
              {farmerInterests.map((interest) => (
                <label key={interest} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.farmerDetails.interests.includes(
                      interest
                    )}
                    onChange={() => handleMultiSelect("interests", interest)}
                  />
                  <span>{interest}</span>
                </label>
              ))}
            </div>
          </div>

          {formData.farmerDetails.interests.includes(
            "Other (Please specify)"
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
            <label htmlFor="bio">About You</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a bit about your farming and what you're looking for..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="additionalInfo">Additional Information</label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.farmerDetails.additionalInfo}
              onChange={(e) =>
                handleNestedChange("additionalInfo", e.target.value)
              }
              placeholder="Any other details you'd like to share..."
              rows="3"
            />
          </div>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={submitting}
        >
          {submitting ? "Saving Profile..." : "Complete Profile"}
        </button>
      </form>
    </div>
  );
};

export default FarmerProfileForm;
