import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaTractor, FaStore } from "react-icons/fa";
import "./ProfileTypeSelector.css";
import useSubscriptionStatus from "../hooks/useSubscriptionStatus";
import { setProfile } from "../redux/slices/userSlice";
import { canAccessFeature } from "../utils/subscriptionHelper";
import useSagaApi from "../hooks/useSagaApi";

/**
 * Profile Type Selector Component
 * Allows user to choose between Farmer and Vendor profile type
 */
const ProfileTypeSelector = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [selectedType, setSelectedType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const sagaApi = useSagaApi();
  const { statusType: subscriptionStatusType, subscriptionLoading } = useSubscriptionStatus();

  useEffect(() => {
    const syncProfile = async () => {
      if (user && user.profileType) {
        navigate(`/profile/${user.profileType}`);
        return;
      }

      try {
        const response = await sagaApi({ service: "userApi", method: "getProfile" });
        const profile = response.data?.profile;

        if (profile?.profileType) {
          dispatch(setProfile(profile));
          navigate(`/profile/${profile.profileType}`);
        }
      } catch {
        // Ignore missing profile and allow manual type selection.
      }
    };

    syncProfile();
  }, [user, navigate, dispatch, sagaApi]);

  const canUseProfile = canAccessFeature(subscriptionStatusType, "profile");

  const handleSelectType = async (type) => {
    setSelectedType(type);
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await sagaApi({
        service: "userApi",
        method: "initializeProfile",
        args: [type],
      });
      
      // Store profile type in redux
      dispatch(setProfile(response.data?.profile || { profileType: type }));

      // Redirect to profile completion form
      navigate(`/profile/${type}`);
    } catch (err) {
      console.error("Error initializing profile:", err);
      
      // Handle specific error codes
      if (err.response?.data?.code === "PROFILE_ALREADY_COMPLETE") {
        setErrorMessage("Your profile is already complete. Redirecting...");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setErrorMessage(err.response?.data?.error || "Failed to initialize profile. Please try again.");
        setSubmitting(false);
      }
    }
  };

  if (subscriptionLoading) {
    return <div style={{ padding: "24px" }}>Loading...</div>;
  }

  if (!canUseProfile) {
    return (
      <div style={{ padding: "clamp(16px, 4vw, 32px)", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", color: "#193325", marginBottom: "16px" }}>
          Complete Your Profile
        </h1>
        <p style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "#666", marginBottom: "24px" }}>
          You need an active subscription before creating a profile.
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
    <div className="profile-type-selector-container">
      <div className="profile-type-selector">
        <h1>Complete Your Profile</h1>
        <p className="subtitle">
          Help us match you with the right partners. What's your role?
        </p>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <div className="type-options">
          <div
            className={`type-card farmer ${selectedType === "farmer" ? "selected" : ""}`}
            onClick={() => handleSelectType("farmer")}
            disabled={submitting}
          >
            <div className="type-icon">
              <FaTractor size={48} color="#3b7a57" />
            </div>
            <h2>Farmer</h2>
            <p>I grow crops or raise animals</p>
            <ul className="type-benefits">
              <li>Connect with suppliers and service providers</li>
              <li>Find market opportunities</li>
              <li>Get expert advice</li>
            </ul>
          </div>

          <div
            className={`type-card vendor ${selectedType === "vendor" ? "selected" : ""}`}
            onClick={() => handleSelectType("vendor")}
            disabled={submitting}
          >
            <div className="type-icon">
              <FaStore size={48} color="#7c4f2c" />
            </div>
            <h2>Vendor</h2>
            <p>I provide agricultural services or products</p>
            <ul className="type-benefits">
              <li>Find farmers who need your services</li>
              <li>Expand your customer base</li>
              <li>Build lasting partnerships</li>
            </ul>
          </div>
        </div>

        {submitting && <div className="loading">Setting up your profile...</div>}
      </div>
    </div>
  );
};

export default ProfileTypeSelector;
